"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
        <h1 className="font-display text-[8rem] md:text-[10rem] font-bold text-[var(--fg)] leading-none tracking-tighter mb-2">
          404
        </h1>

        <h2 className="font-display text-2xl font-bold text-[var(--fg)] mb-4">
          Page not found
        </h2>

        <p className="text-[var(--fg-secondary)] mb-10 leading-relaxed">
          The page you requested doesn't exist or has been moved. Check the URL or head back home.
        </p>

        <Link href="/" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
