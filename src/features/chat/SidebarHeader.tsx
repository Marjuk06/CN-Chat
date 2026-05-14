import { Menu, Search } from 'lucide-react'

export default function SidebarHeader() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full rounded-xl bg-white/5 py-2 pl-10 pr-4 text-sm text-white border border-white/5 focus:border-violet-500/50 focus:outline-none transition"
          />
        </div>
      </div>
    </div>
  )
}