"use client"

import { useState } from 'react'
import { Eye, EyeOff, Circle } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

export default function StatusControls({ userId }: { userId: string }) {
  const { profile, updateProfile } = useProfile(userId)

  const toggleLastSeen = async () => {
    await updateProfile({ show_last_seen: !profile?.show_last_seen })
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Privacy & Status</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle
            className={`h-3 w-3 fill-current ${
              profile?.is_online ? 'text-emerald-400' : 'text-gray-500'
            }`}
          />
          <span className="text-sm text-gray-300">
            {profile?.is_online ? 'Online' : `Last seen ${formatLastSeen(profile?.last_seen || '')}`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300">Show last seen</p>
          <p className="text-xs text-gray-500">Let others see when you were last online</p>
        </div>
        <button
          onClick={toggleLastSeen}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
            profile?.show_last_seen
              ? 'bg-violet-600/30 text-violet-400'
              : 'bg-white/5 text-gray-500'
          }`}
        >
          {profile?.show_last_seen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}