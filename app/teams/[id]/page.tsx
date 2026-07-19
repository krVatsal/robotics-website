"use client"

import { useCallback, useEffect, useMemo, useState, use } from "react"
import { useAuth } from "@/lib/auth-context"
import Navbar from "@/components/navbar"
import {
  Users, Copy, Check, ShieldAlert, Rocket, Loader2, Trophy, UserPlus,
  UserMinus, Inbox, X,
} from "lucide-react"

/* --------------------------------------------------------------------------
   Team detail page — leader-side additions since the last version:
   - Kick button next to each non-leader member (leader only, unfinalized)
   - "Invite by codename" input with live autocomplete
   - Pending join-request inbox with Approve / Reject
   Members still see the read-only member list + status.
-------------------------------------------------------------------------- */

interface TeamMember { _id: string; name?: string; email?: string; codename?: string }
interface JoinRequestRow {
  _id: string
  userId: string
  userName?: string
  userEmail?: string
  userCodename?: string
  createdAt: string
}
interface SearchResult { _id: string; codename: string; name: string; profileImage?: string }

export default function TeamWarRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params)
  const { user } = useAuth()

  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [copied, setCopied] = useState(false)

  const [requests, setRequests] = useState<JoinRequestRow[]>([])
  const [inviteQuery, setInviteQuery] = useState("")
  const [inviteResults, setInviteResults] = useState<SearchResult[]>([])
  const [inviteBusy, setInviteBusy] = useState(false)
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  const isLeader = useMemo(
    () => !!user?._id && !!team?.leaderId && user._id === team.leaderId,
    [user, team],
  )
  const editable = !team?.isFinalized

  const showBanner = useCallback(
    (kind: "ok" | "err", text: string) => {
      setBanner({ kind, text })
      setTimeout(() => setBanner(null), 3000)
    },
    [],
  )

  const refreshTeam = useCallback(async () => {
    const res = await fetch(`/api/teams/${teamId}`, { credentials: "include" })
    if (res.ok) setTeam(await res.json())
  }, [teamId])

  const refreshRequests = useCallback(async () => {
    if (!isLeader) return
    const res = await fetch(`/api/teams/${teamId}/requests`, {
      credentials: "include",
    })
    if (res.ok) setRequests(await res.json())
  }, [teamId, isLeader])

  useEffect(() => {
    (async () => {
      await refreshTeam()
      setLoading(false)
    })()
  }, [refreshTeam])

  useEffect(() => { refreshRequests() }, [refreshRequests])

  // ─── Codename autocomplete for invitations ───
  useEffect(() => {
    if (!isLeader || !editable) return
    if (inviteQuery.trim().length < 2) { setInviteResults([]); return }
    let cancelled = false
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(inviteQuery.toLowerCase())}`,
        { credentials: "include" },
      )
      if (!res.ok || cancelled) return
      setInviteResults(await res.json())
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [inviteQuery, isLeader, editable])

  const copyCode = () => {
    navigator.clipboard.writeText(team.teamCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFinalize = async () => {
    if (!confirm("Submit the team for admin approval? You can't add or remove members after this.")) return
    setIsFinalizing(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/finalize`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) window.location.reload()
      else {
        const d = await res.json().catch(() => ({}))
        showBanner("err", d?.error ?? "Finalization failed")
      }
    } catch { showBanner("err", "Finalization failed") }
    finally { setIsFinalizing(false) }
  }

  const handleKick = async (targetUserId: string, targetName?: string) => {
    if (!confirm(`Remove ${targetName ?? "this member"} from the team?`)) return
    const res = await fetch(`/api/teams/${teamId}/members/${targetUserId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      showBanner("ok", "Member removed")
      refreshTeam()
    } else {
      const d = await res.json().catch(() => ({}))
      showBanner("err", d?.error ?? "Could not remove member")
    }
  }

  const handleInviteByCodename = async (codename: string) => {
    setInviteBusy(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ codename }),
      })
      if (res.ok) {
        showBanner("ok", `Invitation sent to ${codename}`)
        setInviteQuery("")
        setInviteResults([])
      } else {
        const d = await res.json().catch(() => ({}))
        showBanner("err", d?.error ?? "Could not send invitation")
      }
    } finally { setInviteBusy(false) }
  }

  const handleRequestDecision = async (
    requestId: string,
    decision: "approve" | "reject",
  ) => {
    const res = await fetch(`/api/join-requests/${requestId}/${decision}`, {
      method: "POST",
      credentials: "include",
    })
    if (res.ok) {
      showBanner("ok", decision === "approve" ? "Request approved" : "Request rejected")
      // Sync roster + inbox in parallel.
      await Promise.all([refreshTeam(), refreshRequests()])
    } else {
      const d = await res.json().catch(() => ({}))
      showBanner("err", d?.error ?? "Failed to update request")
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
    </div>
  )
  if (!team) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--fg-secondary)]">
      Team not found
    </div>
  )

  return (
    <main className="min-h-screen bg-[var(--bg)] pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-28 px-6">
        {banner && (
          <div className={`mb-6 p-3 rounded-xl border text-sm ${banner.kind === "ok"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            }`}>
            {banner.text}
          </div>
        )}

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

          {editable && (
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
          {/* Left column: Members + Leader tools */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5" /> Team Members
            </h3>

            {team.members.map((member: TeamMember, i: number) => {
              const isMemberLeader = member._id === team.leaderId
              return (
                <div key={member._id ?? i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex justify-between items-center hover:border-[var(--border-hover)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--fg-secondary)]">
                      {(member.name || member.codename || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{member.name || "Unknown"}</p>
                      <p className="text-xs text-[var(--fg-tertiary)]">
                        {member.codename ? `@${member.codename}` : member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMemberLeader && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] border border-[var(--border)] font-medium">Lead</span>
                    )}
                    {isLeader && !isMemberLeader && editable && (
                      <button
                        onClick={() => handleKick(member._id, member.name)}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[var(--fg-tertiary)] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                        title="Remove from team"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Invite by codename — leader only, editable teams only */}
            {isLeader && editable && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 mt-6">
                <h4 className="font-display text-sm font-semibold text-[var(--fg)] mb-1 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[var(--fg-tertiary)]" /> Invite by codename
                </h4>
                <p className="text-xs text-[var(--fg-tertiary)] mb-3">
                  Type at least 2 characters to search.
                </p>
                <input
                  type="text"
                  value={inviteQuery}
                  onChange={(e) => setInviteQuery(e.target.value)}
                  placeholder="e.g. nexus_pilot"
                  disabled={inviteBusy}
                  className="w-full rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg)] focus:outline-none transition-colors text-sm"
                />

                {inviteResults.length > 0 && (
                  <div className="mt-3 border border-[var(--border)] rounded-xl overflow-hidden">
                    {inviteResults.map((r) => (
                      <button
                        key={r._id}
                        type="button"
                        onClick={() => handleInviteByCodename(r.codename)}
                        disabled={inviteBusy}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors text-left disabled:opacity-50"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--fg)] truncate">@{r.codename}</p>
                          <p className="text-xs text-[var(--fg-tertiary)] truncate">{r.name}</p>
                        </div>
                        <span className="text-xs text-[var(--fg-tertiary)] flex items-center gap-1">
                          Send <UserPlus className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Join-request inbox — leader only */}
            {isLeader && editable && requests.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 mt-6">
                <h4 className="font-display text-sm font-semibold text-[var(--fg)] mb-3 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[var(--fg-tertiary)]" />
                  Pending join requests ({requests.length})
                </h4>
                <div className="space-y-2">
                  {requests.map((r) => (
                    <div key={r._id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--fg)] truncate">{r.userName || "Unknown"}</p>
                        <p className="text-xs text-[var(--fg-tertiary)] truncate">
                          {r.userCodename ? `@${r.userCodename}` : r.userEmail}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleRequestDecision(r._id, "approve")}
                          className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRequestDecision(r._id, "reject")}
                          className="text-xs px-3 py-1.5 rounded-full text-[var(--fg-tertiary)] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <h4 className="font-display text-sm font-semibold text-[var(--fg)] mb-3">Instructions</h4>
              <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                {team.isFinalized
                  ? "Registration complete. Awaiting competition commencement. Personnel list is now locked."
                  : "Share your Invite Code with your teammates OR invite them by codename. When they submit the code you'll approve them from the inbox below. Once your roster is set, hit Finalize to submit for admin approval."
                }
              </p>

              {isLeader && editable && (
                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing}
                  className="w-full mt-5 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-4 h-4" /> Submit for approval</>}
                </button>
              )}
            </div>

            {!isLeader && editable && (
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
