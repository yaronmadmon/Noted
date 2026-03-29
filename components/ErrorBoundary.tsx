'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center px-4">
            <p className="text-2xl">⚠️</p>
            <p className="font-semibold text-gray-900">Something went wrong</p>
            <p className="text-sm text-gray-500 max-w-sm">{this.state.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="mt-2 text-sm text-gray-700 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
