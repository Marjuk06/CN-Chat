"use client"

import { useState } from 'react'
import LeftSidebar from '@/features/chat/LeftSidebar'
import ChatList from '@/features/chat/ChatList'
import ChatArea from '@/features/chat/ChatArea'
import BottomNav from '@/components/BottomNav'

export default function Home() {
  const [activeChat, setActiveChat] = useState<string | null>(null)

  return (
    <main className="relative flex h-screen w-full items-center justify-center bg-zinc-950 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />

      <div className="relative z-10 flex h-screen w-full overflow-hidden bg-black/30 backdrop-blur-xl sm:flex-row">
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex">
          <LeftSidebar />
        </div>

        {/* View Switcher Logic */}
        <div className={`w-full sm:w-72 ${activeChat ? 'hidden sm:flex' : 'flex flex-col'}`}>
          <ChatList onChatSelect={() => setActiveChat('friend1')} />
          {!activeChat && <BottomNav />}
        </div>

        <div className={`flex-1 ${!activeChat ? 'hidden sm:flex' : 'flex flex-col'}`}>
          {activeChat ? (
            <ChatArea onBack={() => setActiveChat(null)} />
          ) : (
            <div className="hidden flex-1 items-center justify-center bg-black/20 sm:flex">
              <p className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-500 border border-white/5">
                Select a chat to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}