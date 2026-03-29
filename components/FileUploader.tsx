'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatFileSize, validateFile, ACCEPTED_MIME_TYPES, getFileType } from '@/lib/fileHelpers'

export interface UploadedFile {
  file: File
  id: string
  progress: number
  error?: string
  storageId?: string
}

interface FileUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void
}

const FILE_TYPE_ICON: Record<string, string> = {
  image: '🖼',
  pdf: '📄',
  text: '📝',
  audio: '🎵',
}

export default function FileUploader({ onFilesChange }: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const updateFiles = (updated: UploadedFile[]) => {
    setUploadedFiles(updated)
    onFilesChange(updated)
  }

  const uploadFile = useCallback(async (entry: UploadedFile) => {
    const formData = new FormData()
    formData.append('file', entry.file)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadedFiles((prev) => {
            const next = prev.map((f) =>
              f.id === entry.id ? { ...f, progress } : f
            )
            onFilesChange(next)
            return next
          })
        }
      }

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            setUploadedFiles((prev) => {
              const next = prev.map((f) =>
                f.id === entry.id
                  ? { ...f, progress: 100, storageId: data.fileId }
                  : f
              )
              onFilesChange(next)
              return next
            })
            resolve()
          } else {
            reject(new Error(JSON.parse(xhr.responseText)?.error ?? 'Upload failed'))
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed'
      setUploadedFiles((prev) => {
        const next = prev.map((f) =>
          f.id === entry.id ? { ...f, error } : f
        )
        onFilesChange(next)
        return next
      })
    }
  }, [onFilesChange])

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newEntries: UploadedFile[] = []

      for (const file of accepted) {
        const { valid, error } = validateFile(file)
        const entry: UploadedFile = {
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: 0,
          error: valid ? undefined : error,
        }
        newEntries.push(entry)
      }

      setUploadedFiles((prev) => {
        const next = [...prev, ...newEntries]
        onFilesChange(next)
        return next
      })

      for (const entry of newEntries) {
        if (!entry.error) uploadFile(entry)
      }
    },
    [uploadFile, onFilesChange]
  )

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id)
      onFilesChange(next)
      return next
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(ACCEPTED_MIME_TYPES.map((t) => [t, []])),
    multiple: true,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-gray-900 bg-gray-100'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-4xl mb-3">📂</p>
        <p className="text-gray-700 font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          or click to browse — PDF, images, text, audio · max 10MB each
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <ul className="space-y-2">
          {uploadedFiles.map((entry) => {
            const category = getFileType(entry.file)
            const icon = FILE_TYPE_ICON[category]
            return (
              <li
                key={entry.id}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3"
              >
                <span className="text-xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {entry.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(entry.file.size)}
                  </p>
                  {entry.error ? (
                    <p className="text-xs text-red-500 mt-0.5">{entry.error}</p>
                  ) : entry.progress < 100 ? (
                    <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 transition-all"
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 mt-0.5">Uploaded</p>
                  )}
                </div>
                <button
                  onClick={() => removeFile(entry.id)}
                  className="text-gray-300 hover:text-gray-500 text-lg leading-none"
                  aria-label="Remove file"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
