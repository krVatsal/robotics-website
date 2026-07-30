"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Calendar, MapPin, Users, ChevronDown, ChevronUp, Loader2, Trophy, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const ease = [0.32, 0.72, 0, 1] as const

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeEventId, setActiveEventId] = useState("")
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data)
          const upcoming = data.filter((e: any) => e.status === "upcoming")
          if (upcoming.length > 0) {
            setActiveEventId(upcoming[0]._id)
            setTab("upcoming")
          } else {
            setActiveEventId(data[0]._id)
            setTab("past")
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const upcomingEvents = useMemo(() => events.filter(e => e.status === "upcoming"), [events])
  const pastEvents = useMemo(() => events.filter(e => e.status !== "upcoming"), [events])
  const displayedEvents = tab === "upcoming" ? upcomingEvents : pastEvents
  const activeEvent = events.find(e => e._id === activeEventId) || displayedEvents[0]

  useEffect(() => {
    const list = tab === "upcoming" ? upcomingEvents : pastEvents
    if (list.length > 0 && !list.find(e => e._id === activeEventId)) {
      setActiveEventId(list[0]._id)
    }
  }, [tab])

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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 mt-12 border border-dashed border-[var(--border)]"
            >
              <p className="text-[var(--fg-tertiary)] text-sm mb-1">No events right now</p>
              <p className="text-[var(--fg-secondary)] text-sm">New events are announced at the start of each semester. Stay tuned.</p>
            </motion.div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  const isPast = activeEvent?.status !== "upcoming"

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-4">Events</p>
            <h1 className="font-display text-[clamp(3rem,8vw,6rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.85] mb-4">
              Our<br />Events
            </h1>
          </motion.div>

          {/* Upcoming / Past tabs */}
          <div className="flex gap-1 mt-8 mb-6 bg-[var(--bg-secondary)] rounded-full p-1 w-fit">
            <button
              onClick={() => setTab("upcoming")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                tab === "upcoming"
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Upcoming {upcomingEvents.length > 0 && `(${upcomingEvents.length})`}
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                tab === "past"
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Past {pastEvents.length > 0 && `(${pastEvents.length})`}
            </button>
          </div>

          {/* Event selector pills */}
          <div className="flex flex-wrap gap-2">
            {displayedEvents.map(event => (
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

      {activeEvent && (
        <section className="py-12 px-6">
          <div className="max-w-[1200px] mx-auto grid lg:grid-cols-3 gap-8">
            <motion.div key={`${activeEventId}-info`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-1">
              <div className="sticky top-20 border border-[var(--border)] bg-[var(--bg)] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)]">Event Details</h3>
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider ${
                    isPast
                      ? "bg-[var(--bg-secondary)] text-[var(--fg-tertiary)] border border-[var(--border)]"
                      : "bg-green-500/10 text-green-500 border border-green-500/20"
                  }`}>
                    {isPast ? "Concluded" : "Upcoming"}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeEventId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <h2 className="text-xl text-[var(--fg)] font-display mb-2">{activeEvent.name}</h2>
                    <p className="text-sm text-[var(--fg-secondary)] italic mb-3">{activeEvent.tagline}</p>
                    <p className="text-[var(--fg-secondary)] text-sm leading-relaxed">{activeEvent.description}</p>
                  </motion.div>
                </AnimatePresence>

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
                <motion.div key={activeEventId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {activeEvent.competitions?.length > 0 ? (
                    activeEvent.competitions.map((comp: any, idx: number) => (
                      <CompetitionCard key={comp._id} data={comp} index={idx} isPast={isPast} />
                    ))
                  ) : (
                    <div className="border border-dashed border-[var(--border)] p-12 text-center">
                      <p className="text-[var(--fg-secondary)] text-sm mb-1">
                        {isPast ? "No competitions were listed for this event." : "Competitions will be announced soon."}
                      </p>
                      {!isPast && (
                        <p className="text-[var(--fg-tertiary)] text-xs">Stay tuned for updates!</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

function CompetitionCard({ data, index, isPast }: { data: any; index: number; isPast: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, ease: [0.32, 0.72, 0, 1] }}
      className={`border bg-[var(--bg)] overflow-hidden transition-colors mb-3 ${
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
                {isPast ? (
                  <div className="w-full py-3 rounded-full border border-[var(--border)] text-[var(--fg-tertiary)] text-sm text-center">
                    Event Concluded
                  </div>
                ) : data.registrationOpen ? (
                  <Link href={`/participate/${data._id}`}>
                    <button className="w-full py-3 rounded-full border border-[var(--fg)] text-[var(--fg)] text-sm hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors">
                      Participate Now
                    </button>
                  </Link>
                ) : (
                  <div className="w-full py-3 rounded-full border border-[var(--border)] text-[var(--fg-tertiary)] text-sm text-center">
                    Registration Not Open Yet
                  </div>
                )}
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
