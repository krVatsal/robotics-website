"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowRight, Cpu, Eye, Cog, Wifi, Gauge, Code2, Users, GraduationCap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const ease: [number, number, number, number] = [0.32, 0.72, 0, 1]

const specs = [
  { label: "Perception", value: "LiDAR + Stereo Camera", icon: Eye },
  { label: "Compute", value: "Jetson Orin NX", icon: Cpu },
  { label: "Framework", value: "ROS 2 Humble", icon: Code2 },
  { label: "Drive-by-Wire", value: "Custom CAN Interface", icon: Cog },
  { label: "Connectivity", value: "5G + V2X", icon: Wifi },
  { label: "Top Speed", value: "25 km/h (governed)", icon: Gauge },
]

const timeline = [
  {
    year: 2020,
    head: "Gaurav Bansal",
    batch: "Batch 2020",
    description: "Kickstarted the Self-Driving Car Project by introducing it to the Robotics Club and beginning initial development.",
  },
  {
    year: 2021,
    head: "Bhuvan Jhamb",
    batch: "Batch 2021",
    description: "Initial simulation of autonomous stack in CARLA simulator and roadmap defined for the project.",
  },
  {
    year: 2022,
    head: "Ashutosh Kumar",
    batch: "Batch 2022",
    description: "Developed and tested the prototype with the control system successfully established.",
  },
  {
    year: 2023,
    head: "Amit Gupta",
    batch: "Batch 2023",
    description: "Work on automation of braking, throttle and lane detection algorithms continued.",
  },
  {
    year: 2024,
    head: "Ayush Singh Gour",
    batch: "Batch 2024",
    description: "Automation of steering system completed. Mechanical work done. Kitty Dataset collection performed. Work started on odometry.",
  },
  {
    year: 2025,
    head: "Rishi Mishra",
    batch: "Batch 2025",
    description: "Odometry done. Integration of road lane detection system and basic decision making system. Sensor integration. Improvement of control system.",
  },
  {
    year: 2026,
    head: "Dhruv Chandhok",
    batch: "Batch 2026",
    description: "Current SDC Head. Continuing the legacy of autonomous driving innovation.",
  },
]

const faculty = [
  { name: "Dr. Samir Saraswati", role: "Faculty In-charge & Mentor, Associate Professor MED" },
  { name: "Dr. Jitendra Narayan Gangwar", role: "Faculty In-charge & Mentor, Assistant Professor Grade-1" },
]

const alumniMentors = [
  { name: "Bhuvan Jhamb", batch: "Alumni, 2020", role: "R&D Engineer, Tesla" },
  { name: "Kishan Tiwari", batch: "Alumni, 2019", role: "Founder, TSAW Drones" },
  { name: "Sharad Rawat", batch: "Alumni, 2016", role: "Software Engineer, Germany" },
]

const gallery = [
  { src: "/autonomous-self-driving-car-robot.jpg", alt: "SDC on test track", caption: "Campus test track run" },
  { src: "/autonomous-line-follower-robot.jpg", alt: "Sensor array close-up", caption: "Line-following prototype — early testing" },
  { src: "/surveillance-rover-robot.jpg", alt: "Night testing", caption: "Rover platform — field trials" },
  { src: "/drone-delivery-aerial-robot.jpg", alt: "Aerial view of track", caption: "Aerial survey of the test environment" },
]

function ProjectTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const trackHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"])

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const clamped = Math.max(0, Math.min(1, (v - 0.1) / 0.8))
    const idx = Math.min(timeline.length - 1, Math.floor(clamped * timeline.length))
    setActiveIndex(idx)
  })

  return (
    <section ref={containerRef} className="py-24 lg:py-32 px-6 border-t border-[var(--border)]">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ease }}
          className="mb-20"
        >
          <p className="font-mono uppercase text-xs tracking-[0.2em] text-[var(--fg-secondary)] mb-3">
            Project Execution
          </p>
          <h2 className="font-display uppercase text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--fg)] tracking-tight leading-[0.9]">
            SDC Timeline
          </h2>
        </motion.div>

        <div className="relative">
          {/* Center track line — desktop */}
          <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border)] -translate-x-1/2">
            <motion.div className="w-full bg-[var(--accent)] origin-top" style={{ height: trackHeight }} />
          </div>
          {/* Left track line — mobile */}
          <div className="sm:hidden absolute left-3 top-0 bottom-0 w-px bg-[var(--border)]">
            <motion.div className="w-full bg-[var(--accent)] origin-top" style={{ height: trackHeight }} />
          </div>

          <div className="space-y-8 sm:space-y-16 md:space-y-24">
            {timeline.map((item, idx) => {
              const isEven = idx % 2 === 0
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, ease }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {/* Mobile layout — left-aligned */}
                  <div className="sm:hidden grid grid-cols-[24px_1fr] gap-3 items-start">
                    <div className="flex justify-center pt-2">
                      <div className={`w-3 h-3 border-2 transition-colors duration-500 ${
                        idx <= activeIndex
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "bg-[var(--bg)] border-[var(--fg-tertiary)]/40"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-display text-lg text-[var(--fg)]">{item.year}</span>
                        <span className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)]">{item.batch}</span>
                      </div>
                      <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--accent)]/30 transition-colors">
                        <h3 className="font-display uppercase text-base text-[var(--fg)] mb-1.5">{item.head}</h3>
                        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop alternating layout — center line */}
                  <div className="hidden sm:grid grid-cols-[1fr_40px_1fr] md:grid-cols-[1fr_60px_1fr] items-start gap-4 md:gap-6">
                    <div className="col-start-2 row-start-1 flex justify-center pt-2">
                      <div className={`w-3 h-3 border-2 transition-colors duration-500 ${
                        idx <= activeIndex
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "bg-[var(--bg)] border-[var(--fg-tertiary)]/40"
                      }`} />
                    </div>
                    <div className="col-start-1 row-start-1 text-right">
                      {isEven ? (
                        <div className="flex flex-col items-end pt-0.5">
                          <span className="font-display text-2xl text-[var(--fg)]">{item.year}</span>
                          <span className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)] mt-0.5">{item.batch}</span>
                        </div>
                      ) : (
                        <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent)]/30 transition-colors">
                          <h3 className="font-display uppercase text-lg text-[var(--fg)] mb-2 text-left">{item.head}</h3>
                          <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-left">{item.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="col-start-3 row-start-1">
                      {isEven ? (
                        <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent)]/30 transition-colors">
                          <h3 className="font-display uppercase text-lg text-[var(--fg)] mb-2">{item.head}</h3>
                          <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{item.description}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start pt-0.5">
                          <span className="font-display text-2xl text-[var(--fg)]">{item.year}</span>
                          <span className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)] mt-0.5">{item.batch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SDCPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/autonomous-self-driving-car-robot.jpg"
            alt="Self-Driving Car"
            fill
            className="object-cover opacity-30 dark:opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/60 via-[var(--bg)]/80 to-[var(--bg)]" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 pt-36 pb-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 bg-[var(--accent)] animate-pulse" />
              <span className="font-mono uppercase text-xs tracking-[0.2em] text-[var(--fg-secondary)]">Active Project</span>
            </div>
            <h1 className="font-display uppercase text-[clamp(3rem,10vw,7rem)] text-[var(--fg)] tracking-tight leading-[0.9] mb-6">
              Self-Driving<br />Car.
            </h1>
            <p className="text-lg text-[var(--fg-secondary)] max-w-2xl leading-relaxed font-medium">
              A Mechanical Engineering Department & Robotics Club initiative. Sponsored and initiated by
              MNNIT Alumni Excellence (MAE) Foundation — a 1995 Batch Initiative. From a humble four-wheeled
              prototype to a major leap in autonomous mobility.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <Link
                href="/events"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                View Competitions <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] text-[var(--fg)] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors"
              >
                All Projects
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specs Grid */}
      <section className="py-24 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease }}
            className="mb-14"
          >
            <p className="font-mono uppercase text-xs tracking-[0.2em] text-[var(--fg-secondary)] mb-3">
              Specifications
            </p>
            <h2 className="font-display uppercase text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--fg)] tracking-tight leading-[0.9]">
              Technical Specs
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--border)]">
            {specs.map((spec, idx) => {
              const Icon = spec.icon
              return (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, ease }}
                  viewport={{ once: true }}
                  className="p-6 bg-[var(--bg)]"
                >
                  <div className="w-10 h-10 border border-[var(--border)] flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <p className="font-mono uppercase text-[10px] tracking-[0.15em] text-[var(--fg-tertiary)] mb-1">{spec.label}</p>
                  <p className="font-display uppercase text-lg text-[var(--fg)]">{spec.value}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Project Timeline */}
      <ProjectTimeline />

      {/* Faculty & Mentors */}
      <section className="py-24 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease }}
            className="mb-14"
          >
            <p className="font-mono uppercase text-xs tracking-[0.2em] text-[var(--fg-secondary)] mb-3">
              Guidance & Mentorship
            </p>
            <h2 className="font-display uppercase text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--fg)] tracking-tight leading-[0.9]">
              Faculty & Alumni
            </h2>
          </motion.div>

          {/* Faculty */}
          <div className="mb-12">
            <p className="font-mono uppercase text-[10px] tracking-[0.2em] text-[var(--fg-tertiary)] mb-4 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" /> Technical Guidance
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border)]">
              {faculty.map((f, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, ease }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-5 bg-[var(--bg)]"
                >
                  <div className="w-11 h-11 bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center font-mono text-xs uppercase text-[var(--fg-secondary)] shrink-0">
                    {f.name.split(" ").filter(n => n !== "Dr.").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--fg)] text-sm">{f.name}</p>
                    <p className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)]">{f.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Alumni Mentors */}
          <div>
            <p className="font-mono uppercase text-[10px] tracking-[0.2em] text-[var(--fg-tertiary)] mb-4 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Alumni Mentors
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)]">
              {alumniMentors.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, ease }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-5 bg-[var(--bg)]"
                >
                  <div className="w-11 h-11 bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center font-mono text-xs uppercase text-[var(--fg-secondary)] shrink-0">
                    {m.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--fg)] text-sm">{m.name}</p>
                    <p className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)]">{m.role}</p>
                    <p className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)]">{m.batch}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease }}
            className="mb-14"
          >
            <p className="font-mono uppercase text-xs tracking-[0.2em] text-[var(--fg-secondary)] mb-3">
              Documentation
            </p>
            <h2 className="font-display uppercase text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--fg)] tracking-tight leading-[0.9]">
              Gallery
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border)]">
            {gallery.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, ease }}
                viewport={{ once: true }}
                className="group relative aspect-video overflow-hidden bg-[var(--bg)]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="absolute bottom-4 left-4 font-mono uppercase text-[11px] tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ease }}>
            <h2 className="font-display uppercase text-[clamp(2rem,5vw,3.5rem)] text-[var(--fg)] tracking-tight leading-[0.9] mb-4">
              Want to contribute?
            </h2>
            <p className="text-[var(--fg-secondary)] mb-8 max-w-lg mx-auto">
              We are always looking for passionate engineers. Join the club and be part of our next breakthrough.
            </p>
            <Link
              href="/auth/signin"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Join MNNIT Robotics <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
