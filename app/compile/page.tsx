'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader, { UploadedFile } from '@/components/FileUploader'
import IntentEngine from '@/components/IntentEngine'
import TemplateSelector from '@/components/TemplateSelector'
import SubmitButton from '@/components/SubmitButton'
import UsageBanner from '@/components/UsageBanner'
import { getTemplatesForIntent } from '@/lib/templates'
import { IntentType } from '@/types'

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
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [intent, setIntent] = useState<IntentType | null>(null)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
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

  // Reset template when intent changes
  function handleIntentSelect(newIntent: IntentType) {
    setIntent(newIntent)
    setTemplateId(null)
  }

  const uploadedFiles = files.filter((f) => f.storageId)
  const atLimit = usage ? usage.used >= usage.limit : false
  const canSubmit = uploadedFiles.length > 0 && intent !== null && !isCompiling && !atLimit
  const availableTemplates = intent ? getTemplatesForIntent(intent) : []

  async function handleCompile() {
    if (!canSubmit || !intent) return
    setIsCompiling(true)
    setError(null)

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds: uploadedFiles.map((f) => f.storageId),
          intent,
          templateId: templateId ?? undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Compilation failed')
        if (data.usage) setUsage(data.usage)
        setIsCompiling(false)
      } else {
        router.push(`/compile/${data.compilationId}`)
      }
    } catch {
      setError('Network error — please try again')
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
            <UsageBanner used={usage.used} limit={usage.limit} />
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
        <IntentEngine selected={intent} onSelect={handleIntentSelect} />
      </section>

      {/* Step 3 — Template (conditional) */}
      {availableTemplates.length > 0 && (
        <section className="mb-10">
          <TemplateSelector
            templates={availableTemplates}
            selected={templateId}
            onSelect={setTemplateId}
          />
        </section>
      )}

      {/* Submission summary */}
      {canSubmit && intent && (
        <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
          {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded · Intent:{' '}
          <span className="font-semibold text-gray-900">{INTENT_LABELS[intent]}</span>
          {templateId && (
            <> · Template: <span className="font-semibold text-gray-900">{templateId.replace('_', ' ')}</span></>
          )}
        </div>
      )}

      <SubmitButton disabled={!canSubmit} loading={isCompiling} onClick={handleCompile} />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
