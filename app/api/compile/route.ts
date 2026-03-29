export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { extractTextFromBuffer } from '@/lib/extractText'
import { getFileType } from '@/lib/fileHelpers'
import { checkAndIncrementUsage } from '@/lib/usage'
import { compileNotes } from '@/lib/anthropic'
import { stitchIdeas } from '@/lib/stitchIdeas'
import { cleanMessyNotes } from '@/lib/cleanMessyNotes'
import { IntentType } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface CompileRequestBody {
  fileIds: string[]
  intent: IntentType
  templateId?: string
  messyNotes?: boolean
}

function err(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status })
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    let response = NextResponse.next({ request: req })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            response = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 'UNAUTHORIZED', 401)

    // 2. Usage check
    const { allowed, profile } = await checkAndIncrementUsage(user.id, user.email ?? '')
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Monthly limit reached',
          code: 'USAGE_LIMIT',
          usage: { used: profile.compilations_used, limit: profile.compilations_limit },
        },
        { status: 403 }
      )
    }

    const body: CompileRequestBody = await req.json()
    const { fileIds, intent, templateId, messyNotes } = body

    if (!fileIds?.length) return err('No files provided', 'NO_FILES', 400)
    if (!intent) return err('No intent provided', 'NO_INTENT', 400)

    // 3. Load source file records
    const { data: sourceFiles, error: dbError } = await supabaseAdmin
      .from('source_files')
      .select('*')
      .in('id', fileIds)

    if (dbError || !sourceFiles?.length) {
      return err('Files not found', 'NOT_FOUND', 404)
    }

    // 4. Extract text from each source
    const sources: { fileName: string; text: string }[] = []

    for (const record of sourceFiles) {
      // URL sources already have text pre-populated
      if (record.file_type === 'url' && record.extracted_text) {
        sources.push({ fileName: record.file_name, text: record.extracted_text })
        continue
      }

      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from('uploads')
        .download(record.storage_path)

      if (downloadError || !fileData) {
        return err(`Failed to download ${record.file_name}`, 'DOWNLOAD_ERROR', 500)
      }

      const buffer = Buffer.from(await fileData.arrayBuffer())
      const fileType = getFileType({ type: record.file_type } as File)

      let text = record.extracted_text
      if (!text) {
        try {
          text = await extractTextFromBuffer(buffer, fileType, record.file_type)
          await supabaseAdmin
            .from('source_files')
            .update({ extracted_text: text })
            .eq('id', record.id)
        } catch (e) {
          console.error(`[compile] extraction failed for ${record.file_name}:`, e)
          return err(`Could not extract text from ${record.file_name}`, 'EXTRACTION_ERROR', 500)
        }
      }

      sources.push({ fileName: record.file_name, text })
    }

    // 5. Messy Notes Mode — clean disorganised text before stitching
    const cleanedSources = messyNotes
      ? await Promise.all(
          sources.map(async (s) => ({ ...s, text: await cleanMessyNotes(s.text) }))
        )
      : sources

    // 6. Idea Stitching — detect repeated ideas and contradictions
    const { sources: stitchedSources, report: stitchReport } = stitchIdeas(cleanedSources)

    // 7. Compile with Claude
    const compilationId = uuidv4()
    let output

    try {
      output = await compileNotes(stitchedSources, intent, templateId, stitchReport)
    } catch (e) {
      console.error('[compile] Claude error:', e)
      await supabaseAdmin.from('compilations').insert({
        id: compilationId,
        user_id: user.id,
        intent,
        status: 'failed',
        output: null,
      })
      return err(
        e instanceof Error ? e.message : 'Compilation failed',
        'CLAUDE_ERROR',
        500
      )
    }

    // 8. Save result
    const { error: saveError } = await supabaseAdmin.from('compilations').insert({
      id: compilationId,
      user_id: user.id,
      intent,
      status: 'complete',
      output,
      stitch_report: stitchReport,
    })

    if (saveError) {
      console.error('[compile] save error:', saveError)
      return err(saveError.message, 'SAVE_ERROR', 500)
    }

    await supabaseAdmin
      .from('source_files')
      .update({ compilation_id: compilationId })
      .in('id', fileIds)

    return NextResponse.json({
      compilationId,
      output,
      usage: { used: profile.compilations_used, limit: profile.compilations_limit },
    })
  } catch (e) {
    console.error('[compile] unexpected error:', e)
    return err('Unexpected server error', 'INTERNAL', 500)
  }
}
