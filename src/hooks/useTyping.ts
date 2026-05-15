import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useTyping(chatId: string, currentUser: string) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setTyping = useCallback(async (isTyping: boolean) => {
    await supabase.from('typing_status').upsert({
      chat_id: chatId,
      user_id: currentUser,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'chat_id,user_id' })
  }, [chatId, currentUser])

  const handleTyping = useCallback(() => {
    setTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false)
    }, 2000)
  }, [setTyping])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      setTyping(false)
    }
  }, [setTyping])

  return { handleTyping }
}
