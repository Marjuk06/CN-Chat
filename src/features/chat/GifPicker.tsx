"use client"

import { useState } from 'react'
import { Search, X } from 'lucide-react'

// Uses GIPHY API – get a free key at developers.giphy.com
// Add NEXT_PUBLIC_GIPHY_API_KEY to your .env.local
const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || ''

type GiphyGif = {
  id: string
  images: {
    fixed_height_small: { url: string }
    original: { url: string }
  }
}

export default function GifPicker({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [gifs, setGifs] = useState<GiphyGif[]>([])
  const [loading, setLoading] = useState(false)

  const searchGifs = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=g`
      )
      const data = await res.json()
      setGifs(data.data || [])
    } catch (e) {
      console.error('GIF fetch error', e)
    }
    setLoading(false)
  }

  return (
    <div className="absolute bottom-16 left-0 z-30 w-80 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">GIFs</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchGifs(search)}
            placeholder="Search GIFs... (press Enter)"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
        </div>

        {!GIPHY_KEY && (
          <p className="text-xs text-amber-400 mb-2 text-center">
            Add NEXT_PUBLIC_GIPHY_API_KEY to .env.local
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => { onSelect(gif.images.original.url); onClose() }}
                className="overflow-hidden rounded-lg hover:opacity-80 transition"
              >
                <img
                  src={gif.images.fixed_height_small.url}
                  alt="gif"
                  className="h-24 w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}