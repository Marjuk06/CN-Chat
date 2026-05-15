"use client"

import { useState, useEffect } from 'react'
import { X, Users, Link, Shield, UserMinus, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Member = { user_id: string; role: 'admin' | 'member' }

export default function GroupSettings({
  groupId,
  currentUser,
  onClose,
}: {
  groupId: string
  currentUser: string
  onClose: () => void
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [group, setGroup] = useState<{ name: string; description: string | null; invite_link: string } | null>(null)
  const [myRole, setMyRole] = useState<'admin' | 'member'>('member')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data: g } = await supabase
        .from('groups')
        .select('name, description, invite_link')
        .eq('id', groupId)
        .single()
      if (g) setGroup(g)

      const { data: m } = await supabase
        .from('group_members')
        .select('user_id, role')
        .eq('group_id', groupId)
      if (m) {
        setMembers(m as Member[])
        const me = m.find((mm: Member) => mm.user_id === currentUser)
        if (me) setMyRole(me.role as 'admin' | 'member')
      }
    }
    fetch()
  }, [groupId, currentUser])

  const copyInviteLink = () => {
    if (!group) return
    const link = `${window.location.origin}/?join=${group.invite_link}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const removeMember = async (userId: string) => {
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
    setMembers((prev) => prev.filter((m) => m.user_id !== userId))
  }

  const promoteToAdmin = async (userId: string) => {
    await supabase
      .from('group_members')
      .update({ role: 'admin' })
      .eq('group_id', groupId)
      .eq('user_id', userId)
    setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, role: 'admin' } : m))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-white/10 bg-zinc-900 p-6 max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Group settings</h2>
        </div>

        {group && (
          <div className="mb-6 space-y-1">
            <h3 className="text-base font-semibold text-white">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-gray-400">{group.description}</p>
            )}
          </div>
        )}

        {/* Invite link */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-white">Invite link</span>
          </div>
          <button
            onClick={copyInviteLink}
            className="w-full rounded-lg bg-violet-600/20 px-3 py-2 text-xs text-violet-300 hover:bg-violet-600/30 transition text-left"
          >
            {copied ? '✓ Copied!' : `${window.location.origin}/?join=${group?.invite_link}`}
          </button>
        </div>

        {/* Members */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">{members.length} members</span>
          </div>

          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-700/50 text-xs font-bold text-violet-200">
                    {m.user_id[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm text-white">{m.user_id}</span>
                    {m.role === 'admin' && (
                      <span className="ml-2 text-[10px] text-amber-400 font-semibold">ADMIN</span>
                    )}
                  </div>
                </div>
                {myRole === 'admin' && m.user_id !== currentUser && (
                  <div className="flex gap-1">
                    {m.role !== 'admin' && (
                      <button
                        onClick={() => promoteToAdmin(m.user_id)}
                        title="Make admin"
                        className="rounded-lg bg-amber-600/20 p-1.5 text-amber-400 hover:bg-amber-600/30 transition"
                      >
                        <Crown className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeMember(m.user_id)}
                      title="Remove"
                      className="rounded-lg bg-red-600/20 p-1.5 text-red-400 hover:bg-red-600/30 transition"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}