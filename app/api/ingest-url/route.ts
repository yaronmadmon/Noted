import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { v4 as uuidv4 } from 'uuid'

const BLOCKED_HOSTNAMES = ['localhost', '0.0.0.0', '::1']
const BLOCKED_PREFIXES = ['10.', '172.16.', '172.17.', '172.18.', '172.19.',
  '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.',
  '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.',
  '192.168.', '127.']

function isSafeUrl(url: URL): boolean {
  if (!['http:', 'https:'].includes(url.protocol)) return false
  const host = url.hostname.toLowerCase()
  if (BLOCKED_HOSTNAMES.includes(host)) return false
  if (BLOCKED_PREFIXES.some((p) => host.startsWith(p))) return false
  return true
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(nav|footer|header|aside|noscript)[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractTitle(html: string, fallback: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? match[1].trim() : fallback
}

function err(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status })
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
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

    const body = await req.json()
    const rawUrl: string = body.url?.trim() ?? ''

    let parsed: URL
    try {
      parsed = new URL(rawUrl)
    } catch {
      return err('Invalid URL', 'INVALID_URL', 422)
    }

    if (!isSafeUrl(parsed)) {
      return err('URL not allowed', 'BLOCKED_URL', 422)
    }

    // Fetch with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    let html: string
    try {
      const fetchRes = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KnowledgeCompiler/1.0)' },
        redirect: 'follow',
      })
      clearTimeout(timeout)
      if (!fetchRes.ok) return err(`Failed to fetch URL: ${fetchRes.status}`, 'FETCH_ERROR', 422)
      html = await fetchRes.text()
    } catch (e) {
      clearTimeout(timeout)
      return err('Could not reach URL', 'FETCH_ERROR', 422)
    }

    const title = extractTitle(html, parsed.hostname)
    let text = stripHtml(html)

    const MAX_CHARS = 20000
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS) + '\n\n[Content truncated at 20,000 characters]'
    }

    const fileId = uuidv4()
    const { error: dbError } = await supabaseAdmin.from('source_files').insert({
      id: fileId,
      file_name: title,
      file_type: 'url',
      storage_path: '',
      extracted_text: text,
    })

    if (dbError) {
      console.error('[ingest-url] db error', dbError)
      return err(dbError.message, 'DB_ERROR', 500)
    }

    return NextResponse.json({ fileId, title })
  } catch (e) {
    console.error('[ingest-url] unexpected error', e)
    return err('Unexpected server error', 'INTERNAL', 500)
  }
}
