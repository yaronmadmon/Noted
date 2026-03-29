export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { validateFile, getFileType } from '@/lib/fileHelpers'
import { v4 as uuidv4 } from 'uuid'

function err(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return err('No file provided', 'NO_FILE', 400)
    }

    const { valid, error } = validateFile(file)
    if (!valid) {
      return err(error ?? 'Invalid file', 'INVALID_FILE', 422)
    }

    const fileId = uuidv4()
    const ext = file.name.split('.').pop() ?? 'bin'
    const storagePath = `uploads/${fileId}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: storageError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(storagePath, buffer, { contentType: file.type, upsert: false })

    if (storageError) {
      console.error('[upload] storage error', storageError)
      return err(storageError.message, 'STORAGE_ERROR', 500)
    }

    const { error: dbError } = await supabaseAdmin.from('source_files').insert({
      id: fileId,
      file_name: file.name,
      file_type: getFileType(file),
      storage_path: storagePath,
      extracted_text: '',
    })

    if (dbError) {
      console.error('[upload] db error', dbError)
      return err(dbError.message, 'DB_ERROR', 500)
    }

    return NextResponse.json({ fileId, storagePath })
  } catch (e) {
    console.error('[upload] unexpected error', e)
    return err('Unexpected server error', 'INTERNAL', 500)
  }
}
