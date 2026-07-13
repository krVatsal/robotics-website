"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface Props {
  steps: string[]
  currentStep: number
}

export default function WizardStepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto mb-10">
      {steps.map((label, idx) => {
        const isActive = idx === currentStep
        const isComplete = idx < currentStep
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors ${
                  isComplete
                    ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                    : isActive
                    ? "bg-[var(--bg)] text-[var(--fg)] border-[var(--fg)]"
                    : "bg-[var(--bg-secondary)] text-[var(--fg-tertiary)] border-[var(--border)]"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
              </motion.div>
              <span className={`text-[10px] mt-2 text-center whitespace-nowrap uppercase tracking-wider font-medium ${
                isActive ? "text-[var(--fg)]" : "text-[var(--fg-tertiary)]"
              }`}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mt-[-16px] ${
                idx < currentStep ? "bg-[var(--fg)]" : "bg-[var(--border)]"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
