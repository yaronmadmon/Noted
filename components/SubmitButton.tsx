'use client'

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
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Compiling...
        </>
      ) : (
        'Compile My Notes'
      )}
    </button>
  )
}
