import { MessageSquare, Users, Settings, User } from 'lucide-react'

export default function BottomNav() {
  return (
    <div className="fixed bottom-8 left-1/2 z-50 flex h-14 w-[min(380px,90%)] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 shadow-2xl backdrop-blur-3xl sm:hidden">
      <button className="flex flex-col items-center gap-0.5 text-violet-500 transition active:scale-90">
        <MessageSquare className="h-5 w-5" strokeWidth={2} />
        <span className="text-[10px] font-medium">Chats</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 text-gray-400 transition active:scale-90">
        <Users className="h-5 w-5" strokeWidth={2} />
        <span className="text-[10px] font-medium">Contacts</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 text-gray-400 transition active:scale-90">
        <Settings className="h-5 w-5" strokeWidth={2} />
        <span className="text-[10px] font-medium">Settings</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 text-gray-400 transition active:scale-90">
        <div className="h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/20">
          <img src="https://avatars.githubusercontent.com/Marjuk06" alt="Me" />
        </div>
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </div>
  )
}