'use client'

import { useState, useEffect } from 'react'
import FileUploader, { UploadedFile } from '@/components/FileUploader'
import IntentEngine from '@/components/IntentEngine'
import SubmitButton from '@/components/SubmitButton'
import CompilationResult from '@/components/CompilationResult'
import UsageBar from '@/components/UsageBar'
import { IntentType, CompilationOutput } from '@/types'

const INTENT_LABELS: Record<IntentType, string> = {
  study: 'Study Guide',
  business: 'Business',
  book: 'Book',
  content: 'Content',
}

interface Usage {
  used: number
  limit: number
}

export default function CompilePage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [intent, setIntent] = useState<IntentType | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [output, setOutput] = useState<CompilationOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setUsage({
            used: data.profile.compilations_used,
            limit: data.profile.compilations_limit,
          })
        }
      })
      .catch(() => null)
  }, [])

  const uploadedFiles = files.filter((f) => f.storageId)
  const atLimit = usage ? usage.used >= usage.limit : false
  const canSubmit = uploadedFiles.length > 0 && intent !== null && !isCompiling && !atLimit

  async function handleCompile() {
    if (!canSubmit || !intent) return
    setIsCompiling(true)
    setError(null)
    setOutput(null)

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds: uploadedFiles.map((f) => f.storageId),
          intent,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Compilation failed')
        if (data.usage) setUsage(data.usage)
      } else {
        setOutput(data.output)
        if (data.usage) setUsage(data.usage)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setIsCompiling(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Compile</h1>
          <p className="text-gray-500">Upload your notes, choose an output type, and let AI do the rest.</p>
        </div>
        {usage && (
          <div className="w-52 shrink-0">
            <UsageBar used={usage.used} limit={usage.limit} />
          </div>
        )}
      </div>

      {/* Step 1 — Upload */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          1 — Upload Files
        </h2>
        <FileUploader onFilesChange={setFiles} />
      </section>

      {/* Step 2 — Intent */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          2 — Choose Output Type
        </h2>
        <IntentEngine selected={intent} onSelect={setIntent} />
      </section>

      {/* Submission summary */}
      {canSubmit && intent && (
        <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
          {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded · Intent:{' '}
          <span className="font-semibold text-gray-900">{INTENT_LABELS[intent]}</span>
        </div>
      )}

      {/* Submit */}
      <SubmitButton disabled={!canSubmit} loading={isCompiling} onClick={handleCompile} />

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {isCompiling && <CompilationResult output={{ title: '', sections: [], summary: '' }} isLoading />}
      {output && <CompilationResult output={output} />}
    </div>
  )
}
