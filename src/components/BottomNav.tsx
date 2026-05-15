"use client"

import { MessageSquare, Users, Settings, UserCircle } from 'lucide-react'

type Tab = 'chats' | 'groups' | 'settings' | 'profile'

type Props = {
  currentUser: string
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onOpenProfile: () => void
}

const tabs: { id: Tab; icon: typeof MessageSquare; label: string }[] = [
  { id: 'chats', icon: MessageSquare, label: 'Chats' },
  { id: 'groups', icon: Users, label: 'Groups' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'profile', icon: UserCircle, label: 'Profile' },
]

export default function BottomNav({ currentUser, activeTab, onTabChange, onOpenProfile }: Props) {
  return (
    <div className="fixed bottom-8 left-1/2 z-50 flex h-14 w-[min(380px,90%)] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 shadow-2xl backdrop-blur-3xl sm:hidden">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => id === 'profile' ? onOpenProfile() : onTabChange(id)}
          className={`flex flex-col items-center gap-0.5 transition active:scale-90 ${
            activeTab === id ? 'text-violet-500' : 'text-gray-400'
          }`}
        >
          {id === 'profile' ? (
            <div className="h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/20">
              <img
                src={`https://avatars.githubusercontent.com/${currentUser}`}
                alt="Me"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.src = ''
                  t.parentElement!.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-violet-700 text-[8px] font-bold text-white">${currentUser[0]?.toUpperCase()}</div>`
                }}
              />
            </div>
          ) : (
            <Icon className="h-5 w-5" strokeWidth={2} />
          )}
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}