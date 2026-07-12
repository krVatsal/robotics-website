"use client"

import { motion } from "framer-motion"
import { useSiteContent } from "@/lib/use-site-content"

const defaults = {
  heading: "About the club",
  description: [
    "MNNIT Robotics Club is a student-led technical community at Motilal Nehru National Institute of Technology, Allahabad. We design, build, and compete with robots — from autonomous vehicles to drones, manipulators, and embedded systems.",
    "Our work spans mechanical design, electronics, computer vision, and software. Members gain hands-on experience through projects, workshops, and national-level competitions.",
  ],
  stats: [
    { label: "Founded", value: "2016" },
    { label: "Active Projects", value: "50+" },
    { label: "Members", value: "120+" },
    { label: "Awards", value: "15+" },
  ],
}

export default function WhoAreWe() {
  const { content } = useSiteContent("who-are-we", defaults)
  const data = content ?? defaults

  return (
    <section id="who-are-we" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-20"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold text-[var(--fg)] tracking-tight leading-[1.05]">
            {data.heading}
          </h2>
          <div className="mt-8 space-y-5">
            {(data.description ?? []).map((p: string, i: number) => (
              <p key={i} className="text-[var(--fg-secondary)] leading-relaxed text-lg">{p}</p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {(data.stats ?? []).map((stat: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] group hover:border-[var(--border-hover)] transition-colors">
              <p className="font-display text-3xl md:text-4xl font-bold text-[var(--fg)] mb-1">{stat.value}</p>
              <p className="text-sm text-[var(--fg-tertiary)] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
