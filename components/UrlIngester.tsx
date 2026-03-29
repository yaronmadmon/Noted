'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Spinner from './Spinner'

interface AddedUrl {
  fileId: string
  title: string
  url: string
}

interface UrlIngesterProps {
  onUrlAdded: (fileId: string, title: string) => void
  onUrlRemoved: (fileId: string) => void
}

export default function UrlIngester({ onUrlAdded, onUrlRemoved }: UrlIngesterProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<AddedUrl[]>([])
  const t = useTranslations('urlIngester')

  async function handleAdd() {
    const url = input.trim()
    if (!url) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? t('failedToFetch'))
      } else {
        const entry: AddedUrl = { fileId: data.fileId, title: data.title, url }
        setAdded((prev) => [...prev, entry])
        onUrlAdded(data.fileId, data.title)
        setInput('')
      }
    } catch {
      setError(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  function handleRemove(fileId: string) {
    setAdded((prev) => prev.filter((e) => e.fileId !== fileId))
    onUrlRemoved(fileId)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleAdd()}
          placeholder={t('placeholder')}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !input.trim()}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            loading || !input.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          {loading ? <Spinner size="sm" /> : t('addUrl')}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {added.length > 0 && (
        <ul className="space-y-2">
          {added.map((entry) => (
            <li
              key={entry.fileId}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-2.5"
            >
              <span className="text-base">🔗</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                <p className="text-xs text-gray-400 truncate">{entry.url}</p>
              </div>
              <button
                onClick={() => handleRemove(entry.fileId)}
                className="text-gray-300 hover:text-gray-500 text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
