"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowRight, Cpu, Eye, Cog, Wifi, Gauge, Code2, Users } from "lucide-react"
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

const stages = [
  {
    image: "/sdc-stages/stage-1.png",
    title: "Bare Chassis",
    date: "Jan 2023",
    description: "Bare unibody frame — aluminium extrusion chassis with mounting rails for drivetrain and electronics bays.",
    contributor: { name: "Rohan Gupta", role: "Mechanical Design" },
  },
  {
    image: "/sdc-stages/stage-2.png",
    title: "Drivetrain & Suspension",
    date: "Apr 2023",
    description: "Ackermann steering geometry integrated. Brushless hub motors, suspension arms, and battery tray mounted.",
    contributor: { name: "Rohan Gupta", role: "Mechanical Design" },
  },
  {
    image: "/sdc-stages/stage-3.png",
    title: "Electronics Bay",
    date: "Aug 2023",
    description: "Jetson compute stack, CAN bus harness, power distribution board, and safety relay system installed.",
    contributor: { name: "Sneha Verma", role: "Electronics & Embedded" },
  },
  {
    image: "/sdc-stages/stage-4.png",
    title: "Sensor Integration",
    date: "Dec 2023",
    description: "LiDAR, stereo cameras, IMU, and GPS modules mounted. Sensor fusion pipeline operational with EKF.",
    contributor: { name: "Priya Sharma", role: "Perception Engineer" },
  },
  {
    image: "/sdc-stages/stage-5.png",
    title: "Body Panels",
    date: "Mar 2024",
    description: "Carbon-fibre composite body panels fitted. Aerodynamic profile finalised. Interior dashboard with telemetry display.",
    contributor: { name: "Aarav Mehta", role: "Team Lead" },
  },
  {
    image: "/sdc-stages/stage-6.png",
    title: "Competition Ready",
    date: "Jul 2024",
    description: "Full autonomous stack deployed. Waypoint navigation, obstacle avoidance, and traffic sign recognition validated.",
    contributor: { name: "Vikram Singh", role: "Software — Simulation" },
  },
]

const team = [
  { name: "Aarav Mehta", role: "Team Lead — Planning & Controls" },
  { name: "Priya Sharma", role: "Perception Engineer" },
  { name: "Rohan Gupta", role: "Mechanical Design" },
  { name: "Sneha Verma", role: "Electronics & Embedded" },
  { name: "Vikram Singh", role: "Software — Simulation" },
  { name: "Ananya Rao", role: "Computer Vision" },
]

const gallery = [
  { src: "/autonomous-self-driving-car-robot.jpg", alt: "SDC on test track", caption: "Campus test track run — March 2024" },
  { src: "/autonomous-line-follower-robot.jpg", alt: "Sensor array close-up", caption: "Line-following prototype — early testing" },
  { src: "/surveillance-rover-robot.jpg", alt: "Night testing", caption: "Rover platform — field trials" },
  { src: "/drone-delivery-aerial-robot.jpg", alt: "Aerial view of track", caption: "Aerial survey of the test environment" },
]

function AssemblyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const [activeIndex, setActiveIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const clamped = Math.max(0, Math.min(1, (v - 0.1) / 0.8))
    const idx = Math.min(stages.length - 1, Math.floor(clamped * stages.length))
    setActiveIndex(idx)
  })

  const carY = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"])
  const trackHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"])

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
            Build Progression
          </p>
          <h2 className="font-display uppercase text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--fg)] tracking-tight leading-[0.9]">
            From Chassis<br />To Autonomy.
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border)] -translate-x-1/2">
            <motion.div className="w-full bg-[var(--accent)] origin-top" style={{ height: trackHeight }} />
          </div>

          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            style={{ top: carY }}
          >
            <div className="relative -translate-y-1/2">
              <div className="w-12 h-12 bg-[var(--bg)] border-2 border-[var(--fg)] flex items-center justify-center overflow-hidden">
                <div className="relative w-9 h-9">
                  {stages.map((stage, i) => (
                    <Image
                      key={i}
                      src={stage.image}
                      alt={stage.title}
                      fill
                      className={`object-contain transition-opacity duration-300 ${
                        i === activeIndex ? "opacity-100" : "opacity-0"
                      }`}
                      priority={i === 0}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8 sm:space-y-16 md:space-y-24">
            {stages.map((stage, idx) => {
              const isEven = idx % 2 === 0
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, ease }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {/* Mobile layout */}
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
                        <span className="font-mono uppercase text-xs tracking-[0.15em] text-[var(--fg)]">{stage.date}</span>
                        <span className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)]">Stage {idx + 1}</span>
                      </div>
                      <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--accent)]/30 transition-colors">
                        <h3 className="font-display uppercase text-base text-[var(--fg)] mb-1.5">{stage.title}</h3>
                        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{stage.description}</p>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                          <div className="w-7 h-7 bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center font-mono text-[10px] uppercase text-[var(--fg-secondary)] shrink-0">
                            {stage.contributor.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[var(--fg)]">{stage.contributor.name}</p>
                            <p className="font-mono uppercase text-[10px] tracking-wider text-[var(--fg-tertiary)]">{stage.contributor.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop alternating layout */}
                  <div className="hidden sm:grid grid-cols-[1fr_40px_1fr] md:grid-cols-[1fr_60px_1fr] items-start gap-4 md:gap-6">
                    <div className="col-start-2 row-start-1 flex justify-center pt-2">
                      <div className={`w-3 h-3 border-2 transition-colors duration-500 ${
                        idx <= activeIndex
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "bg-[var(--bg)] border-[var(--fg-tertiary)]/40"
                      }`} />
                    </div>
                    <div className={`col-start-1 row-start-1 ${isEven ? "text-right" : "text-right"}`}>
                      {isEven ? (
                        <div className="flex flex-col items-end pt-0.5">
                          <span className="font-mono uppercase text-xs tracking-[0.15em] text-[var(--fg)]">{stage.date}</span>
                          <span className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)] mt-0.5">Stage {idx + 1}</span>
                        </div>
                      ) : (
                        <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent)]/30 transition-colors">
                          <h3 className="font-display uppercase text-lg text-[var(--fg)] mb-2 text-left">{stage.title}</h3>
                          <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-left">{stage.description}</p>
                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]">
                            <div className="w-7 h-7 bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center font-mono text-[10px] uppercase text-[var(--fg-secondary)] shrink-0">
                              {stage.contributor.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-medium text-[var(--fg)]">{stage.contributor.name}</p>
                              <p className="font-mono uppercase text-[10px] tracking-wider text-[var(--fg-tertiary)]">{stage.contributor.role}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-start-3 row-start-1">
                      {isEven ? (
                        <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent)]/30 transition-colors">
                          <h3 className="font-display uppercase text-lg text-[var(--fg)] mb-2">{stage.title}</h3>
                          <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{stage.description}</p>
                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]">
                            <div className="w-7 h-7 bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center font-mono text-[10px] uppercase text-[var(--fg-secondary)] shrink-0">
                              {stage.contributor.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[var(--fg)]">{stage.contributor.name}</p>
                              <p className="font-mono uppercase text-[10px] tracking-wider text-[var(--fg-tertiary)]">{stage.contributor.role}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start pt-0.5">
                          <span className="font-mono uppercase text-xs tracking-[0.15em] text-[var(--fg)]">{stage.date}</span>
                          <span className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)] mt-0.5">Stage {idx + 1}</span>
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
              Our flagship autonomous vehicle project — a ground-up build combining LiDAR perception,
              neural path planning, and custom drive-by-wire controls on a student-built chassis.
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

      {/* Assembly Timeline */}
      <AssemblyTimeline />

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

      {/* Team */}
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
              Contributors
            </p>
            <h2 className="font-display uppercase text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--fg)] tracking-tight leading-[0.9]">
              The Team
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, ease }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-5 bg-[var(--bg)]"
              >
                <div className="w-11 h-11 bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center font-mono text-xs uppercase text-[var(--fg-secondary)] shrink-0">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium text-[var(--fg)] text-sm">{member.name}</p>
                  <p className="font-mono uppercase text-[10px] tracking-[0.12em] text-[var(--fg-tertiary)]">{member.role}</p>
                </div>
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
              href="/auth/signup"
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
