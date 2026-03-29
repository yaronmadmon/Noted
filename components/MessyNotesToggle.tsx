'use client'

interface MessyNotesToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export default function MessyNotesToggle({ enabled, onChange }: MessyNotesToggleProps) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">Messy Notes Mode</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Restructures bullet fragments and incomplete sentences before compiling
        </p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          enabled ? 'bg-gray-900' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
