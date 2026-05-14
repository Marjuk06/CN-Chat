"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SidebarHeader from './SidebarHeader'
import { User } from 'lucide-react'

export default function ChatList({ onChatSelect }: { onChatSelect: () => void }) {
  const [lastMessage, setLastMessage] = useState<string>("Loading...")
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const fetchLastMessage = async () => {
      const { data } = await supabase
        .from('messages')
        .select('content, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setLastMessage(data.content)
        setTime(new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      }
    }

    fetchLastMessage()

    // Listen for new messages to update the preview instantly
    const channel = supabase
      .channel('list-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setLastMessage(payload.new.content)
        setTime(new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <aside className="flex w-full flex-col border-r border-white/10 bg-black/20">
      <SidebarHeader />
      
      <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-2">
        <div 
          onPointerDown={onChatSelect}
          className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/10 p-3 transition hover:bg-white/10"
        >
          <div className="relative h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="truncate text-sm font-semibold text-white">Global Chat</h3>
              <span className="text-[10px] text-violet-400">{time}</span>
            </div>
            <p className="truncate text-xs text-gray-400">{lastMessage}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}