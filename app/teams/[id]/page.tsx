"use client"

import { useState, useEffect, use } from "react"
import { useAuth } from "@/lib/auth-context"
import Navbar from "@/components/navbar"
import { Users, Copy, Check, ShieldAlert, Rocket, Loader2, Trophy } from "lucide-react"

export default function TeamWarRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params)
  const { user } = useAuth()

  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/teams/${teamId}`)
      .then(res => res.json())
      .then(data => { setTeam(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [teamId])

  const copyCode = () => {
    navigator.clipboard.writeText(team.teamCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFinalize = async () => {
    if (!confirm("Finalizing locks your team members. Ready to compete?")) return
    setIsFinalizing(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/finalize`, { method: "POST" })
      if (res.ok) window.location.reload()
    } catch { alert("Finalization failed") }
    finally { setIsFinalizing(false) }
  }

  if (loading) return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" /></div>
  if (!team) return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--fg-secondary)]">Team not found</div>

  const isLeader = user?._id === team?.leaderId

  return (
    <main className="min-h-screen bg-[var(--bg)] pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-28 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            {team.competitionName && (
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
                <Trophy className="w-3.5 h-3.5 text-[var(--fg-tertiary)]" />
                <span className="text-xs font-medium text-[var(--fg-secondary)] uppercase tracking-wider">{team.competitionName}</span>
              </div>
            )}
            <h1 className="font-display text-4xl font-bold text-[var(--fg)] tracking-tight">{team.name}</h1>
            <p className="text-[var(--fg-secondary)] mt-2 text-sm">
              Status: {team.isFinalized
                ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">Deployed</span>
                : <span className="text-amber-600 dark:text-amber-400 font-medium">Assembling</span>
              }
            </p>
          </div>

          {!team.isFinalized && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex items-center gap-4">
              <div>
                <p className="text-[10px] text-[var(--fg-tertiary)] uppercase tracking-wider mb-0.5">Invite Code</p>
                <p className="text-2xl font-bold tracking-[0.2em] text-[var(--fg)]">{team.teamCode}</p>
              </div>
              <button onClick={copyCode} className="w-10 h-10 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--fg-tertiary)]" />}
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Members */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium flex items-center gap-2 mb-4">
              <Users className="w-3.5 h-3.5" /> Team Members
            </h3>
            {team.members.map((member: any, i: number) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex justify-between items-center hover:border-[var(--border-hover)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--fg-secondary)]">
                    {(member.name || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--fg)]">{member.name || "Unknown"}</p>
                    <p className="text-xs text-[var(--fg-tertiary)]">{member.email}</p>
                  </div>
                </div>
                {member._id === team.leaderId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] border border-[var(--border)] font-medium">Lead</span>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <h4 className="font-display text-sm font-semibold text-[var(--fg)] mb-3">Instructions</h4>
              <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                {team.isFinalized
                  ? "Registration complete. Awaiting competition commencement. Personnel list is now locked."
                  : "Share your Invite Code with your teammates. Once everyone has joined, the Team Leader must click Finalize to secure your spot."
                }
              </p>

              {isLeader && !team.isFinalized && (
                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing}
                  className="w-full mt-5 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-4 h-4" /> Finalize Registration</>}
                </button>
              )}
            </div>

            {!isLeader && !team.isFinalized && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-400 flex gap-3">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-0.5">Waiting for Leader</p>
                  <p>The team leader needs to finalize registration.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
