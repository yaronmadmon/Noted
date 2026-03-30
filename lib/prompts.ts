import { IntentType } from '@/types'
import { TEMPLATES } from './templates'
import { StitchReport } from './stitchIdeas'

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

const MAX_CHARS_PER_SOURCE = 12000
const MAX_TOTAL_CHARS = 60000

export function buildCompilePrompt(
  intent: IntentType,
  sources: { fileName: string; text: string }[],
  templateId?: string,
  stitchReport?: StitchReport
): string {
  // Truncate each source then enforce a total cap
  let totalChars = 0
  const truncatedSources = sources.map((s) => {
    const text = s.text.length > MAX_CHARS_PER_SOURCE
      ? s.text.slice(0, MAX_CHARS_PER_SOURCE) + '\n\n[Content truncated]'
      : s.text
    return { ...s, text }
  })

  const cappedSources: typeof truncatedSources = []
  for (const s of truncatedSources) {
    if (totalChars + s.text.length > MAX_TOTAL_CHARS) {
      const remaining = MAX_TOTAL_CHARS - totalChars
      if (remaining > 500) {
        cappedSources.push({ ...s, text: s.text.slice(0, remaining) + '\n\n[Content truncated]' })
      }
      break
    }
    cappedSources.push(s)
    totalChars += s.text.length
  }

  const sourceBlock = cappedSources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.fileName} ---\n${s.text}`)
    .join('\n\n')

  const template = templateId ? TEMPLATES[templateId] : null

  const structureInstruction = template
    ? `You MUST use exactly these section headings in this order:
${template.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}
Do not add, remove, or rename any of these headings.`
    : `Use whatever section headings best fit the content and intent.`

  const stitchBlock = stitchReport && (
    stitchReport.repeatedIdeas.length > 0 || stitchReport.contradictions.length > 0
  )
    ? `\nCROSS-SOURCE ANALYSIS:
${stitchReport.repeatedIdeas.length > 0
  ? `The following ideas appear in multiple sources — synthesise them rather than repeating:
${stitchReport.repeatedIdeas.map((r) => `• "${r.concept}" — found in ${r.sources.join(', ')}`).join('\n')}`
  : ''}
${stitchReport.contradictions.length > 0
  ? `\nThe following contradictions were detected — acknowledge and resolve them in your output:
${stitchReport.contradictions.map((c) => `• "${c.concept}": ${c.sourceA} says one thing, ${c.sourceB} says the opposite`).join('\n')}`
  : ''}`
    : ''

  return `${INTENT_INSTRUCTIONS[intent]}

You will be given one or more source documents. Your job is to compile them into a single,
coherent, well-structured document based STRICTLY on the provided source content.

CRITICAL RULES — you MUST follow these without exception:
- Use ONLY information that is explicitly present in the source documents.
- Do NOT add any information, facts, advice, or examples that are not in the sources.
- Do NOT invent, pad, or generalise beyond what the sources say.
- If the source text is in a language other than English, faithfully compile from that content — do not switch to generic placeholder text.
- If the sources contain too little content to fill a section, write only what is there.
- Every section you write MUST reference the source(s) it draws from using the sourceRefs field.

DOCUMENT STRUCTURE:
${structureInstruction}
${stitchBlock}

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
