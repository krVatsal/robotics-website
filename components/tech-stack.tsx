"use client"

import { motion } from "framer-motion"
import { Code2, Cog, Cpu, Eye, Wifi, Gauge } from "lucide-react"
import { useSiteContent } from "@/lib/use-site-content"

const iconMap: Record<string, any> = { Code2, Cog, Cpu, Eye, Wifi, Gauge }

const defaults = {
  heading: "Technology",
  technologies: [
    {
      name: "Software Architecture",
      subtitle: "Adaptive intelligence layer.",
      icon: "Code2",
      span: "lg:col-span-3",
      details: [
        { label: "Framework", value: "ROS 2 Humble" },
        { label: "Perception", value: "LiDAR / V-SLAM fusion" },
        { label: "Planning", value: "Nav2 + custom planner" },
      ],
    },
    {
      name: "Mechanical",
      subtitle: "Precision-engineered hardware.",
      icon: "Cog",
      span: "lg:col-span-2",
      details: [
        { label: "CAD", value: "SolidWorks + Fusion 360" },
        { label: "Fabrication", value: "CNC + 3D printing" },
      ],
    },
    {
      name: "Computer Vision",
      subtitle: "Real-time scene understanding.",
      icon: "Eye",
      span: "lg:col-span-2",
      details: [
        { label: "Models", value: "YOLOv8 + SegFormer" },
        { label: "Pipeline", value: "OpenCV + TensorRT" },
      ],
    },
    {
      name: "Electronics",
      subtitle: "Custom PCB design and embedded systems.",
      icon: "Cpu",
      span: "lg:col-span-2",
      details: [
        { label: "MCU", value: "STM32 + ESP32" },
        { label: "Comm", value: "CAN bus + LoRa" },
      ],
    },
    {
      name: "Communication",
      subtitle: "Fleet-wide mesh networking.",
      icon: "Wifi",
      span: "lg:col-span-1",
      details: [
        { label: "Protocol", value: "DDS / MQTT" },
      ],
    },
  ],
}

export default function TechStack() {
  const { content } = useSiteContent("tech-stack", defaults)
  const data = content ?? defaults

  return (
    <section id="tech-stack" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-5xl font-bold text-[var(--fg)] tracking-tight mb-14"
        >
          {data.heading}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(data.technologies ?? []).map((tech: any, idx: number) => {
            const Icon = iconMap[tech.icon] || Cpu
            return (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                viewport={{ once: true }}
                className={`group rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] p-6 flex flex-col justify-between min-h-[260px] hover:border-[var(--border-hover)] transition-colors ${tech.span || ""}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-xl lg:text-2xl font-bold text-[var(--fg)]">{tech.name}</h3>
                      <p className="text-sm text-[var(--fg-tertiary)] mt-1">{tech.subtitle}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center shrink-0 ml-4">
                      <Icon className="w-4 h-4 text-[var(--fg-tertiary)]" />
                    </div>
                  </div>
                </div>

                {tech.details && tech.details.length > 0 && (
                  <div className="flex flex-wrap gap-x-8 gap-y-2 mt-auto pt-6 border-t border-[var(--border)]">
                    {tech.details.map((d: any) => (
                      <div key={d.label}>
                        <p className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider">{d.label}</p>
                        <p className="text-sm text-[var(--fg-secondary)]">{d.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
