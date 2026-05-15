"use client"

import { useState, useEffect, useRef } from 'react'
import { Users, MoreVertical, Search, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import MessageBubble from '@/features/chat/MessageBubble'
import TypingIndicator from '@/features/chat/TypingIndicator'
import MessageInput from '@/features/chat/MessageInput'
import ChatSearch from '@/features/chat/ChatSearch'
import GroupSettings from '@/features/groups/GroupSettings'
import { useTyping } from '@/hooks/useTyping'
import type { Message, Reaction } from '@/types/chat'

type Props = {
  group: { id: string; name: string; avatar_url?: string | null }
  currentUser: string
  onBack: () => void
}

export default function GroupChatArea({ group, currentUser, onBack }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editMessage, setEditMessage] = useState<Message | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const { handleTyping } = useTyping(group.id, currentUser)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, reactions(*)')
        .eq('chat_id', group.id)
        .order('created_at', { ascending: true })
      if (data) setMessages(data as Message[])
    }
    fetch()

    const channel = supabase
      .channel(`group-${group.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${group.id}` }, async (payload) => {
        const { data } = await supabase
          .from('messages')
          .select('*, reactions(*)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages((prev) => [...prev, data as Message])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } as Message : m))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions' }, (payload) => {
        setMessages((prev) => prev.map((m) =>
          m.id === payload.new.message_id
            ? { ...m, reactions: [...(m.reactions || []), payload.new as Reaction] }
            : m
        ))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [group.id])

  const handleSend = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!content.trim() && !mediaUrl) return
    if (editMessage) {
      await supabase.from('messages').update({ content, is_edited: true }).eq('id', editMessage.id)
      setEditMessage(null)
      return
    }
    await supabase.from('messages').insert([{
      content,
      sender: currentUser,
      chat_id: group.id,
      reply_to: replyTo?.id || null,
      media_url: mediaUrl || null,
      media_type: mediaType || null,
    }])
    setReplyTo(null)
  }

  const handleReact = async (msgId: string, emoji: string) => {
    const existing = messages
      .find((m) => m.id === msgId)
      ?.reactions?.find((r) => r.user_id === currentUser && r.emoji === emoji)
    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('reactions').insert([{ message_id: msgId, user_id: currentUser, emoji }])
    }
  }

  const handleDelete = async (msgId: string, forEveryone: boolean) => {
    if (forEveryone) {
      await supabase.from('messages').update({ is_deleted: true }).eq('id', msgId)
    } else {
      const msg = messages.find((m) => m.id === msgId)
      await supabase.from('messages').update({
        deleted_for: [...(msg?.deleted_for || []), currentUser]
      }).eq('id', msgId)
    }
  }

  const handleStar = async (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId)
    await supabase.from('messages').update({ is_starred: !msg?.is_starred }).eq('id', msgId)
  }

  const handleForward = async (msg: Message) => {
    await supabase.from('messages').insert([{
      content: msg.content,
      sender: currentUser,
      chat_id: group.id,
      media_url: msg.media_url,
      media_type: msg.media_type,
      is_forwarded: true,
    }])
  }

  return (
    <section className="flex flex-1 flex-col relative z-10 bg-black/20">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-white/5 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-gray-400 hover:text-white sm:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-700/50 border border-violet-500/30 overflow-hidden">
            {group.avatar_url
              ? <img src={group.avatar_url} alt={group.name} className="h-full w-full object-cover" />
              : <Users className="h-5 w-5 text-violet-300" />
            }
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{group.name}</h2>
            <p className="text-xs text-violet-400">Group</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <button onClick={() => setShowSearch(!showSearch)} className="transition hover:text-white">
            <Search className="h-5 w-5" />
          </button>
          <button onClick={() => setShowSettings(true)} className="transition hover:text-white">
            <Settings className="h-5 w-5" />
          </button>
          <button className="transition hover:text-white">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      {showSearch && (
        <ChatSearch messages={messages} onHighlight={setHighlightId} onClose={() => setShowSearch(false)} />
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-24 space-y-3 sm:p-6 sm:pb-6">
        {messages.length === 0 && (
          <div className="flex justify-center py-12">
            <p className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-500 border border-white/5">
              No messages yet. Say hello! 👋
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            id={`msg-${msg.id}`}
            className={`transition-all duration-300 rounded-xl ${highlightId === msg.id ? 'bg-violet-500/20 -mx-2 px-2' : ''}`}
          >
            <MessageBubble
              msg={msg}
              isMe={msg.sender === currentUser}
              currentUser={currentUser}
              onReply={setReplyTo}
              onReact={handleReact}
              onEdit={setEditMessage}
              onDelete={handleDelete}
              onStar={handleStar}
              onForward={handleForward}
              replySource={msg.reply_to ? messages.find((m) => m.id === msg.reply_to) || null : null}
            />
          </div>
        ))}
      </div>

      <TypingIndicator chatId={group.id} currentUser={currentUser} />

      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        editMessage={editMessage}
        onClearEdit={() => setEditMessage(null)}
        currentUser={currentUser}
      />

      {showSettings && (
        <GroupSettings groupId={group.id} currentUser={currentUser} onClose={() => setShowSettings(false)} />
      )}
    </section>
  )
}