"use client"

import { motion } from "framer-motion"

interface Project {
  status: string
  category: string
  techStack: string[]
}

export default function ProjectHudOverlay({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      whileHover={{ y: 0 }}
      className="absolute inset-0 z-20 bg-[var(--bg)]/90 backdrop-blur-md p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            project.status === "completed"
              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
              : "bg-[var(--bg-secondary)] text-[var(--fg-secondary)] border border-[var(--border)]"
          }`}>
            {project.status || "In Progress"}
          </span>
          {project.category && (
            <span className="text-[10px] text-[var(--fg-tertiary)] uppercase tracking-wider">
              {project.category}
            </span>
          )}
        </div>

        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 5).map(tech => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] rounded bg-[var(--bg-secondary)] text-[var(--fg-secondary)] border border-[var(--border)]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
