'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader, { UploadedFile } from '@/components/FileUploader'
import UrlIngester from '@/components/UrlIngester'
import IntentEngine from '@/components/IntentEngine'
import TemplateSelector from '@/components/TemplateSelector'
import MessyNotesToggle from '@/components/MessyNotesToggle'
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

interface Usage { used: number; limit: number }

export default function CompilePage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [urlFileIds, setUrlFileIds] = useState<string[]>([])
  const [intent, setIntent] = useState<IntentType | null>(null)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [messyNotes, setMessyNotes] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) setUsage({ used: data.profile.compilations_used, limit: data.profile.compilations_limit })
      })
      .catch(() => null)
  }, [])

  function handleIntentSelect(newIntent: IntentType) {
    setIntent(newIntent)
    setTemplateId(null)
  }

  function handleUrlAdded(fileId: string) {
    setUrlFileIds((prev) => [...prev, fileId])
  }

  function handleUrlRemoved(fileId: string) {
    setUrlFileIds((prev) => prev.filter((id) => id !== fileId))
  }

  const uploadedFiles = files.filter((f) => f.storageId)
  const allFileIds = [...uploadedFiles.map((f) => f.storageId as string), ...urlFileIds]
  const atLimit = usage ? usage.used >= usage.limit : false
  const canSubmit = allFileIds.length > 0 && intent !== null && !isCompiling && !atLimit
  const availableTemplates = intent ? getTemplatesForIntent(intent) : []

  async function handleCompile() {
    if (!canSubmit || !intent) return
    setIsCompiling(true)
    setError(null)

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: allFileIds, intent, templateId: templateId ?? undefined, messyNotes }),
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
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Compile</h1>
          <p className="text-sm sm:text-base text-gray-500">Upload your notes, choose an output type, and let AI do the rest.</p>
        </div>
        {usage && <div className="sm:w-52 sm:shrink-0"><UsageBanner used={usage.used} limit={usage.limit} /></div>}
      </div>

      {/* Step 1 — Sources */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          1 — Add Sources
        </h2>
        <FileUploader onFilesChange={setFiles} />
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or add a URL</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <UrlIngester onUrlAdded={handleUrlAdded} onUrlRemoved={handleUrlRemoved} />
      </section>

      {/* Step 2 — Intent */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          2 — Choose Output Type
        </h2>
        <IntentEngine selected={intent} onSelect={handleIntentSelect} />
      </section>

      {/* Step 3 — Template */}
      {availableTemplates.length > 0 && (
        <section className="mb-10">
          <TemplateSelector templates={availableTemplates} selected={templateId} onSelect={setTemplateId} />
        </section>
      )}

      {/* Step 4 — Options */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {availableTemplates.length > 0 ? '4' : '3'} — Options
        </h2>
        <MessyNotesToggle enabled={messyNotes} onChange={setMessyNotes} />
      </section>

      {/* Summary */}
      {canSubmit && intent && (
        <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
          {allFileIds.length} source{allFileIds.length !== 1 ? 's' : ''} · Intent:{' '}
          <span className="font-semibold text-gray-900">{INTENT_LABELS[intent]}</span>
          {templateId && <> · <span className="font-semibold text-gray-900">{templateId.replace('_', ' ')}</span></>}
          {messyNotes && <> · <span className="font-semibold text-gray-900">Messy Notes Mode</span></>}
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
