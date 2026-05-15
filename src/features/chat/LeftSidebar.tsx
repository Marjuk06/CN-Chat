"use client"

import { MessageCircle, Users, Phone, Bookmark, Settings, UserCircle, Plus } from 'lucide-react'

type Tab = 'chats' | 'groups' | 'settings' | 'profile'

type Props = {
  currentUser: string
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onOpenProfile: () => void
  onCreateGroup: () => void
}

const navItems: { tab: Tab; icon: typeof MessageCircle; label: string }[] = [
  { tab: 'chats', icon: MessageCircle, label: 'Chats' },
  { tab: 'groups', icon: Users, label: 'Groups' },
  { tab: 'profile', icon: UserCircle, label: 'Profile' },
  { tab: 'settings', icon: Settings, label: 'Settings' },
]

export default function LeftSidebar({ currentUser, activeTab, onTabChange, onOpenProfile, onCreateGroup }: Props) {
  return (
    <nav className="hidden w-16 flex-col items-center border-r border-white/10 bg-black/40 py-4 backdrop-blur-2xl sm:flex">
      {/* Avatar */}
      <button
        onClick={onOpenProfile}
        className="mb-8 h-10 w-10 overflow-hidden rounded-full border border-white/10 hover:border-violet-500/50 transition"
        title="Edit profile"
      >
        <img
          src={`https://avatars.githubusercontent.com/${currentUser}`}
          alt="Profile"
          className="h-full w-full object-cover"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.style.display = 'none'
            t.parentElement!.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-violet-700 text-white text-sm font-bold">${currentUser[0]?.toUpperCase()}</div>`
          }}
        />
      </button>

      {/* Nav icons */}
      <div className="flex flex-col gap-2 text-gray-400">
        {navItems.map(({ tab, icon: Icon, label }) => (
          <button
            key={tab}
            onClick={() => tab === 'profile' ? onOpenProfile() : onTabChange(tab)}
            title={label}
            className={`rounded-xl p-3 transition ${
              activeTab === tab
                ? 'bg-violet-500/10 text-violet-500'
                : 'hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={1.5} />
          </button>
        ))}
      </div>

      {/* Create group */}
      <div className="mt-auto">
        <button
          onClick={onCreateGroup}
          title="Create group"
          className="rounded-xl p-3 text-gray-400 transition hover:bg-violet-500/10 hover:text-violet-400"
        >
          <Plus className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  )
}