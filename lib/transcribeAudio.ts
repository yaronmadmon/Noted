import OpenAI from 'openai'
import { toFile } from 'openai'

const MIME_TO_EXT: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp4': 'mp4',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/m4a': 'm4a',
  'audio/x-m4a': 'm4a',
  'video/mp4': 'mp4',
}

export async function transcribeAudio(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const client = new OpenAI({ apiKey })
  const ext = MIME_TO_EXT[mimeType] ?? 'mp3'
  const file = await toFile(buffer, `audio.${ext}`, { type: mimeType })

  const transcription = await client.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'text',
  })

  return typeof transcription === 'string' ? transcription : (transcription as { text: string }).text
}
