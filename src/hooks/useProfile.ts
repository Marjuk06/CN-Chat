import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/chat'

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }

    fetchProfile()

    const channel = supabase
      .channel(`profile-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      }, (payload) => {
        setProfile(payload.new as Profile)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const updateProfile = async (updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (data) setProfile(data)
    return { data, error }
  }

  const setOnlineStatus = async (isOnline: boolean) => {
    await supabase.from('profiles').update({
      is_online: isOnline,
      last_seen: new Date().toISOString(),
    }).eq('id', userId)
  }

  return { profile, loading, updateProfile, setOnlineStatus }
}