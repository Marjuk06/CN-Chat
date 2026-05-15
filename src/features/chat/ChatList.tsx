"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SidebarHeader from './SidebarHeader'
import { User, Users, Pin, Archive, Plus } from 'lucide-react'
import type { Chat } from '@/types/chat'

type Props = {
  currentUser: string
  activeTab: 'chats' | 'groups' | 'settings' | 'profile'
  onChatSelect: (chat: Chat) => void
  onCreateGroup: () => void
}

export default function ChatList({ currentUser, activeTab, onChatSelect, onCreateGroup }: Props) {
  const [lastMessage, setLastMessage] = useState<string>('Say hello 👋')
  const [lastTime, setLastTime] = useState<string>('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [groups, setGroups] = useState<{ id: string; name: string; avatar_url: string | null }[]>([])
  const [pinnedChats, setPinnedChats] = useState<string[]>([])
  const [archivedChats, setArchivedChats] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    // Fetch last message
    const fetchLast = async () => {
      const { data } = await supabase
        .from('messages')
        .select('content, created_at, status, sender, media_type')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        const preview = data.media_type === 'image' ? '📷 Image'
          : data.media_type === 'audio' ? '🎤 Voice message'
          : data.media_type === 'file' ? '📎 File'
          : data.content || ''
        setLastMessage(preview)
        setLastTime(new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      }
    }

    // Fetch unread count
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')
        .neq('sender', currentUser)
      setUnreadCount(count || 0)
    }

    // Fetch groups
    const fetchGroups = async () => {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', currentUser)

      if (memberships && memberships.length > 0) {
        const ids = memberships.map((m) => m.group_id)
        const { data: groupData } = await supabase
          .from('groups')
          .select('id, name, avatar_url')
          .in('id', ids)
        if (groupData) setGroups(groupData)
      }
    }

    fetchLast()
    fetchUnread()
    fetchGroups()

    // Saved pins/archives from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('chatPrefs') || '{}')
      setPinnedChats(saved.pinned || [])
      setArchivedChats(saved.archived || [])
    } catch {}

    const channel = supabase
      .channel('chatlist-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const n = payload.new
        const preview = n.media_type === 'image' ? '📷 Image'
          : n.media_type === 'audio' ? '🎤 Voice message'
          : n.media_type === 'file' ? '📎 File'
          : n.content || ''
        setLastMessage(preview)
        setLastTime(new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        if (n.sender !== currentUser) setUnreadCount((c) => c + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser])

  const togglePin = (id: string) => {
    const next = pinnedChats.includes(id)
      ? pinnedChats.filter((c) => c !== id)
      : [...pinnedChats, id]
    setPinnedChats(next)
    const saved = JSON.parse(localStorage.getItem('chatPrefs') || '{}')
    localStorage.setItem('chatPrefs', JSON.stringify({ ...saved, pinned: next }))
  }

  const toggleArchive = (id: string) => {
    const next = archivedChats.includes(id)
      ? archivedChats.filter((c) => c !== id)
      : [...archivedChats, id]
    setArchivedChats(next)
    const saved = JSON.parse(localStorage.getItem('chatPrefs') || '{}')
    localStorage.setItem('chatPrefs', JSON.stringify({ ...saved, archived: next }))
  }

  // The one direct chat
  const directChat: Chat = {
    id: 'global',
    type: 'direct',
    name: 'Global Chat',
    last_message: lastMessage,
    last_time: lastTime,
    unread_count: unreadCount,
    is_pinned: pinnedChats.includes('global'),
    is_archived: archivedChats.includes('global'),
  }

  const groupChats: Chat[] = groups.map((g) => ({
    id: g.id,
    type: 'group',
    name: g.name,
    avatar_url: g.avatar_url,
    is_pinned: pinnedChats.includes(g.id),
    is_archived: archivedChats.includes(g.id),
  }))

  const allChats = [directChat, ...groupChats]
  const visible = allChats
    .filter((c) => showArchived ? c.is_archived : !c.is_archived)
    .filter((c) => activeTab === 'groups' ? c.type === 'group' : true)
    .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))

  return (
    <aside className="flex w-full flex-col border-r border-white/10 bg-black/20">
      <SidebarHeader />

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {activeTab === 'groups' ? 'Groups' : 'Messages'}
        </span>
        {activeTab === 'groups' && (
          <button
            onClick={onCreateGroup}
            className="flex items-center gap-1 rounded-lg bg-violet-600/20 px-2 py-1 text-xs text-violet-300 hover:bg-violet-600/30 transition"
          >
            <Plus className="h-3 w-3" />
            New
          </button>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-24 sm:pb-2">
        {visible.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            {activeTab === 'groups' ? 'No groups yet. Create one!' : 'No chats yet.'}
          </div>
        )}

        {visible.map((chat) => (
          <div
            key={chat.id}
            className="group relative"
          >
            <div
              onPointerDown={() => {
                setUnreadCount(0)
                onChatSelect(chat)
              }}
              className="flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition hover:bg-white/10 active:bg-white/5"
            >
              {/* Avatar */}
              <div className="relative h-12 w-12 shrink-0">
                {chat.type === 'group' ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-700/50 border border-violet-500/30">
                    {chat.avatar_url ? (
                      <img src={chat.avatar_url} className="h-full w-full rounded-full object-cover" alt={chat.name} />
                    ) : (
                      <Users className="h-5 w-5 text-violet-300" />
                    )}
                  </div>
                ) : (
                  <div className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                  </div>
                )}
                {chat.is_pinned && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600">
                    <Pin className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-sm font-semibold text-white">{chat.name}</h3>
                  <span className="ml-2 shrink-0 text-[10px] text-violet-400">{chat.last_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs text-gray-400">{chat.last_message}</p>
                  {(chat.unread_count ?? 0) > 0 && (
                    <span className="ml-2 shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Swipe/hover actions */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden gap-1 group-hover:flex">
              <button
                onClick={() => togglePin(chat.id)}
                title={chat.is_pinned ? 'Unpin' : 'Pin'}
                className="rounded-lg bg-black/40 p-1.5 text-gray-400 hover:text-violet-400 transition"
              >
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => toggleArchive(chat.id)}
                title={chat.is_archived ? 'Unarchive' : 'Archive'}
                className="rounded-lg bg-black/40 p-1.5 text-gray-400 hover:text-amber-400 transition"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Archived toggle */}
        {archivedChats.length > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition"
          >
            <Archive className="h-3.5 w-3.5" />
            {showArchived ? 'Hide archived' : `Show archived (${archivedChats.length})`}
          </button>
        )}
      </div>
    </aside>
  )
}