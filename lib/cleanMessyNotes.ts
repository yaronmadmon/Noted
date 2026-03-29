import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const BULLET_RE = /^[\s]*[-*•>]/m
const SHORT_LINE_RE = /^.{0,30}$/m

function messinessScore(text: string): number {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return 0

  const shortLines = lines.filter((l) => SHORT_LINE_RE.test(l.trim())).length
  const bulletLines = lines.filter((l) => BULLET_RE.test(l)).length
  const noTerminator = lines.filter((l) => !/[.!?]$/.test(l.trim())).length
  const hasSlang = /TODO|FIXME|\?\?\?|→|>>|!!!/i.test(text) ? 1 : 0

  const score =
    (shortLines / lines.length) * 0.3 +
    (bulletLines / lines.length) * 0.3 +
    (noTerminator / lines.length) * 0.3 +
    hasSlang * 0.1

  return Math.min(score, 1)
}

export async function cleanMessyNotes(text: string): Promise<string> {
  if (messinessScore(text) < 0.3) return text

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are a text editor. The user has provided raw, disorganised notes.
Your job is to restructure them into clean prose paragraphs with clear headings.
Do NOT add new information, opinions, or analysis. Preserve every original idea.
Return ONLY the restructured text — no explanation, no commentary.

ORIGINAL NOTES:
${text}`,
      },
    ],
  })

  return response.choices[0]?.message?.content?.trim() ?? text
}
