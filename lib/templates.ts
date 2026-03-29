import { IntentType } from '@/types'

export interface OutputTemplate {
  id: string
  label: string
  description: string
  sections: string[]
}

export const TEMPLATES: Record<string, OutputTemplate> = {
  report: {
    id: 'report',
    label: 'Report',
    description: 'Full structured report with findings and recommendations',
    sections: [
      'Executive Summary',
      'Background',
      'Key Findings',
      'Analysis',
      'Recommendations',
      'Next Steps',
    ],
  },
  study_guide: {
    id: 'study_guide',
    label: 'Study Guide',
    description: 'Learning-focused structure with concepts and review questions',
    sections: [
      'Overview',
      'Key Concepts',
      'Definitions',
      'Important Details',
      'Review Questions',
      'Summary',
    ],
  },
  executive_brief: {
    id: 'executive_brief',
    label: 'Executive Brief',
    description: 'Concise situation-resolution format for decision makers',
    sections: ['Situation', 'Complication', 'Resolution', 'Action Required'],
  },
}

// Which templates are available per intent
export const INTENT_TEMPLATES: Record<IntentType, string[]> = {
  business: ['report', 'executive_brief'],
  study: ['study_guide'],
  book: [],
  content: [],
}

export function getTemplatesForIntent(intent: IntentType): OutputTemplate[] {
  return INTENT_TEMPLATES[intent].map((id) => TEMPLATES[id])
}
