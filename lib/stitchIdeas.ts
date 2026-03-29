const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'this','that','these','those','it','its','i','we','you','he','she','they',
  'not','no','so','as','if','then','than','also','just','more','about',
])

const POSITIVE_SIGNALS = new Set(['increases','improves','supports','confirms','shows','proves','enhances','boosts'])
const NEGATIVE_SIGNALS = new Set(['decreases','worsens','contradicts','disputes','refutes','denies','reduces','undermines'])

export interface StitchReport {
  repeatedIdeas: {
    concept: string
    sources: string[]
    representativeSentence: string
  }[]
  contradictions: {
    concept: string
    sourceA: string
    sentenceA: string
    sourceB: string
    sentenceB: string
  }[]
}

export interface StitchedSources {
  sources: { fileName: string; text: string }[]
  report: StitchReport
}

interface LabeledSentence {
  text: string
  sourceLabel: string
  key: string
  tokens: Set<string>
}

function conceptKey(sentence: string): { key: string; tokens: Set<string> } {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  const stemmed = words.map((w) => w.slice(0, 5))
  const top = [...new Set(stemmed)].slice(0, 8)
  return { key: top.sort().join(' '), tokens: new Set(top) }
}

function tokenOverlap(a: Set<string>, b: Set<string>): number {
  let count = 0
  for (const t of a) if (b.has(t)) count++
  return count
}

function sentimentOf(sentence: string): 'positive' | 'negative' | 'neutral' {
  const words = new Set(sentence.toLowerCase().split(/\W+/))
  const hasPos = [...POSITIVE_SIGNALS].some((s) => words.has(s))
  const hasNeg = [...NEGATIVE_SIGNALS].some((s) => words.has(s))
  if (hasPos && !hasNeg) return 'positive'
  if (hasNeg && !hasPos) return 'negative'
  return 'neutral'
}

export function stitchIdeas(
  sources: { fileName: string; text: string }[]
): StitchedSources {
  if (sources.length < 2) {
    return { sources, report: { repeatedIdeas: [], contradictions: [] } }
  }

  // Build labeled sentences per source
  const labeled: LabeledSentence[] = []
  sources.forEach((src, i) => {
    const label = `SOURCE ${i + 1}`
    const sentences = src.text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.split(/\s+/).length >= 6)

    for (const sentence of sentences) {
      const { key, tokens } = conceptKey(sentence)
      if (key.length > 0) labeled.push({ text: sentence, sourceLabel: label, key, tokens })
    }
  })

  // Cluster by token overlap
  const clusters: LabeledSentence[][] = []
  const assigned = new Set<number>()

  for (let i = 0; i < labeled.length; i++) {
    if (assigned.has(i)) continue
    const cluster: LabeledSentence[] = [labeled[i]]
    assigned.add(i)
    for (let j = i + 1; j < labeled.length; j++) {
      if (assigned.has(j)) continue
      if (tokenOverlap(labeled[i].tokens, labeled[j].tokens) >= 3) {
        cluster.push(labeled[j])
        assigned.add(j)
      }
    }
    if (cluster.length > 1) clusters.push(cluster)
  }

  // Build repeated ideas (cross-source clusters only)
  const repeatedIdeas: StitchReport['repeatedIdeas'] = []
  const contradictions: StitchReport['contradictions'] = []

  for (const cluster of clusters) {
    const uniqueSources = [...new Set(cluster.map((s) => s.sourceLabel))]
    if (uniqueSources.length < 2) continue

    const representative = cluster[0]
    const conceptTokens = [...representative.tokens].slice(0, 5).join(', ')

    repeatedIdeas.push({
      concept: conceptTokens,
      sources: uniqueSources,
      representativeSentence: representative.text.slice(0, 120),
    })

    // Check for contradictions within this cluster
    for (let a = 0; a < cluster.length; a++) {
      for (let b = a + 1; b < cluster.length; b++) {
        if (cluster[a].sourceLabel === cluster[b].sourceLabel) continue
        const sentA = sentimentOf(cluster[a].text)
        const sentB = sentimentOf(cluster[b].text)
        if (
          (sentA === 'positive' && sentB === 'negative') ||
          (sentA === 'negative' && sentB === 'positive')
        ) {
          contradictions.push({
            concept: conceptTokens,
            sourceA: cluster[a].sourceLabel,
            sentenceA: cluster[a].text.slice(0, 150),
            sourceB: cluster[b].sourceLabel,
            sentenceB: cluster[b].text.slice(0, 150),
          })
        }
      }
    }
  }

  return {
    sources,
    report: { repeatedIdeas: repeatedIdeas.slice(0, 10), contradictions: contradictions.slice(0, 5) },
  }
}
