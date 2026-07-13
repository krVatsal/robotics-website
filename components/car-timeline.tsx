"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useSiteContent } from "@/lib/use-site-content"

const defaultContent = {
  heading: "Development\nTimeline.",
  description: "A chronological record of engineering milestones, rigorous testing phases, and critical software deployments. Precision documented.",
  milestones: [] as any[],
}

export default function CarTimeline() {
  const { content } = useSiteContent("car-timeline", defaultContent)
  const data = content ?? defaultContent
  const milestones = data.milestones ?? []

  const containerRef = useRef<HTMLDivElement>(null!)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["5%", `-${Math.max(0, milestones.length * 25 - 80)}%`])

  if (milestones.length === 0) {
    return <div ref={containerRef} className="hidden" />
  }

  return (
    <section ref={containerRef} id="updates" className="py-24 lg:py-32 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 rounded-full bg-[var(--fg)]" />
            <span className="text-xs font-semibold text-[var(--fg)] uppercase tracking-widest">Project Atlas Log</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-[var(--fg)] tracking-tight leading-[1.05]">
            {(data.heading || "Development\nTimeline.").split("\n").map((line: string, i: number) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
          <p className="mt-8 text-[var(--fg-secondary)] text-lg max-w-2xl leading-relaxed">
            {data.description}
          </p>
        </motion.div>
      </div>

      {/* Desktop: horizontal scroll */}
      <div className="hidden md:block h-[250vh] relative">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          {/* Quarter markers */}
          <div className="flex justify-between px-16 mb-6 text-sm text-[var(--fg-tertiary)]">
            {milestones.map((m: any, i: number) => (
              <span key={i} className={`${i === milestones.length - 1 ? "font-semibold text-[var(--fg)]" : ""}`}>
                {m.date}
                {i === milestones.length - 1 && <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--fg)] ml-2 align-middle" />}
              </span>
            ))}
          </div>

          {/* Timeline track */}
          <div className="relative px-16 mb-8">
            <div className="h-px bg-[var(--border)] w-full" />
            <div className="absolute top-0 left-16 right-16 flex justify-between -translate-y-1/2">
              {milestones.map((_: any, i: number) => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full border-2 ${
                  i === milestones.length - 1
                    ? "bg-[var(--fg)] border-[var(--fg)]"
                    : "bg-[var(--bg)] border-[var(--fg-tertiary)]"
                }`} />
              ))}
            </div>
          </div>

          {/* Cards */}
          <motion.div style={{ x }} className="flex gap-6 px-16">
            {milestones.map((milestone: any, idx: number) => (
              <div
                key={idx}
                className="shrink-0 w-[380px] rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden group hover:border-[var(--border-hover)] transition-colors"
              >
                <div className="h-48 bg-[var(--bg-tertiary)] relative overflow-hidden">
                  {milestone.isCode ? (
                    <div className="absolute inset-0 bg-[#1a1a1a] p-4 font-mono text-xs text-emerald-400/80 leading-relaxed">
                      <p className="text-[var(--fg-tertiary)]">{"// "}{milestone.title}</p>
                      <p>init_neural_net();</p>
                      <p><span className="font-bold text-white">await</span> calibrate_stream();</p>
                      <p>verify_point_cloud();</p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--fg-tertiary)]">
                      {milestone.isActive && (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[var(--fg)] text-[var(--bg)] text-[10px] font-semibold uppercase tracking-wider">
                          Active Phase
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-[var(--fg)] mb-1">{milestone.title}</h3>
                  <p className="text-sm text-[var(--fg-secondary)] line-clamp-2">{milestone.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden px-6 space-y-6">
        <div className="relative border-l-2 border-[var(--border)] ml-3 pl-8 space-y-10">
          {milestones.map((milestone: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-[var(--fg)] border-2 border-[var(--bg)]" />
              <span className="text-xs text-[var(--fg-tertiary)] mb-1 block">{milestone.date}</span>
              <h3 className="text-lg font-display font-semibold text-[var(--fg)] mb-2">{milestone.title}</h3>
              <p className="text-sm text-[var(--fg-secondary)]">{milestone.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
