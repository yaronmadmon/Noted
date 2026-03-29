import { IntentType } from '@/types'
import { TEMPLATES } from './templates'

const INTENT_INSTRUCTIONS: Record<IntentType, string> = {
  study: `You are creating a Study Guide. Structure the output so it is optimised for
learning and retention. Use clear, direct language suitable for students.`,

  business: `You are creating a Business document. Structure the output with clear headings,
concise language, and action-oriented recommendations.`,

  book: `You are creating a structured Book or Article outline. Use narrative headings that
flow logically. Each section should build on the last, suitable for long-form publishing.`,

  content: `You are creating Content for digital publishing (blog post, article, or marketing copy).
Use engaging headings, short paragraphs, and a clear narrative arc suitable for online readers.`,
}

export function buildCompilePrompt(
  intent: IntentType,
  sources: { fileName: string; text: string }[],
  templateId?: string
): string {
  const sourceBlock = sources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.fileName} ---\n${s.text}`)
    .join('\n\n')

  const template = templateId ? TEMPLATES[templateId] : null

  const structureInstruction = template
    ? `You MUST use exactly these section headings in this order:
${template.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}
Do not add, remove, or rename any of these headings.`
    : `Use whatever section headings best fit the content and intent.`

  return `${INTENT_INSTRUCTIONS[intent]}

You will be given one or more source documents. Your job is to compile them into a single,
coherent, well-structured document. Every section you write MUST reference the source(s)
it draws from using the sourceRefs field.

DOCUMENT STRUCTURE:
${structureInstruction}

SOURCE DOCUMENTS:
${sourceBlock}

Return ONLY valid JSON — no markdown fences, no explanation — in exactly this shape:
{
  "title": "string",
  "sections": [
    {
      "heading": "string",
      "content": "string",
      "sourceRefs": ["SOURCE 1", "SOURCE 2"]
    }
  ],
  "summary": "string"
}`
}
