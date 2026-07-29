"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useSiteContent } from "@/lib/use-site-content"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const defaults = {
  tagline: "MNNIT Robotics Club",
  heading: "We Build\nThe Future.",
  subheading: "A student-led engineering community designing autonomous systems, competing nationally, and pushing the frontier of applied robotics.",
  ctaPrimary: { text: "Explore Projects", href: "/projects" },
  ctaSecondary: { text: "Join the Club", href: "/auth/signup" },
}

const ease: [number, number, number, number] = [0.32, 0.72, 0, 1]

export default function Hero() {
  const { user } = useAuth()
  const { content } = useSiteContent("hero", defaults)
  const hero = content ?? defaults
  const primaryHref = user ? (hero.ctaPrimary?.href || "/projects") : "/auth/signin"
  const secondaryHref = user ? "/projects" : (hero.ctaSecondary?.href || "/auth/signup")

  return (
    <section className="relative overflow-hidden bg-[var(--bg)] pt-16 pb-16 md:pt-20 md:pb-24">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Big animated logo on the right — 3D Y-axis rotation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease }}
        className="absolute right-[-5%] top-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
        style={{ perspective: "800px" }}
      >
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Image
            src="/favicon.png"
            alt=""
            width={500}
            height={500}
            className="dark:invert opacity-[0.12] select-none"
          />
        </motion.div>
      </motion.div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Top bar: logo + tagline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-3 mb-10"
        >
          <Image src="/favicon.png" alt="" width={22} height={22} className="dark:invert opacity-40" />
          <div className="h-px w-5 bg-[var(--accent)]" />
          <span className="font-mono uppercase text-[11px] tracking-[0.2em] text-[var(--fg-secondary)]">
            {hero.tagline || defaults.tagline}
          </span>
        </motion.div>

        {/* Monument heading */}
        <div className="mb-10">
          {(hero.heading || defaults.heading).split("\n").map((line: string, i: number) => (
            <div key={i} className="overflow-hidden">
              <motion.h1
                initial={{ y: 70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.1 + i * 0.1, ease }}
                className="font-display uppercase leading-[0.85] tracking-[-0.02em] text-display-gradient"
                style={{
                  fontSize: "clamp(4rem, 12vw, 10rem)",
                  lineHeight: 0.85,
                }}
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Bottom row: subtext left, CTAs right */}
        <div className="grid md:grid-cols-2 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 bg-[var(--accent)]" />
              <span className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--accent)] font-semibold">
                Est. 2016 — Prayagraj
              </span>
            </div>
            <p className="text-[15px] text-[var(--fg-secondary)] max-w-md leading-[1.65] font-medium">
              {hero.subheading}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, ease }}
            className="flex flex-wrap items-center gap-3 md:justify-end"
          >
            <Link
              href={primaryHref}
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--fg)] text-[var(--bg)] px-7 py-3 text-sm font-medium hover:opacity-85 transition-opacity"
            >
              {hero.ctaPrimary?.text || "Explore Projects"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] text-[var(--fg-secondary)] px-7 py-3 text-sm font-medium hover:border-[var(--fg)] hover:text-[var(--fg)] transition-all"
            >
              {hero.ctaSecondary?.text || "Join the Club"}
            </Link>
          </motion.div>
        </div>

        {/* Bottom hairline with stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-14 pt-6 border-t border-[var(--border)]"
        >
          <div className="flex flex-wrap gap-8 md:gap-14">
            {[
              { value: "120+", label: "Members" },
              { value: "50+", label: "Projects" },
              { value: "15+", label: "Awards" },
              { value: "8+", label: "Years" },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-2.5">
                <span className="font-display text-2xl text-[var(--fg)] leading-none">{s.value}</span>
                <span className="font-mono uppercase text-[10px] tracking-[0.15em] text-[var(--fg-tertiary)]">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
