"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import RegistrationWizard from "@/components/registration-wizard"

export default function ParticipatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: competitionId } = use(params)
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkExistingParticipation = async () => {
      try {
        const res = await fetch("/api/participate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "CHECK", competitionId }),
        })
        const data = await res.json()
        if (data.alreadyJoined && data.team) {
          router.push(`/teams/${data.team._id}`)
        }
      } catch (e) {
        console.error("Check failed", e)
      } finally {
        setIsChecking(false)
      }
    }
    checkExistingParticipation()
  }, [competitionId, router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
          <p className="text-[var(--fg-tertiary)] text-sm">Checking participation status...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--fg)] mb-2">
            Competition Registration
          </h1>
          <p className="text-[var(--fg-secondary)] text-sm">Join or create a team to participate</p>
        </motion.div>

        <RegistrationWizard competitionId={competitionId} />
      </div>
    </main>
  )
}
