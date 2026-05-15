export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  status: string
  last_seen: string
  is_online: boolean
  show_last_seen: boolean
  created_at: string
}

export type Message = {
  id: string
  created_at: string
  content: string
  sender: string
  status: 'sent' | 'delivered' | 'read'
  reply_to: string | null
  is_edited: boolean
  is_deleted: boolean
  deleted_for: string[]
  media_url: string | null
  media_type: 'image' | 'audio' | 'video' | 'file' | null
  is_starred: boolean
  is_forwarded: boolean
  scheduled_at: string | null
  disappears_at: string | null
  reactions?: Reaction[]
}

export type Reaction = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export type TypingStatus = {
  id: string
  chat_id: string
  user_id: string
  is_typing: boolean
  updated_at: string
}

export type Group = {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  invite_link: string
  created_by: string
  is_announcement: boolean
  created_at: string
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
}

export type BlockedUser = {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

export type Chat = {
  id: string
  type: 'direct' | 'group'
  name: string
  avatar_url?: string | null
  last_message?: string
  last_time?: string
  unread_count?: number
  is_pinned?: boolean
  is_archived?: boolean
  is_muted?: boolean
}