import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Knowledge Compiler',
  description: 'Turn messy notes into finished work',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold text-gray-900">
              Knowledge Compiler
            </a>
            <a
              href="/compile"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Compile
            </a>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}
