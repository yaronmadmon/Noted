import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const { data: compilation, error } = await supabaseAdmin
    .from('compilations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !compilation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: sourceFiles } = await supabaseAdmin
    .from('source_files')
    .select('id, file_name, file_type')
    .eq('compilation_id', id)

  return NextResponse.json({
    status: compilation.status,
    output: compilation.output,
    sourceFiles: sourceFiles ?? [],
  })
}
