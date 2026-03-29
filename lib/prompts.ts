import { IntentType } from '@/types'

const INTENT_INSTRUCTIONS: Record<IntentType, string> = {
  study: `You are creating a Study Guide. Structure the output with clear headings for key concepts,
definitions, and review points. Each section should distil the most important information
for learning and retention.`,

  business: `You are creating an Executive Brief. Structure the output with headings for
Executive Summary, Key Findings, Recommendations, and Next Steps.
Keep language concise and action-oriented.`,

  book: `You are creating a structured Book or Article outline. Use narrative headings that
flow logically. Each section should build on the last, suitable for long-form publishing.`,

  content: `You are creating Content for digital publishing (blog post, article, or marketing copy).
Use engaging headings, short paragraphs, and a clear narrative arc suitable for online readers.`,
}

export function buildCompilePrompt(
  intent: IntentType,
  sources: { fileName: string; text: string }[]
): string {
  const sourceBlock = sources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.fileName} ---\n${s.text}`)
    .join('\n\n')

  return `${INTENT_INSTRUCTIONS[intent]}

You will be given one or more source documents. Your job is to compile them into a single,
coherent, well-structured document. Every section you write MUST reference the source(s)
it draws from using the sourceRefs field.

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
