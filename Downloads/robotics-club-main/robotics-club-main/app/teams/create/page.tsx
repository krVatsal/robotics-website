"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateTeamPage() {
  const router = useRouter()
  const { user, isSignedIn, isLoading: authLoading } = useAuth()
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ teamName: "", competitionId: "" })

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.push("/auth/signin")
    }
  }, [isSignedIn, authLoading, router])

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await fetch("/api/competitions")
        if (res.ok) {
          const data = await res.json()
          setCompetitions(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error("Failed to fetch competitions:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCompetitions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.teamName.trim() || !formData.competitionId) {
      setError("Please fill in all fields")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          competitionId: formData.competitionId,
          teamName: formData.teamName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create team")
      }

      if (data.team?._id) {
        router.push(`/teams/${data.team._id}`)
      } else {
        router.push("/teams")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-neutral-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-20">
        <Link href="/teams" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Teams
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Create a Team</h1>
          <p className="text-neutral-400 mb-8">Form a new team for a competition</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Team Name</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#00D4FF] transition-colors"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Competition</label>
              {competitions.length === 0 ? (
                <p className="text-neutral-500 text-sm">No competitions available right now.</p>
              ) : (
                <select
                  value={formData.competitionId}
                  onChange={(e) => setFormData({ ...formData, competitionId: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#00D4FF] transition-colors"
                >
                  <option value="">Select a competition</option>
                  {competitions.map((comp) => (
                    <option key={comp._id} value={comp._id}>
                      {comp.title || comp.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <p className="text-[#E55B5B] text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#E55B5B] hover:bg-[#E55B5B]/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {submitting ? "Creating..." : "Create Team"}
            </button>
          </form>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
