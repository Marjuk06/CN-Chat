"use client"

import { useState } from 'react'
import { Search } from 'lucide-react'

const EMOJI_CATEGORIES: Record<string, string[]> = {
  'Smileys': ['😀','😂','😍','🥰','😎','🤔','😅','😭','🥺','😤','🤯','🥳','😴','🤗','😏','🙄','😬','🤫','🫡','🥹'],
  'Gestures': ['👍','👎','👋','🤝','🙏','💪','✌️','🤞','👏','🫶','🤌','👌','🫰','🙌','🤙','👈','👉','☝️'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','❤️‍🔥','💕','💞','💓','💗','💖','💝','💘','♥️'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🦆'],
  'Food': ['🍕','🍔','🌮','🌯','🥗','🍣','🍜','🍝','🍦','🍩','🍪','🎂','🍫','🍭','☕','🧋','🍺','🥤'],
  'Objects': ['📱','💻','🎮','🎵','🎬','📸','💡','🔑','💰','🎁','🏆','⭐','💎','🔮','🎯','🧩','🪄','🎭'],
}

export default function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Smileys')

  const allEmojis = Object.values(EMOJI_CATEGORIES).flat()
  const filteredEmojis = search
    ? allEmojis.filter((e) => e.includes(search))
    : EMOJI_CATEGORIES[activeCategory]

  return (
    <div className="absolute bottom-16 left-0 z-30 w-72 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
      <div className="p-3">
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
        </div>

        {!search && (
          <div className="mb-3 flex gap-1 overflow-x-auto scrollbar-none">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-lg px-2 py-1 text-[10px] transition ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
          {filteredEmojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => { onSelect(emoji); onClose() }}
              className="rounded-lg p-1.5 text-lg hover:bg-white/10 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
