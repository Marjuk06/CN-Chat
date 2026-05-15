"use client"

import { useState } from 'react'
import { X, Users, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/storage'

export default function CreateGroup({
  currentUser,
  onClose,
}: {
  currentUser: string
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [members, setMembers] = useState<string[]>([])
  const [memberInput, setMemberInput] = useState('')
  const [loading, setLoading] = useState(false)

  const addMember = () => {
    const trimmed = memberInput.trim()
    if (trimmed && !members.includes(trimmed) && trimmed !== currentUser) {
      setMembers((m) => [...m, trimmed])
      setMemberInput('')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const path = `groups/${Date.now()}-avatar.${file.name.split('.').pop()}`
    const url = await uploadFile(file, 'avatars', path)
    if (url) setAvatarUrl(url)
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)

    const { data: group, error } = await supabase
      .from('groups')
      .insert([{ name, description, avatar_url: avatarUrl, created_by: currentUser }])
      .select()
      .single()

    if (error || !group) { setLoading(false); return }

    const allMembers = [currentUser, ...members].map((uid) => ({
      group_id: group.id,
      user_id: uid,
      role: uid === currentUser ? 'admin' : 'member',
    }))

    await supabase.from('group_members').insert(allMembers)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Create group</h2>
        </div>

        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <label className="relative cursor-pointer">
            <div className="h-20 w-20 rounded-full bg-violet-600/30 border-2 border-violet-500/40 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} className="h-full w-full object-cover" alt="Group" />
              ) : (
                <Camera className="h-8 w-8 text-violet-300" />
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Group name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none"
              placeholder="Group name"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none"
              placeholder="What's this group about?"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Add members</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMember()}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                placeholder="Username + Enter"
              />
            </div>
            {members.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {members.map((m) => (
                  <span key={m} className="flex items-center gap-1 rounded-full bg-violet-600/20 px-2 py-0.5 text-xs text-violet-300">
                    {m}
                    <button onClick={() => setMembers((prev) => prev.filter((u) => u !== m))} className="hover:text-white">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="mt-6 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create group'}
        </button>
      </div>
    </div>
  )
}