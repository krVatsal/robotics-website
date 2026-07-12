"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Users, ArrowRight, Loader2 } from "lucide-react"

interface Team {
  _id: string
  name: string
  description?: string
  leader: { _id: string; name: string }
  members: any[]
  maxMembers: number
}

export default function TeamsPage() {
  const router = useRouter()
  const { user, isSignedIn, isLoading: authLoading } = useAuth()
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isSignedIn) {
        router.push("/auth/signin")
      } else {
        fetch("/api/teams", { credentials: "include" })
          .then(res => res.json())
          .then(data => {
            setAllTeams(data)
            setMyTeams(data.filter((t: Team) => t.members.some((m: any) => m._id === user?._id) || t.leader._id === user?._id))
          })
          .catch(() => {})
          .finally(() => setIsLoading(false))
      }
    }
  }, [isSignedIn, authLoading, router, user])

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--fg)] tracking-tight mb-2">Teams</h1>
            <p className="text-[var(--fg-secondary)]">Create and manage your team collaborations</p>
          </motion.div>
          <Link href="/teams/create" className="px-6 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Team
          </Link>
        </div>

        {myTeams.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16">
            <h2 className="font-display text-xl font-semibold text-[var(--fg)] mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--fg-tertiary)]" /> My Teams ({myTeams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map(team => (
                <motion.div
                  key={team._id}
                  whileHover={{ y: -2 }}
                  className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-colors group cursor-pointer"
                  onClick={() => router.push(`/teams/${team._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[var(--fg)] group-hover:text-[var(--fg)]">{team.name}</h3>
                      <p className="text-xs text-[var(--fg-tertiary)] mt-0.5">Led by {team.leader.name}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--fg-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  {team.description && <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mb-4">{team.description}</p>}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--fg-secondary)] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {team.members.length} / {team.maxMembers}
                    </span>
                    {team.leader._id === user?._id && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] border border-[var(--border)] font-medium">Leader</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {allTeams.length > myTeams.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-xl font-semibold text-[var(--fg)] mb-6">Browse Available Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTeams.filter(t => !myTeams.find(m => m._id === t._id)).map(team => (
                <motion.div
                  key={team._id}
                  whileHover={{ y: -2 }}
                  className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-colors group cursor-pointer"
                  onClick={() => router.push(`/teams/${team._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-[var(--fg)]">{team.name}</h3>
                    <ArrowRight className="w-4 h-4 text-[var(--fg-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  {team.description && <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mb-4">{team.description}</p>}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--fg-secondary)] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {team.members.length} / {team.maxMembers}
                    </span>
                    {team.members.length < team.maxMembers && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">Open</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {allTeams.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-[var(--fg-tertiary)] mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-[var(--fg)] mb-2">No teams yet</h3>
            <p className="text-[var(--fg-secondary)] mb-8">Be the first to create a team.</p>
            <Link href="/teams/create" className="px-6 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create First Team
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
