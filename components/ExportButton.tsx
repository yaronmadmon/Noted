'use client'

import { CompilationOutput } from '@/types'

interface ExportButtonProps {
  output: CompilationOutput
}

function buildPlainText(output: CompilationOutput): string {
  const lines: string[] = []

  lines.push(output.title)
  lines.push('='.repeat(output.title.length))
  lines.push('')
  lines.push('SUMMARY')
  lines.push(output.summary)
  lines.push('')

  for (const section of output.sections) {
    lines.push(section.heading)
    lines.push('-'.repeat(section.heading.length))
    lines.push(section.content)
    if (section.sourceRefs.length > 0) {
      lines.push(`Sources: ${section.sourceRefs.join(', ')}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export default function ExportButton({ output }: ExportButtonProps) {
  function handleExport() {
    const text = buildPlainText(output)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${output.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <span>↓</span> Export as text
    </button>
  )
}
