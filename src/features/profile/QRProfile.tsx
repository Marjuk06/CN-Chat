"use client"

import { useEffect, useRef } from 'react'
import { Share2 } from 'lucide-react'

export default function QRProfile({ username }: { username: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?user=${username}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple QR-like visual (real QR: install 'qrcode' npm package and use QRCode.toCanvas)
    // For production: npm install qrcode @types/qrcode
    // import QRCode from 'qrcode'
    // QRCode.toCanvas(canvas, profileUrl, { width: 200, margin: 2 })

    // Placeholder visual
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 200, 200)
    ctx.fillStyle = '#7c3aed'
    ctx.font = 'bold 13px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Install qrcode package', 100, 90)
    ctx.fillText('for real QR code', 100, 110)
    ctx.font = '11px monospace'
    ctx.fillStyle = '#6d28d9'
    ctx.fillText('@' + username, 100, 140)
  }, [username, profileUrl])

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Chat with ${username} on CN Chat`,
        url: profileUrl,
      })
    } else {
      await navigator.clipboard.writeText(profileUrl)
      alert('Profile link copied!')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-sm font-semibold text-white">Share profile</h3>
      <div className="rounded-xl overflow-hidden border-4 border-violet-500/30">
        <canvas ref={canvasRef} width={200} height={200} />
      </div>
      <p className="text-xs text-gray-400 text-center break-all">{profileUrl}</p>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500 transition"
      >
        <Share2 className="h-4 w-4" />
        Share link
      </button>
    </div>
  )
}