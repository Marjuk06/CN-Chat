"use client"

import { useState, useEffect } from 'react'
import { UserX, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { BlockedUser } from '@/types/chat'

export default function BlockedUsers({ currentUser }: { currentUser: string }) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', currentUser)
      if (data) setBlockedUsers(data)
    }
    fetch()
  }, [currentUser])

  const unblockUser = async (blockedId: string) => {
    await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', currentUser)
      .eq('blocked_id', blockedId)
    setBlockedUsers((prev) => prev.filter((b) => b.blocked_id !== blockedId))
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-sm text-gray-500">No blocked users</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
      <h3 className="mb-3 text-sm font-semibold text-white">Blocked users</h3>
      {blockedUsers.map((b) => (
        <div key={b.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-red-400" />
            <span className="text-sm text-white">{b.blocked_id}</span>
          </div>
          <button
            onClick={() => unblockUser(b.blocked_id)}
            className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-600/30 transition"
          >
            <UserCheck className="h-3 w-3" />
            Unblock
          </button>
        </div>
      ))}
    </div>
  )
}
