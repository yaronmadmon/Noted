export type FileCategory = 'image' | 'pdf' | 'text' | 'audio' | 'url'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ACCEPTED_TYPES: Record<string, FileCategory> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'application/pdf': 'pdf',
  'text/plain': 'text',
  'text/markdown': 'text',
  'audio/mpeg': 'audio',
  'audio/mp4': 'audio',
  'audio/wav': 'audio',
  'audio/x-wav': 'audio',
  'audio/m4a': 'audio',
  'audio/x-m4a': 'audio',
  'video/mp4': 'audio', // mp4 containers used for audio
}

export function getFileType(file: File): FileCategory {
  return ACCEPTED_TYPES[file.type] ?? 'text'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_TYPES[file.type]) {
    return { valid: false, error: `Unsupported file type: ${file.type || 'unknown'}` }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File exceeds 10MB limit (${formatFileSize(file.size)})` }
  }
  return { valid: true }
}

export const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_TYPES)
