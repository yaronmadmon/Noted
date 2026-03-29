import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { validateFile, getFileType } from '@/lib/fileHelpers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const { valid, error } = validateFile(file)
  if (!valid) {
    return NextResponse.json({ error }, { status: 422 })
  }

  const fileId = uuidv4()
  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `uploads/${fileId}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: storageError } = await supabaseAdmin.storage
    .from('uploads')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (storageError) {
    return NextResponse.json(
      { error: `Storage error: ${storageError.message}` },
      { status: 500 }
    )
  }

  const { error: dbError } = await supabaseAdmin.from('source_files').insert({
    id: fileId,
    file_name: file.name,
    file_type: getFileType(file),
    storage_path: storagePath,
    extracted_text: '',
  })

  if (dbError) {
    return NextResponse.json(
      { error: `Database error: ${dbError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ fileId, storagePath })
}
