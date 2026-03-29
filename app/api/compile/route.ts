import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { extractTextFromBuffer } from '@/lib/extractText'
import { getFileType } from '@/lib/fileHelpers'
import { checkAndIncrementUsage } from '@/lib/usage'
import { compileNotes } from '@/lib/anthropic'
import { IntentType } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface CompileRequestBody {
  fileIds: string[]
  intent: IntentType
  templateId?: string
}

export async function POST(req: NextRequest) {
  // 1. Get authenticated user
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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Usage check
  const { allowed, profile } = await checkAndIncrementUsage(user.id, user.email ?? '')

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Monthly limit reached',
        usage: { used: profile.compilations_used, limit: profile.compilations_limit },
      },
      { status: 403 }
    )
  }

  const body: CompileRequestBody = await req.json()
  const { fileIds, intent, templateId } = body

  if (!fileIds?.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }
  if (!intent) {
    return NextResponse.json({ error: 'No intent provided' }, { status: 400 })
  }

  // 3. Load source file records
  const { data: sourceFiles, error: dbError } = await supabaseAdmin
    .from('source_files')
    .select('*')
    .in('id', fileIds)

  if (dbError || !sourceFiles?.length) {
    return NextResponse.json({ error: 'Files not found' }, { status: 404 })
  }

  // 4. Download and extract text
  const sources: { fileName: string; text: string }[] = []

  for (const record of sourceFiles) {
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('uploads')
      .download(record.storage_path)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: `Failed to download ${record.file_name}: ${downloadError?.message}` },
        { status: 500 }
      )
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const fileType = getFileType({ type: record.file_type } as File)

    let text = record.extracted_text
    if (!text) {
      text = await extractTextFromBuffer(buffer, fileType, record.file_type)
      await supabaseAdmin
        .from('source_files')
        .update({ extracted_text: text })
        .eq('id', record.id)
    }

    sources.push({ fileName: record.file_name, text })
  }

  // 5. Send to Claude
  const compilationId = uuidv4()
  let output

  try {
    output = await compileNotes(sources, intent, templateId)
  } catch (err) {
    await supabaseAdmin.from('compilations').insert({
      id: compilationId,
      user_id: user.id,
      intent,
      status: 'failed',
      output: null,
    })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Compilation failed' },
      { status: 500 }
    )
  }

  // 6. Save result
  const { error: saveError } = await supabaseAdmin.from('compilations').insert({
    id: compilationId,
    user_id: user.id,
    intent,
    status: 'complete',
    output,
  })

  if (saveError) {
    return NextResponse.json(
      { error: `Failed to save: ${saveError.message}` },
      { status: 500 }
    )
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
}
