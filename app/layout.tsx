import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getCurrentUser } from '@/lib/auth'
import NavSignOut from '@/components/NavSignOut'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Knowledge Compiler',
  description: 'Turn messy notes into finished work',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold text-gray-900">
              Knowledge Compiler
            </a>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-400">{user.email}</span>
                  <a
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/compile"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Compile
                  </a>
                  <NavSignOut />
                </>
              ) : (
                <a
                  href="/auth"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </a>
              )}
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}
