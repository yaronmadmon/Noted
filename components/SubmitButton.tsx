'use client'

import Spinner from './Spinner'

interface SubmitButtonProps {
  disabled: boolean
  loading: boolean
  onClick: () => void
}

export default function SubmitButton({ disabled, loading, onClick }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-4 rounded-xl text-base font-semibold transition-colors flex items-center justify-center gap-2 ${
        disabled || loading
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gray-900 text-white hover:bg-gray-700'
      }`}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="border-gray-300 border-t-gray-400" />
          Compiling...
        </>
      ) : (
        'Compile My Notes'
      )}
    </button>
  )
}
