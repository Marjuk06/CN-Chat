"use client"

import { useState, useEffect } from 'react'
import LeftSidebar from '@/features/chat/LeftSidebar'
import ChatList from '@/features/chat/ChatList'
import ChatArea from '@/features/chat/ChatArea'
import GroupChatArea from '@/features/groups/GroupChatArea'
import BottomNav from '@/components/BottomNav'
import ProfileModal from '@/features/profile/ProfileModal'
import CreateGroup from '@/features/groups/CreateGroup'
import type { Chat } from '@/types/chat'

export default function Home() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [currentUser, setCurrentUser] = useState('Marjuk')
  const [showProfile, setShowProfile] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'settings' | 'profile'>('chats')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const u = params.get('user')
    if (u) setCurrentUser(u)
  }, [])

  return (
    <main className="relative flex h-screen w-full items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex h-screen w-full overflow-hidden bg-black/30 backdrop-blur-xl sm:flex-row">

        {/* Desktop left icon nav */}
        <div className="hidden sm:flex">
          <LeftSidebar
            currentUser={currentUser}
            onOpenProfile={() => setShowProfile(true)}
            onCreateGroup={() => setShowCreateGroup(true)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Chat list panel — hidden on mobile when a chat is open */}
        <div className={`w-full sm:w-72 ${activeChat ? 'hidden sm:flex sm:flex-col' : 'flex flex-col'}`}>
          <ChatList
            currentUser={currentUser}
            activeTab={activeTab}
            onChatSelect={setActiveChat}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
          {!activeChat && (
            <BottomNav
              currentUser={currentUser}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenProfile={() => setShowProfile(true)}
            />
          )}
        </div>

        {/* Main content area */}
        <div className={`flex-1 ${!activeChat ? 'hidden sm:flex' : 'flex flex-col'}`}>
          {activeChat ? (
            activeChat.type === 'group' ? (
              <GroupChatArea
                group={{ id: activeChat.id, name: activeChat.name, avatar_url: activeChat.avatar_url }}
                currentUser={currentUser}
                onBack={() => setActiveChat(null)}
              />
            ) : (
              <ChatArea
                chatId={activeChat.id}
                chatName={activeChat.name}
                currentUser={currentUser}
                onBack={() => setActiveChat(null)}
              />
            )
          ) : (
            <div className="hidden flex-1 items-center justify-center bg-black/20 sm:flex">
              <p className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-500 border border-white/5">
                Select a chat to start messaging
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProfile && (
        <ProfileModal userId={currentUser} onClose={() => setShowProfile(false)} />
      )}
      {showCreateGroup && (
        <CreateGroup currentUser={currentUser} onClose={() => setShowCreateGroup(false)} />
      )}
    </main>
  )
}