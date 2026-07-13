'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, Mail, Hash, ChevronRight,
  Activity, Loader2, Cpu
} from 'lucide-react'

interface TeamData {
  _id: string
  name: string
  description?: string
  members: any[]
  leaderId: string
  maxMembers: number
  competitionName?: string
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [userTeams, setUserTeams] = useState<TeamData[]>([])
  const [teamLoading, setTeamLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/signin')
      } else {
        fetchTeams()
      }
    }
  }, [user, isLoading, router])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/user/team', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUserTeams(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setTeamLoading(false)
    }
  }

  if (isLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--fg)] tracking-tight mb-2">
            Profile
          </h1>
          <p className="text-[var(--fg-secondary)]">Your account and team memberships</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Identity Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 sticky top-28">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[var(--fg)]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-[var(--fg)]">{user.name}</h2>
                <span className="text-xs text-[var(--fg-tertiary)] mt-1">Member</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--fg-tertiary)]">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Email</span>
                  </div>
                  <span className="text-sm text-[var(--fg)] truncate max-w-[160px]">{user.email}</span>
                </div>
                {user.rollNo && (
                  <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2 text-[var(--fg-tertiary)]">
                      <Hash className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wider">Roll No</span>
                    </div>
                    <span className="text-sm text-[var(--fg)]">{user.rollNo}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2 text-[var(--fg-tertiary)]">
                      <Cpu className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wider">Dept</span>
                    </div>
                    <span className="text-sm text-[var(--fg)]">{user.department}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Teams */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider">Teams</p>
                  <p className="text-xl font-bold text-[var(--fg)]">{userTeams.length} Active</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-display text-lg font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--fg-tertiary)]" />
                My Teams
              </h3>

              {userTeams.length > 0 ? (
                <div className="space-y-4">
                  {userTeams.map((team) => (
                    <div key={team._id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-colors overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div>
                            <h2 className="font-display text-xl font-bold text-[var(--fg)] mb-1">
                              {team.name}
                            </h2>
                            {team.competitionName && (
                              <span className="text-xs text-[var(--fg-tertiary)]">{team.competitionName}</span>
                            )}
                          </div>

                          <Link href={`/teams/${team._id}`}>
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity group">
                              View Team
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {team.members.map((member: any) => (
                            <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                              <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold text-[var(--fg-secondary)]">
                                {member.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--fg)] truncate">{member.name}</p>
                                <p className="text-xs text-[var(--fg-tertiary)] truncate">{member.email}</p>
                              </div>
                              {member._id === team.leaderId && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] border border-[var(--border)] font-medium">Lead</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-[var(--fg-tertiary)]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--fg)] mb-2">No teams yet</h3>
                  <p className="text-[var(--fg-secondary)] text-sm max-w-md mx-auto mb-6">
                    Join an event to create or join a team.
                  </p>
                  <Link href="/events" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity">
                    Browse Events
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
