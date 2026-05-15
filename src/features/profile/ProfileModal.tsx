"use client"

import { useState, useRef } from 'react'
import { X, Camera, Check } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { uploadFile } from '@/lib/storage'

export default function ProfileModal({ 
  userId, 
  onClose 
}: { 
  userId: string
  onClose: () => void 
}) {
  const { profile, updateProfile } = useProfile(userId)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [status, setStatus] = useState(profile?.status || '')
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const path = `${userId}/avatar.${file.name.split('.').pop()}`
    const url = await uploadFile(file, 'avatars', path)
    if (url) await updateProfile({ avatar_url: url })
    setAvatarUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({
      display_name: displayName,
      bio,
      status,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-lg font-semibold text-white">Edit profile</h2>

        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-violet-600/30 overflow-hidden border-2 border-violet-500/40">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-violet-200">
                  {(profile?.display_name || profile?.username || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition"
            >
              {avatarUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:outline-none"
              placeholder="About you..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Status</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:outline-none"
              placeholder="Hey there! I am using CN Chat"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition disabled:opacity-50"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save changes
        </button>
      </div>
    </div>
  )
}