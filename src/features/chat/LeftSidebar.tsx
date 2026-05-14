import { MessageCircle, Users, Phone, Bookmark, Settings, Moon } from 'lucide-react'

export default function LeftSidebar() {
  return (
    <nav className="hidden w-16 flex-col items-center border-r border-white/10 bg-black/40 py-4 backdrop-blur-2xl sm:flex">
      <div className="mb-8 h-10 w-10 overflow-hidden rounded-full border border-white/10">
        <img 
          src="https://avatars.githubusercontent.com/Marjuk06" 
          alt="Profile" 
          className="h-full w-full object-cover" 
        />
      </div>

      <div className="flex flex-col gap-6 text-gray-400">
        <button className="rounded-xl p-3 text-violet-500 bg-violet-500/10 transition hover:bg-violet-500/20">
          <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <button className="rounded-xl p-3 transition hover:bg-white/10 hover:text-white">
          <Users className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <button className="rounded-xl p-3 transition hover:bg-white/10 hover:text-white">
          <Phone className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <button className="rounded-xl p-3 transition hover:bg-white/10 hover:text-white">
          <Bookmark className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-4 text-gray-400">
        <button className="rounded-xl p-3 transition hover:bg-white/10 hover:text-white">
          <Moon className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <button className="rounded-xl p-3 transition hover:bg-white/10 hover:text-white">
          <Settings className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  )
}