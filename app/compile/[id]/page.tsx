'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import OutputDocument from '@/components/OutputDocument'
import SourcePanel from '@/components/SourcePanel'
import ExportButton from '@/components/ExportButton'
import Spinner from '@/components/Spinner'
import ErrorBoundary from '@/components/ErrorBoundary'
import { CompilationOutput } from '@/types'

interface SourceFile {
  id: string
  file_name: string
  file_type: string
}

interface CompilationData {
  status: 'pending' | 'processing' | 'complete' | 'failed'
  output: CompilationOutput | null
  sourceFiles: SourceFile[]
}

export default function OutputPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<CompilationData | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    async function poll() {
      try {
        const res = await fetch(`/api/compilation/${id}`)
        if (!res.ok) return
        const json: CompilationData = await res.json()
        setData(json)

        if (json.status === 'pending' || json.status === 'processing') {
          timer = setTimeout(poll, 3000)
        }
      } catch {
        timer = setTimeout(poll, 3000)
      }
    }

    poll()
    return () => clearTimeout(timer)
  }, [id])

  // Loading / polling state
  if (!data || data.status === 'pending' || data.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm">Compiling your notes…</p>
      </div>
    )
  }

  if (data.status === 'failed' || !data.output) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] gap-3">
        <p className="text-2xl">⚠️</p>
        <p className="text-gray-900 font-semibold">Compilation failed</p>
        <p className="text-gray-500 text-sm">Something went wrong. Please try again.</p>
        <a href="/compile" className="mt-2 text-sm text-gray-700 underline underline-offset-2">
          Back to Compile
        </a>
      </div>
    )
  }

  return (
    <ErrorBoundary>
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <a href="/compile" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← New compilation
        </a>
        <ExportButton output={data.output} />
      </div>

      {/* Stacked on mobile, two-column on large screens */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main document */}
        <div className="flex-1 min-w-0 w-full">
          <OutputDocument
            output={data.output}
            activeSource={activeSource}
            onSourceClick={setActiveSource}
          />
        </div>

        {/* Source sidebar */}
        {data.sourceFiles.length > 0 && (
          <div className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-6">
            <SourcePanel sources={data.sourceFiles} activeSource={activeSource} />
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}
