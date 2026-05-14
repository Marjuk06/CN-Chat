"use client"

import { useState, useEffect, useRef } from 'react'
import { Check, CheckCheck, Send, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Message = {
  id: string
  created_at: string
  content: string
  sender: string
  status: 'sent' | 'delivered' | 'read' 
}

export default function ChatArea({ onBack }: { onBack?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  
  // Add this useEffect inside the component to handle auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  // This looks for ?user=Name in your browser address bar
// Default is "Marjuk" if no name is provided
const [currentUser, setCurrentUser] = useState("Marjuk")

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const userParam = params.get('user')
  if (userParam) setCurrentUser(userParam)
}, [])

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  useEffect(() => {
  const markAsRead = async () => {
    // Update messages to 'read' only if they were sent by the OTHER person
    const { error } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('status', 'sent')
      .neq('sender', currentUser) 

    if (error) console.error("Error marking as read:", error)
  }

  // Run this whenever the messages array updates
  if (messages.length > 0) {
    markAsRead()
  }
}, [messages, currentUser])

  const handleSend = async () => {
    if (!inputText.trim()) return

    await supabase.from('messages').insert([
      { content: inputText, sender: currentUser }
    ])

    setInputText('')
  }

  return (
    <section className="flex flex-1 flex-col relative z-10 bg-black/20">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-white/5 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Back Button - Visible only on mobile */}
          <button 
            onClick={onBack}
            className="p-1 text-gray-400 hover:text-white sm:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          <div className="h-10 w-10 rounded-full bg-violet-600/30 flex items-center justify-center">
            <span className="text-sm font-bold text-violet-200">CN</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Global Chat</h2>
            <p className="text-xs text-violet-400">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-gray-400">
          <button className="transition hover:text-white"><Phone className="h-5 w-5" /></button>
          <button className="transition hover:text-white"><Video className="h-5 w-5" /></button>
          <button className="transition hover:text-white"><MoreVertical className="h-5 w-5" /></button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pb-24 space-y-4 sm:pb-6">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser
          
          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
  <div className={`relative max-w-[75%] rounded-2xl px-3 py-2 text-sm text-white backdrop-blur-md ${
    isMe 
      ? 'rounded-tr-none border border-violet-500/20 bg-violet-600/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
      : 'rounded-tl-none border border-white/10 bg-white/10'
  }`}>
    {!isMe && <span className="text-[10px] text-violet-300 block mb-0.5 font-bold uppercase tracking-wider">{msg.sender}</span>}
    
    <div className="pr-12"> {/* Space for the timestamp */}
      {msg.content}
    </div>

    <div className="absolute bottom-1 right-2 flex items-center gap-1">
  <span className="text-[9px] text-white/50">
    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
  </span>
  
  {isMe && (
    <div className="flex items-center">
      {msg.status === 'sent' && (
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      )}
      {msg.status === 'delivered' && (
        <CheckCheck className="h-3 w-3 text-gray-400" strokeWidth={3} />
      )}
      {msg.status === 'read' && (
        <CheckCheck className="h-3 w-3 text-emerald-400" strokeWidth={3} />
      )}
    </div>
  )}
</div>
  </div>
</div>
          )
        })}
      </div>

      <footer className="border-t border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/50 p-2 pr-3 backdrop-blur-xl">
          <button className="p-2 text-gray-400 hover:text-white transition"><Paperclip className="h-5 w-5" /></button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message..." 
            className="flex-1 bg-transparent px-2 text-sm text-white focus:outline-none placeholder:text-gray-500"
          />
          <button className="p-2 text-gray-400 hover:text-white transition"><Smile className="h-5 w-5" /></button>
          <button 
            onClick={handleSend}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white transition shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:bg-violet-500 hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </section>
  )
}