export type IntentType = 'study' | 'business' | 'book' | 'content'

export type Plan = 'free' | 'pro'

export type CompilationStatus = 'pending' | 'processing' | 'complete' | 'error'

export interface Profile {
  id: string
  email: string
  compilations_used: number
  compilations_limit: number
  plan: Plan
}

export interface CompilationSection {
  heading: string
  content: string
  sourceRefs: string[]
}

export interface CompilationOutput {
  title: string
  sections: CompilationSection[]
  summary: string
}

export interface Compilation {
  id: string
  user_id: string
  intent: IntentType
  status: CompilationStatus
  output: CompilationOutput | null
  created_at: string
}

export interface SourceFile {
  id: string
  compilation_id: string
  file_name: string
  file_type: string
  storage_path: string
  extracted_text: string
}
