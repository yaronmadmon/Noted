import { FileCategory } from './fileHelpers'
import { transcribeAudio } from './transcribeAudio'

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: FileCategory,
  mimeType: string
): Promise<string> {
  switch (fileType) {
    case 'text':
      return buffer.toString('utf-8')
    case 'image':
      return extractViaGoogleVision(buffer)
    case 'pdf':
      return extractFromPdf(buffer)
    case 'audio':
      return transcribeAudio(buffer, mimeType)
    case 'url':
      return buffer.toString('utf-8')
    default:
      return buffer.toString('utf-8')
  }
}

async function extractViaGoogleVision(buffer: Buffer): Promise<string> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) throw new Error('GOOGLE_VISION_API_KEY is not set')

  const base64 = buffer.toString('base64')

  const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Google Vision API error: ${res.statusText}`)

  const data = await res.json()
  const text: string = data.responses?.[0]?.fullTextAnnotation?.text ?? ''
  if (!text) throw new Error('No text detected in image')
  return text
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse is a CommonJS module
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    const text = data.text?.trim() ?? ''
    if (text.length > 0) return text
  } catch {
    // fall through to fallback
  }

  // Fallback: basic text extraction for simple PDFs
  const content = buffer.toString('latin1')
  const matches = content.match(/BT[\s\S]*?ET/g) ?? []
  const lines: string[] = []
  for (const block of matches) {
    const tjMatches = block.match(/\(([^)]{1,200})\)\s*Tj/g) ?? []
    for (const tj of tjMatches) {
      const text = tj.match(/\(([^)]+)\)/)?.[1]
      if (text && /[a-zA-Z0-9]/.test(text)) lines.push(text)
    }
  }

  const extracted = lines.join(' ').trim()
  return extracted || '[Could not extract text from PDF — try copying text manually]'
}
