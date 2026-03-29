import OpenAI from 'openai'
import { IntentType, CompilationOutput } from '@/types'
import { buildCompilePrompt } from './prompts'
import { StitchReport } from './stitchIdeas'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function compileNotes(
  sourceTexts: { fileName: string; text: string }[],
  intent: IntentType,
  templateId?: string,
  stitchReport?: StitchReport
): Promise<CompilationOutput> {
  const prompt = buildCompilePrompt(intent, sourceTexts, templateId, stitchReport)

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.choices[0]?.message?.content
  if (!raw) throw new Error('No response from OpenAI')

  return JSON.parse(raw) as CompilationOutput
}
