"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { ProjectForm } from "@/components/admin/project-form"
import { motion } from "framer-motion"
import { ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data)
        }
      } catch (err) {
        console.error("Error loading project:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  const handleSuccess = () => {
    router.push("/admin")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-2xl font-bold text-[var(--fg)]">Project not found</h1>
        <Link href="/admin" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--fg)] underline">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--fg-tertiary)]">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-display text-4xl font-bold text-[var(--fg)] tracking-tight">Edit Project</h1>
        </motion.div>
        <ProjectForm initialData={project} onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
