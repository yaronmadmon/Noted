import { NextRequest, NextResponse } from 'next/server'
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
}

export async function POST(req: NextRequest) {
  // 1. Usage check
  let sessionId = req.cookies.get('session_id')?.value
  if (!sessionId) sessionId = uuidv4()

  const { allowed, profile } = await checkAndIncrementUsage(sessionId)

  if (!allowed) {
    return NextResponse.json(
      {
        error: `Free tier limit reached (${profile.compilations_limit} compilations/month).`,
        usage: { used: profile.compilations_used, limit: profile.compilations_limit },
      },
      { status: 429 }
    )
  }

  const body: CompileRequestBody = await req.json()
  const { fileIds, intent } = body

  if (!fileIds?.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }
  if (!intent) {
    return NextResponse.json({ error: 'No intent provided' }, { status: 400 })
  }

  // 2. Load source file records from DB
  const { data: sourceFiles, error: dbError } = await supabaseAdmin
    .from('source_files')
    .select('*')
    .in('id', fileIds)

  if (dbError || !sourceFiles?.length) {
    return NextResponse.json({ error: 'Files not found' }, { status: 404 })
  }

  // 3. Download each file and extract text
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

    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
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

  // 4. Send to Claude
  let output
  try {
    output = await compileNotes(sources, intent)
  } catch (err) {
    await supabaseAdmin.from('compilations').insert({
      id: uuidv4(),
      user_id: sessionId,
      intent,
      status: 'failed',
      output: null,
    })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Compilation failed' },
      { status: 500 }
    )
  }

  // 5. Save compilation result to DB
  const compilationId = uuidv4()
  const { error: saveError } = await supabaseAdmin.from('compilations').insert({
    id: compilationId,
    user_id: sessionId,
    intent,
    status: 'complete',
    output,
  })

  if (saveError) {
    return NextResponse.json(
      { error: `Failed to save compilation: ${saveError.message}` },
      { status: 500 }
    )
  }

  await supabaseAdmin
    .from('source_files')
    .update({ compilation_id: compilationId })
    .in('id', fileIds)

  const res = NextResponse.json({
    compilationId,
    output,
    usage: { used: profile.compilations_used, limit: profile.compilations_limit },
  })

  // Set session cookie if new
  res.cookies.set('session_id', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  return res
}
