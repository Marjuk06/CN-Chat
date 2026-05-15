"use client"

import { useState, useRef } from 'react'
import { Mic, Square, Send, Trash2 } from 'lucide-react'
import { uploadFile } from '@/lib/storage'

export default function VoiceRecorder({
  onSend,
  currentUser,
}: {
  onSend: (url: string) => void
  currentUser: string
}) {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioBlob(blob)
      setAudioUrl(URL.createObjectURL(blob))
      stream.getTracks().forEach((t) => t.stop())
    }

    recorder.start()
    setRecording(true)
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const cancelRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setSeconds(0)
  }

  const sendVoice = async () => {
    if (!audioBlob) return
    setUploading(true)
    const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
    const path = `${currentUser}/${file.name}`
    const url = await uploadFile(file, 'voice-messages', path)
    if (url) onSend(url)
    setAudioBlob(null)
    setAudioUrl(null)
    setUploading(false)
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (audioUrl) {
    return (
      <div className="flex items-center gap-3">
        <button onClick={cancelRecording} className="text-red-400 hover:text-red-300">
          <Trash2 className="h-5 w-5" />
        </button>
        <audio src={audioUrl} controls className="flex-1 h-8" />
        <button
          onClick={sendVoice}
          disabled={uploading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }

  return (
    <button
      onPointerDown={startRecording}
      onPointerUp={stopRecording}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
        recording
          ? 'bg-red-600/30 text-red-400 animate-pulse'
          : 'bg-white/5 text-gray-400 hover:text-white'
      }`}
    >
      {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {recording && <span className="text-xs">{formatTime(seconds)}</span>}
    </button>
  )
}
