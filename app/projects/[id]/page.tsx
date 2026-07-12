"use client"

import { useState, useEffect, use } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Github, ExternalLink, Users, Zap, Loader2, ArrowLeft, Calendar, Cpu, Shield, FileText } from "lucide-react"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  description: string
  shortDescription?: string
  category: string
  image: string
  hardwareUsed: string[]
  softwareUsed: string[]
  techStack: string[]
  contributors: { name: string; role: string }[]
  mentors: { name: string; role: string }[]
  content: string
  achievements: string[]
  links: { github?: string; documentation?: string; demo?: string }
  createdAt?: string
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => setProject(data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-[var(--fg-tertiary)]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--fg)] mb-2">Project not found</h1>
          <p className="text-[var(--fg-secondary)] mb-8">The requested project does not exist.</p>
          <Link href="/projects" className="px-6 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity">
            Back to Projects
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[var(--bg-tertiary)]">
          {project.image && (
            <img src={project.image} alt={project.title} className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full pb-12 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link href="/projects" className="inline-flex items-center gap-2 text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors mb-6 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Projects
              </Link>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[var(--fg)] text-[var(--bg)] text-xs font-semibold uppercase tracking-wider">
                  {project.category}
                </span>
                {project.createdAt && (
                  <span className="px-3 py-1 rounded-full bg-[var(--bg-secondary)]/80 backdrop-blur-sm text-[var(--fg-secondary)] text-xs flex items-center gap-1.5 border border-[var(--border)]">
                    <Calendar className="w-3 h-3" /> {new Date(project.createdAt).getFullYear()}
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-bold text-[var(--fg)] tracking-tight max-w-4xl leading-[1.05]">
                {project.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main content */}
          <div className="lg:col-span-8">
            {project.shortDescription && (
              <p className="text-xl text-[var(--fg-secondary)] leading-relaxed border-l-2 border-[var(--fg)] pl-6 mb-12">
                {project.shortDescription}
              </p>
            )}

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <style>{`
                .prose h2 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; }
                .prose p { line-height: 1.8; }
                .prose code { font-size: 0.9em; }
              `}</style>
              <ReactMarkdown>{project.content || project.description}</ReactMarkdown>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Links */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <h3 className="font-display text-base font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--fg-tertiary)]" /> Links
              </h3>
              <div className="space-y-2">
                {project.links?.github && (
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors group">
                    <Github className="w-4 h-4 text-[var(--fg-tertiary)]" />
                    <span className="text-sm text-[var(--fg-secondary)] group-hover:text-[var(--fg)]">Source Code</span>
                    <ExternalLink className="w-3 h-3 text-[var(--fg-tertiary)] ml-auto" />
                  </a>
                )}
                {project.links?.demo && (
                  <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors group">
                    <Zap className="w-4 h-4 text-[var(--fg-tertiary)]" />
                    <span className="text-sm text-[var(--fg-secondary)] group-hover:text-[var(--fg)]">Live Demo</span>
                    <ExternalLink className="w-3 h-3 text-[var(--fg-tertiary)] ml-auto" />
                  </a>
                )}
                {project.links?.documentation && (
                  <a href={project.links.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors group">
                    <FileText className="w-4 h-4 text-[var(--fg-tertiary)]" />
                    <span className="text-sm text-[var(--fg-secondary)] group-hover:text-[var(--fg)]">Documentation</span>
                    <ExternalLink className="w-3 h-3 text-[var(--fg-tertiary)] ml-auto" />
                  </a>
                )}
                {!project.links?.github && !project.links?.demo && !project.links?.documentation && (
                  <p className="text-sm text-[var(--fg-tertiary)] text-center py-2">No links available</p>
                )}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <h3 className="font-display text-base font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--fg-tertiary)]" /> Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack?.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] text-xs font-medium border border-[var(--border)]">
                    {t}
                  </span>
                ))}
                {!project.techStack?.length && <p className="text-sm text-[var(--fg-tertiary)]">Not specified</p>}
              </div>
              {project.hardwareUsed?.length > 0 && (
                <>
                  <p className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider mb-2 mt-4">Hardware</p>
                  <div className="flex flex-wrap gap-2">
                    {project.hardwareUsed.map(h => (
                      <span key={h} className="px-3 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] text-xs border border-[var(--border)]">{h}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Team */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <h3 className="font-display text-base font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--fg-tertiary)]" /> Team
              </h3>
              <div className="space-y-3">
                {project.contributors?.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold text-[var(--fg-secondary)]">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{c.name}</p>
                      <p className="text-[10px] text-[var(--fg-tertiary)] uppercase tracking-wider">{c.role}</p>
                    </div>
                  </div>
                ))}
                {project.mentors?.length > 0 && (
                  <>
                    <div className="h-px bg-[var(--border)] my-3" />
                    <p className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider mb-2">Mentors</p>
                    {project.mentors.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-tertiary)]" />
                        {m.name} <span className="text-[var(--fg-tertiary)]">({m.role})</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
