import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
          Turn messy notes into finished work
        </h1>
        <p className="text-base sm:text-xl text-gray-500 mb-8 sm:mb-10 leading-relaxed">
          Upload handwritten notes, PDFs, voice memos, or plain text.
          Choose your output type and let AI compile everything into a
          structured, publish-ready document — with every paragraph
          traced back to its source.
        </p>
        <Link
          href="/compile"
          className="inline-block bg-gray-900 text-white text-base font-medium px-8 py-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Get Started
        </Link>
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-left">
          {[
            { label: 'Study Guide', desc: 'Structured summaries from lecture notes and readings' },
            { label: 'Executive Brief', desc: 'Concise business documents from research and data' },
            { label: 'Report', desc: 'Full reports compiled from multiple source files' },
          ].map(({ label, desc }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <p className="font-semibold text-gray-900 mb-1">{label}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
