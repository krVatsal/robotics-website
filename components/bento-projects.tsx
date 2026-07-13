"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  description: string
  category: string
  status: string
  techStack: string[]
  image?: string
  slug?: string
}

const spanPatterns = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
]

export default function BentoProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(Array.isArray(data) ? data : data.projects ?? [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))]
  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter)

  if (isLoading) {
    return (
      <section id="projects" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] animate-pulse ${spanPatterns[i] || ""}`} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (projects.length === 0) return null

  return (
    <section id="projects" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold text-[var(--fg)] tracking-tight leading-[1.05] mb-4">
            Featured<br />Projects.
          </h2>
          <p className="text-[var(--fg-secondary)] text-lg max-w-2xl">
            A snapshot of our ongoing builds — from autonomous vehicles to industrial manipulators. Each project is an open lab for learning.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === cat
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "bg-[var(--bg-secondary)] text-[var(--fg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, idx) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-all cursor-pointer ${spanPatterns[idx % spanPatterns.length]}`}
              >
                {project.image ? (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[var(--bg-secondary)]" />
                )}

                <div className="relative z-10 h-full flex flex-col justify-between p-5">
                  <div className="flex items-center gap-2">
                    {project.category && (
                      <span className="px-3 py-1 rounded-full bg-white/90 text-[10px] font-semibold text-black uppercase tracking-wider backdrop-blur-sm">
                        {project.category}
                      </span>
                    )}
                    {project.status && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-[10px] font-medium text-black backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {project.status}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-xl font-display font-bold ${project.image ? "text-white" : "text-[var(--fg)]"}`}>
                    {project.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-12 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] text-sm font-medium text-[var(--fg)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  )
}
