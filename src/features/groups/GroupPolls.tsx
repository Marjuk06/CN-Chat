"use client"

import { useState, useEffect } from 'react'
import { BarChart2, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type PollOption = { text: string; votes: string[] }
type Poll = { id: string; question: string; options: PollOption[]; created_by: string; created_at: string }

export default function GroupPolls({ groupId, currentUser }: { groupId: string; currentUser: string }) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [creating, setCreating] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  useEffect(() => {
    // Polls are stored as messages with media_type='poll' and content as JSON
    const fetch = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('sender', groupId)
        .eq('media_type', 'poll')
      if (data) {
        setPolls(data.map((d) => ({ ...JSON.parse(d.content), id: d.id })))
      }
    }
    fetch()
  }, [groupId])

  const createPoll = async () => {
    const validOptions = options.filter((o) => o.trim())
    if (!question.trim() || validOptions.length < 2) return

    const poll: Omit<Poll, 'id'> = {
      question,
      options: validOptions.map((text) => ({ text, votes: [] })),
      created_by: currentUser,
      created_at: new Date().toISOString(),
    }

    await supabase.from('messages').insert([{
      content: JSON.stringify(poll),
      sender: groupId,
      media_type: 'poll',
    }])

    setCreating(false)
    setQuestion('')
    setOptions(['', ''])
  }

  const vote = async (poll: Poll, optionIndex: number) => {
    const updated = { ...poll }
    updated.options = updated.options.map((opt, i) => {
      const votes = opt.votes.filter((v) => v !== currentUser)
      if (i === optionIndex) votes.push(currentUser)
      return { ...opt, votes }
    })

    await supabase
      .from('messages')
      .update({ content: JSON.stringify(updated) })
      .eq('id', poll.id)

    setPolls((prev) => prev.map((p) => (p.id === poll.id ? { ...updated, id: poll.id } : p)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Polls</h3>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 rounded-lg bg-violet-600/20 px-3 py-1.5 text-xs text-violet-300 hover:bg-violet-600/30 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          New poll
        </button>
      </div>

      {creating && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Poll question..."
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none"
          />
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt}
                onChange={(e) => setOptions((prev) => prev.map((o, j) => j === i ? e.target.value : o))}
                placeholder={`Option ${i + 1}`}
                className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none"
              />
              {options.length > 2 && (
                <button onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => setOptions((prev) => [...prev, ''])}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              + Add option
            </button>
            <button onClick={createPoll} className="ml-auto rounded-lg bg-violet-600 px-4 py-1.5 text-xs text-white hover:bg-violet-500">
              Create
            </button>
          </div>
        </div>
      )}

      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0)
        return (
          <div key={poll.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-white">{poll.question}</p>
            {poll.options.map((opt, i) => {
              const pct = totalVotes ? Math.round((opt.votes.length / totalVotes) * 100) : 0
              const voted = opt.votes.includes(currentUser)
              return (
                <button key={i} onClick={() => vote(poll, i)} className="w-full text-left">
                  <div className="mb-1 flex items-center justify-between">
                    <span className={`text-sm ${voted ? 'text-violet-300 font-medium' : 'text-gray-300'}`}>{opt.text}</span>
                    <span className="text-xs text-gray-500">{pct}% · {opt.votes.length}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all ${voted ? 'bg-violet-500' : 'bg-white/30'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              )
            })}
            <p className="text-xs text-gray-500">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
          </div>
        )
      })}
    </div>
  )
}
