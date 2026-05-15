"use client"

import { useState } from 'react'
import { Check, CheckCheck, Reply, Smile, Edit2, Trash2, Star, Forward, MoreHorizontal, CornerUpLeft } from 'lucide-react'
import type { Message } from '@/types/chat'

type Props = {
  msg: Message
  isMe: boolean
  currentUser: string
  onReply: (msg: Message) => void
  onReact: (msgId: string, emoji: string) => void
  onEdit: (msg: Message) => void
  onDelete: (msgId: string, forEveryone: boolean) => void
  onStar: (msgId: string) => void
  onForward: (msg: Message) => void
  replySource?: Message | null
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

export default function MessageBubble({
  msg, isMe, currentUser, onReply, onReact, onEdit, onDelete, onStar, onForward, replySource
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  if (msg.is_deleted && !msg.deleted_for.includes(currentUser)) {
    return (
      <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className="italic text-xs text-gray-500 px-4 py-2 rounded-2xl bg-white/5">
          This message was deleted
        </div>
      </div>
    )
  }

  if (msg.deleted_for.includes(currentUser)) return null

  return (
    <div
      className={`group flex w-full ${isMe ? 'justify-end' : 'justify-start'} relative`}
      onMouseLeave={() => { setShowMenu(false); setShowReactions(false) }}
    >
      <div className={`relative max-w-[75%]`}>

        {/* Reply preview */}
        {replySource && (
          <div className={`mb-1 flex items-start gap-2 rounded-lg border-l-2 border-violet-400 bg-black/30 px-3 py-1.5 text-xs`}>
            <CornerUpLeft className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" />
            <div>
              <span className="font-semibold text-violet-300">{replySource.sender}</span>
              <p className="truncate text-gray-400 max-w-[200px]">{replySource.content}</p>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-3 py-2 text-sm text-white backdrop-blur-md ${
          isMe
            ? 'rounded-tr-none border border-violet-500/20 bg-violet-600/40'
            : 'rounded-tl-none border border-white/10 bg-white/10'
        }`}>
          {!isMe && (
            <span className="block mb-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              {msg.sender}
            </span>
          )}

          {/* Media */}
          {msg.media_url && msg.media_type === 'image' && (
            <img
              src={msg.media_url}
              alt="media"
              className="mb-2 max-h-60 w-full rounded-xl object-cover cursor-pointer"
            />
          )}
          {msg.media_url && msg.media_type === 'audio' && (
            <audio controls src={msg.media_url} className="mb-2 w-full" />
          )}
          {msg.media_url && msg.media_type === 'file' && (
            

            <a
              href={msg.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-xs text-violet-300 hover:text-violet-200"
            >
              📎 Download file
            </a>
          )}

          {/* Text */}
          {msg.content && (
            <div className="pr-14">
              {msg.content}
              {msg.is_edited && <span className="ml-1 text-[9px] text-white/40">(edited)</span>}
              {msg.is_forwarded && <span className="ml-1 text-[9px] text-white/40">↗ forwarded</span>}
            </div>
          )}

          {/* Timestamp + status */}
          <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1">
            <span className="text-[9px] text-white/50">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            {isMe && (
              <span>
                {msg.status === 'sent' && <Check className="h-3 w-3 text-white/60" strokeWidth={3} />}
                {msg.status === 'delivered' && <CheckCheck className="h-3 w-3 text-gray-400" strokeWidth={3} />}
                {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-emerald-400" strokeWidth={3} />}
              </span>
            )}
          </div>
        </div>

        {/* Reactions display */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(
              msg.reactions.reduce((acc: Record<string, number>, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1
                return acc
              }, {})
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg.id, emoji)}
                className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs"
              >
                {emoji} {count > 1 ? count : ''}
              </button>
            ))}
          </div>
        )}

        {/* Hover action bar */}
        <div className={`absolute ${isMe ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} top-0 hidden items-center gap-1 group-hover:flex`}>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="rounded-lg bg-white/10 p-1.5 text-gray-400 hover:text-white transition"
          >
            <Smile className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onReply(msg)}
            className="rounded-lg bg-white/10 p-1.5 text-gray-400 hover:text-white transition"
          >
            <Reply className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg bg-white/10 p-1.5 text-gray-400 hover:text-white transition"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick reaction picker */}
        {showReactions && (
          <div className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-10 flex gap-1 rounded-full border border-white/10 bg-zinc-900 px-2 py-1 z-20`}>
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onReact(msg.id, emoji); setShowReactions(false) }}
                className="text-lg transition hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Context menu */}
        {showMenu && (
          <div className={`absolute ${isMe ? 'right-0' : 'left-0'} top-8 z-30 min-w-[160px] rounded-xl border border-white/10 bg-zinc-900 p-1 shadow-xl`}>
            {[
              { icon: Reply, label: 'Reply', action: () => { onReply(msg); setShowMenu(false) } },
              { icon: Forward, label: 'Forward', action: () => { onForward(msg); setShowMenu(false) } },
              { icon: Star, label: msg.is_starred ? 'Unstar' : 'Star', action: () => { onStar(msg.id); setShowMenu(false) } },
              ...(isMe ? [
                { icon: Edit2, label: 'Edit', action: () => { onEdit(msg); setShowMenu(false) } },
                { icon: Trash2, label: 'Delete for me', action: () => { onDelete(msg.id, false); setShowMenu(false) } },
                { icon: Trash2, label: 'Delete for everyone', action: () => { onDelete(msg.id, true); setShowMenu(false) } },
              ] : [
                { icon: Trash2, label: 'Delete for me', action: () => { onDelete(msg.id, false); setShowMenu(false) } },
              ]),
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 ${
                  label.includes('Delete') ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}