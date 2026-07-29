"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"

const categories = ["All", "Competition", "Innovation", "Research"]
const ease = [0.32, 0.72, 0, 1] as const

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/projects?published=true")
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return projects
    return projects.filter(p => p.category === selectedCategory)
  }, [selectedCategory, projects])

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-4">Portfolio</p>
            <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.85] mb-4">
              Our<br />Projects
            </h1>
            <p className="text-lg text-[var(--fg-secondary)] max-w-2xl tracking-[-0.01em]">
              Browse our portfolio of robotics builds — from self-driving cars to drones and manipulators. Every project is a hands-on lab for engineering skills.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-14 z-40 py-4 px-6 backdrop-blur-xl bg-[var(--bg)]/80 border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === cat
                    ? "bg-[var(--fg)] text-[var(--bg)]"
                    : "text-[var(--fg-secondary)] hover:text-[var(--fg)] border border-[var(--border)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)] hidden md:block">
            {filteredProjects.length} records
          </span>
        </div>
      </section>

      <section className="py-16 px-6 min-h-[400px]">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
              <p className="font-mono text-xs uppercase text-[var(--fg-tertiary)]">Loading projects...</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
              <AnimatePresence>
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    layout
                    key={project._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/projects/${project._id}`} className="block h-full">
                      <div className="group h-full bg-[var(--bg)] overflow-hidden hover:bg-[var(--bg-secondary)] transition-colors">
                        <div className="relative h-52 overflow-hidden bg-[var(--bg-tertiary)]">
                          {project.image ? (
                            <Image
                              src={project.image}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--fg-tertiary)] font-mono text-xs uppercase">No image</div>
                          )}
                          {project.category && (
                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#161616]/80 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">
                              {project.category}
                            </span>
                          )}
                          {project.status && (
                            <span className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161616]/80 font-mono text-[10px] uppercase text-white backdrop-blur-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6436]" />
                              {project.status}
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="text-base text-[var(--fg)] mb-1 group-hover:text-[var(--fg)] transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mb-4">{project.shortDescription || project.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)]">ID: {project._id?.slice(-4).toUpperCase()}</span>
                            <ArrowRight className="w-4 h-4 text-[var(--fg-tertiary)] group-hover:text-[var(--fg)] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <div className="space-y-8">
              {selectedCategory !== "All" ? (
                <div className="text-center py-20 border border-dashed border-[var(--border)]">
                  <h3 className="text-xl text-[var(--fg)] mb-2">No {selectedCategory} projects</h3>
                  <p className="text-[var(--fg-secondary)] text-sm">Try selecting a different category.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
                  {[
                    { title: "Self-Driving Car", category: "Competition", desc: "Autonomous vehicle with LiDAR, stereo vision, and path planning — our flagship SDC project." },
                    { title: "6-DOF Robotic Arm", category: "Innovation", desc: "Desktop manipulator with inverse kinematics and computer vision for pick-and-place tasks." },
                    { title: "Swarm Drones", category: "Research", desc: "Multi-agent drone swarm with decentralized coordination for search-and-rescue scenarios." },
                    { title: "Robocon Bot", category: "Competition", desc: "Annual competition robot designed for the ABU Robocon challenge theme." },
                    { title: "SLAM Navigator", category: "Research", desc: "Indoor mapping robot using LiDAR SLAM and autonomous navigation in unknown environments." },
                    { title: "Agri-Bot", category: "Innovation", desc: "Autonomous crop monitoring robot with soil sensors and weed detection using edge AI." },
                  ].map((project, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06, ease }}
                      className="bg-[var(--bg)] overflow-hidden"
                    >
                      <div className="h-40 bg-[var(--bg-tertiary)] flex items-center justify-center">
                        <span className="text-[var(--fg-tertiary)] font-mono text-xs uppercase">{project.title}</span>
                      </div>
                      <div className="p-5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)]">{project.category}</span>
                        <h3 className="text-lg text-[var(--fg)] mt-1 mb-2">{project.title}</h3>
                        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{project.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
