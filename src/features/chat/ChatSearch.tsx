"use client"

import { useState } from 'react'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { Message } from '@/types/chat'

export default function ChatSearch({
  messages,
  onHighlight,
  onClose,
}: {
  messages: Message[]
  onHighlight: (id: string | null) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  const results = query.trim()
    ? messages.filter((m) =>
        m.content?.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const navigate = (dir: 1 | -1) => {
    const next = (currentIndex + dir + results.length) % results.length
    setCurrentIndex(next)
    onHighlight(results[next]?.id || null)
  }

  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-black/30 px-4 py-2">
      <Search className="h-4 w-4 shrink-0 text-gray-400" />
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setCurrentIndex(0)
          onHighlight(results[0]?.id || null)
        }}
        placeholder="Search in chat..."
        className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
      />
      {results.length > 0 && (
        <span className="text-xs text-gray-400 shrink-0">
          {currentIndex + 1}/{results.length}
        </span>
      )}
      <button onClick={() => navigate(-1)} disabled={results.length === 0} className="text-gray-400 hover:text-white disabled:opacity-30">
        <ChevronUp className="h-4 w-4" />
      </button>
      <button onClick={() => navigate(1)} disabled={results.length === 0} className="text-gray-400 hover:text-white disabled:opacity-30">
        <ChevronDown className="h-4 w-4" />
      </button>
      <button onClick={() => { onClose(); onHighlight(null) }} className="text-gray-400 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
