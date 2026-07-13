"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Edit2, Loader2 } from "lucide-react"
import Link from "next/link"

export function ProjectsList({ onProjectDeleted }: { onProjectDeleted: () => void }) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      const data = await response.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch projects", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (response.ok) {
        setProjects(projects.filter((p) => p._id !== id))
        onProjectDeleted()
      }
    } catch (err) {
      console.error("Delete failed", err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "togglePublished" }),
      })
      if (response.ok) {
        const updated = await response.json()
        setProjects(projects.map((p) => (p._id === id ? updated : p)))
      }
    } catch (err) {
      console.error("Toggle failed", err)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-bold text-[var(--fg)]">
          All Projects <span className="text-[var(--fg-tertiary)] text-lg">({projects.length})</span>
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-[var(--border)]">
          <p className="text-[var(--fg-tertiary)] mb-4">No projects found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-secondary)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--fg-tertiary)] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--fg-tertiary)] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[var(--fg-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[var(--fg-tertiary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {projects.map((project) => (
                    <motion.tr
                      key={project._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--fg)]">{project.title}</p>
                        <p className="text-sm text-[var(--fg-tertiary)] truncate max-w-xs">{project.shortDescription}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] text-xs border border-[var(--border)]">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${project.published ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"}`}>
                          {project.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleTogglePublish(project._id)}
                            className="px-3 py-1.5 text-xs rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--bg)] border border-[var(--border)] transition-colors"
                          >
                            {project.published ? "Unpublish" : "Publish"}
                          </button>
                          <Link
                            href={`/admin/edit/${project._id}`}
                            className="p-2 rounded-lg text-[var(--fg-tertiary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] transition-colors"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(project._id)}
                            disabled={deletingId === project._id}
                            className="p-2 rounded-lg text-[var(--fg-tertiary)] hover:text-red-500 hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
