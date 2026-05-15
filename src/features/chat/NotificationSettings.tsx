"use client"

import { useState, useEffect } from 'react'
import { Bell, BellOff, Volume2 } from 'lucide-react'

type Settings = {
  enabled: boolean
  muted: boolean
  mentions_only: boolean
  sound: boolean
}

export default function NotificationSettings({ chatId }: { chatId: string }) {
  const key = `notif-${chatId}`
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') return { enabled: true, muted: false, mentions_only: false, sound: true }
    try {
      return JSON.parse(localStorage.getItem(key) || '{}')
    } catch {
      return { enabled: true, muted: false, mentions_only: false, sound: true }
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(settings))
  }, [settings, key])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') setSettings((s) => ({ ...s, enabled: true }))
    }
  }

  const toggle = (field: keyof Settings) => {
    setSettings((s) => ({ ...s, [field]: !s[field] }))
  }

  const rows: { key: keyof Settings; label: string; sub: string }[] = [
    { key: 'enabled', label: 'Push notifications', sub: 'Get notified of new messages' },
    { key: 'muted', label: 'Mute chat', sub: 'No notifications from this chat' },
    { key: 'mentions_only', label: 'Mentions only', sub: 'Only notify when mentioned' },
    { key: 'sound', label: 'Sound', sub: 'Play sound on new messages' },
  ]

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        {settings.muted ? <BellOff className="h-4 w-4 text-gray-400" /> : <Bell className="h-4 w-4 text-violet-400" />}
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
      </div>

      {'Notification' in window && Notification.permission === 'default' && (
        <button
          onClick={requestPermission}
          className="mb-2 w-full rounded-lg bg-violet-600/20 px-3 py-2 text-xs text-violet-300 hover:bg-violet-600/30 transition"
        >
          Enable browser notifications
        </button>
      )}

      {rows.map(({ key, label, sub }) => (
        <div key={key} className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm text-gray-200">{label}</p>
            <p className="text-xs text-gray-500">{sub}</p>
          </div>
          <button
            onClick={() => toggle(key)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              settings[key] ? 'bg-violet-600' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings[key] ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}