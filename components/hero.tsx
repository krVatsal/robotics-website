"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useSiteContent } from "@/lib/use-site-content"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false })

const defaults = {
  tagline: "MNNIT Robotics Club",
  heading: "Building Robotic\nInterfaces To\nShape The Future",
  subheading: "From neural signals to autonomous impact.",
  ctaPrimary: { text: "Explore our fleet", href: "/projects" },
  ctaSecondary: { text: "View Projects", href: "/projects" },
}

export default function Hero() {
  const { user } = useAuth()
  const { content } = useSiteContent("hero", defaults)
  const hero = content ?? defaults

  const primaryHref = user ? (hero.ctaPrimary?.href || "/projects") : "/auth/signin"

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[var(--bg)] overflow-hidden">
      {/* 3D Robot — positioned lower-right */}
      <div className="absolute inset-0 flex items-end justify-center lg:items-center lg:justify-end lg:pr-[5%] pb-8 lg:pb-0 lg:pt-24">
        <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[700px] lg:h-[700px]" role="img" aria-label="3D Robot">
          <HeroScene />
        </div>
      </div>

      {/* Text overlay — left aligned */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-tight text-[var(--fg)]"
          >
            {(hero.heading || defaults.heading).split("\n").map((line: string, i: number) => (
              <span key={i} className="block">{line}</span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 text-lg text-[var(--fg-secondary)] max-w-md"
          >
            {hero.subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10"
          >
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {hero.ctaPrimary?.text || "Explore our fleet"} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

    </section>
  )
}
