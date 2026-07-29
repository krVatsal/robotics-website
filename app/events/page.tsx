"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Calendar, MapPin, Users, ChevronDown, ChevronUp, Loader2, Trophy } from "lucide-react"
import Link from "next/link"

const ease = [0.32, 0.72, 0, 1] as const

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeEventId, setActiveEventId] = useState("")

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data)
          setActiveEventId(data[0]._id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
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

  if (events.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-4">Events</p>
              <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.85] mb-6">
                Our<br />Events
              </h1>
              <p className="text-lg text-[var(--fg-secondary)] max-w-2xl tracking-[-0.01em]">
                Workshops, hackathons, and inter-college competitions — all designed to push your skills and build things that matter.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-3 gap-px bg-[var(--border)] mb-16">
              {[
                { title: "Robocon Qualifiers", desc: "Our annual flagship — design, build, and compete at the national level.", date: "Every February" },
                { title: "Build Weekends", desc: "48-hour sprint builds where teams prototype a working robot from scratch.", date: "Monthly" },
                { title: "Tech Talks", desc: "Guest lectures and member presentations on cutting-edge robotics research.", date: "Bi-weekly" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, ease }}
                  className="p-6 bg-[var(--bg)]"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">{item.date}</p>
                  <h3 className="text-lg text-[var(--fg)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center py-16 border border-dashed border-[var(--border)]"
            >
              <p className="text-[var(--fg-tertiary)] text-sm mb-1">No live events right now</p>
              <p className="text-[var(--fg-secondary)] text-sm">New events are announced at the start of each semester. Stay tuned.</p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  const activeEvent = events.find(e => e._id === activeEventId) || events[0]

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div key={activeEventId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-4">Events</p>
            <h1 className="font-display text-[clamp(3rem,8vw,6rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.85] mb-4">
              {activeEvent.name}
            </h1>
            <p className="text-lg text-[var(--fg-secondary)] tracking-[-0.01em]">{activeEvent.tagline}</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mt-10">
            {events.map(event => (
              <button
                key={event._id}
                onClick={() => setActiveEventId(event._id)}
                className={`px-5 py-2 rounded-full text-sm transition-all font-mono uppercase text-xs tracking-wider ${
                  activeEventId === event._id
                    ? "bg-[var(--fg)] text-[var(--bg)]"
                    : "text-[var(--fg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-3 gap-8">
          <motion.div key={`${activeEventId}-info`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-1">
            <div className="sticky top-20 border border-[var(--border)] bg-[var(--bg)] p-6 space-y-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)]">Event Details</h3>
              <p className="text-[var(--fg-secondary)] text-sm leading-relaxed">{activeEvent.description}</p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-[var(--fg-secondary)]">
                  <Calendar className="w-4 h-4 text-[var(--fg-tertiary)]" /> {activeEvent.date}
                </div>
                <div className="flex items-center gap-3 text-[var(--fg-secondary)]">
                  <MapPin className="w-4 h-4 text-[var(--fg-tertiary)]" /> {activeEvent.location}
                </div>
                <div className="flex items-center gap-3 text-[var(--fg-secondary)]">
                  <Users className="w-4 h-4 text-[var(--fg-tertiary)]" /> {activeEvent.participantsLabel || "Open for all"}
                </div>
              </div>

              {activeEvent.highlights?.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)] mb-2">Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {activeEvent.highlights.map((h: string) => (
                      <span key={h} className="px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--fg-secondary)] font-mono text-[10px] uppercase tracking-wider border border-[var(--border)]">{h}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5" /> Competitions
              </h3>
              <span className="font-mono text-[10px] uppercase text-[var(--fg-tertiary)]">{activeEvent.competitions?.length || 0} events</span>
            </div>
            <AnimatePresence mode="wait">
              {activeEvent.competitions?.map((comp: any, idx: number) => (
                <CompetitionCard key={comp._id} data={comp} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function CompetitionCard({ data, index }: { data: any; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, ease: [0.32, 0.72, 0, 1] }}
      className={`border bg-[var(--bg)] overflow-hidden transition-colors ${
        isOpen ? "border-[var(--border-hover)]" : "border-[var(--border)]"
      }`}
    >
      <button className="w-full p-5 flex items-center justify-between text-left hover:bg-[var(--bg-secondary)] transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h4 className="text-base text-[var(--fg)]">{data.title}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)]">{data.type}</span>
            <span className="font-mono text-[10px] text-[var(--fg-tertiary)]">{data.minTeamSize}-{data.maxTeamSize} members</span>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--fg-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--fg-tertiary)]" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-[var(--border)]">
            <div className="p-5 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-4">{data.description}</p>
                <Link href={`/participate/${data._id}`}>
                  <button className="w-full py-3 rounded-full border border-[var(--fg)] text-[var(--fg)] text-sm hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors">
                    Participate Now
                  </button>
                </Link>
              </div>
              {data.rules?.length > 0 && (
                <div className="bg-[var(--bg-secondary)] p-4 border border-[var(--border)]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Rules</p>
                  <ul className="space-y-2">
                    {data.rules.map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--fg-secondary)]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" /> {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
