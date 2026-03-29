import Anthropic from '@anthropic-ai/sdk'
import { IntentType, CompilationOutput } from '@/types'
import { buildCompilePrompt } from './prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function compileNotes(
  sourceTexts: { fileName: string; text: string }[],
  intent: IntentType,
  templateId?: string
): Promise<CompilationOutput> {
  const prompt = buildCompilePrompt(intent, sourceTexts, templateId)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0]
  if (raw.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Strip markdown fences if Claude wraps the JSON anyway
  const cleaned = raw.text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

  return JSON.parse(cleaned) as CompilationOutput
}
