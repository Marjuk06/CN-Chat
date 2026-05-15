"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TypingIndicator({ chatId, currentUser }: { chatId: string; currentUser: string }) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    const channel = supabase
      .channel(`typing-${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const row = payload.new as { user_id: string; is_typing: boolean }
        if (row.user_id === currentUser) return

        setTypingUsers((prev) => {
          if (row.is_typing && !prev.includes(row.user_id)) {
            return [...prev, row.user_id]
          } else if (!row.is_typing) {
            return prev.filter((u) => u !== row.user_id)
          }
          return prev
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatId, currentUser])

  if (typingUsers.length === 0) return null

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : `${typingUsers.slice(0, 2).join(', ')} are typing`

  return (
    <div className="flex items-center gap-2 px-6 pb-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}