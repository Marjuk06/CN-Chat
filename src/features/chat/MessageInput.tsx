"use client"

import { useState, useRef } from 'react'
import { Paperclip, Smile, Send, X, Image as ImageIcon } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import GifPicker from './GifPicker'
import VoiceRecorder from './VoiceRecorder'
import type { Message } from '@/types/chat'

type Props = {
  onSend: (content: string, mediaUrl?: string, mediaType?: string) => void
  onTyping: () => void
  replyTo: Message | null
  onClearReply: () => void
  editMessage: Message | null
  onClearEdit: () => void
  currentUser: string
}

export default function MessageInput({
  onSend, onTyping, replyTo, onClearReply, editMessage, onClearEdit, currentUser
}: Props) {
  const [text, setText] = useState(editMessage?.content || '')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
    onClearReply()
    onClearEdit()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { uploadFile, getMediaType } = await import('@/lib/storage')
    const mediaType = getMediaType(file)
    const path = `${currentUser}/${Date.now()}-${file.name}`
    const url = await uploadFile(file, 'chat-media', path)
    if (url) onSend('', url, mediaType)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <footer className="relative border-t border-white/10 bg-white/5 p-4 backdrop-blur-md">
      {/* Reply / edit banner */}
      {(replyTo || editMessage) && (
        <div className="mb-2 flex items-center justify-between rounded-xl border-l-2 border-violet-400 bg-black/30 px-3 py-2">
          <div>
            <p className="text-[10px] font-semibold text-violet-300">
              {editMessage ? 'Editing message' : `Replying to ${replyTo?.sender}`}
            </p>
            <p className="truncate text-xs text-gray-400 max-w-[250px]">
              {(editMessage || replyTo)?.content}
            </p>
          </div>
          <button
            onClick={() => { onClearReply(); onClearEdit() }}
            className="text-gray-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/50 p-2 pr-3 backdrop-blur-xl">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-white transition"
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); onTyping() }}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Write a message..."
          className="flex-1 bg-transparent px-2 text-sm text-white focus:outline-none placeholder:text-gray-500"
        />

        {/* Emoji button */}
        <button
          onClick={() => { setShowEmoji(!showEmoji); setShowGif(false) }}
          className="p-2 text-gray-400 hover:text-white transition"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* GIF button */}
        <button
          onClick={() => { setShowGif(!showGif); setShowEmoji(false) }}
          className="p-2 text-gray-400 hover:text-white transition text-xs font-bold"
        >
          GIF
        </button>

        {/* Voice recorder */}
        <VoiceRecorder
          currentUser={currentUser}
          onSend={(url) => onSend('', url, 'audio')}
        />

        {/* Send */}
        {text.trim() && (
          <button
            onClick={handleSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition shadow-lg hover:bg-violet-500"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Pickers */}
      {showEmoji && (
        <EmojiPicker
          onSelect={(e) => setText((t) => t + e)}
          onClose={() => setShowEmoji(false)}
        />
      )}
      {showGif && (
        <GifPicker
          onSelect={(url) => { onSend('', url, 'image'); setShowGif(false) }}
          onClose={() => setShowGif(false)}
        />
      )}
    </footer>
  )
}