"use client"

export default function HeroFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-40 h-40 rounded-full border border-[var(--border)] animate-pulse" />
        <div className="absolute inset-4 rounded-full border border-[var(--border)]/50 animate-pulse" style={{ animationDelay: "0.3s" }} />
        <div className="absolute inset-8 rounded-full border border-[var(--border)]/30 animate-pulse" style={{ animationDelay: "0.6s" }} />
      </div>
    </div>
  )
}
