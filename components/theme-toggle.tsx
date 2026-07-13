"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useCallback, useRef } from "react"
import { Sun, Moon } from "lucide-react"

const PIXEL_SIZE = 28
const WAVE_DELAY = 8
const WAVES_PER_FRAME = 4

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const animatingRef = useRef(false)

  useEffect(() => setMounted(true), [])

  const runPixelTransition = useCallback(() => {
    if (animatingRef.current) return
    animatingRef.current = true

    const isDark = resolvedTheme === "dark"
    const fromBg = isDark ? "#0A0A0A" : "#FFFFFF"

    const vw = window.innerWidth
    const vh = window.innerHeight
    const cols = Math.ceil(vw / PIXEL_SIZE)
    const rows = Math.ceil(vh / PIXEL_SIZE)
    const maxWave = cols + rows - 2

    // Pre-compute distorted pixel rects — random size/offset jitter per cell
    const rng = () => Math.random()
    const cells: { x: number; y: number; w: number; h: number; wave: number }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jitterX = (rng() - 0.5) * PIXEL_SIZE * 0.05
        const jitterY = (rng() - 0.5) * PIXEL_SIZE * 0.05
        const sizeJitter = 0.9 + rng() * 0.1
        const w = PIXEL_SIZE * sizeJitter
        const h = PIXEL_SIZE * sizeJitter
        const x = c * PIXEL_SIZE + (PIXEL_SIZE - w) / 2 + jitterX
        const y = r * PIXEL_SIZE + (PIXEL_SIZE - h) / 2 + jitterY
        // diagonal wave index with per-cell random offset (±1) for ragged edge
        const waveOffset = Math.floor(rng() * 3) - 1
        const wave = c + r + waveOffset
        cells.push({ x, y, w, h, wave })
      }
    }

    const canvas = document.createElement("canvas")
    canvas.width = vw
    canvas.height = vh
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      pointerEvents: "none",
      width: "100vw",
      height: "100vh",
    })
    document.body.appendChild(canvas)

    const ctx = canvas.getContext("2d")!

    // Draw distorted pixel grid (not a solid fill — individual jittered rects)
    ctx.fillStyle = fromBg
    for (const cell of cells) {
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h)
    }

    setTheme(isDark ? "light" : "dark")

    let currentWave = -1

    function animate() {
      for (let w = 0; w < WAVES_PER_FRAME && currentWave <= maxWave + 1; w++, currentWave++) {
        for (const cell of cells) {
          if (cell.wave === currentWave) {
            ctx.clearRect(
              cell.x - 2,
              cell.y - 2,
              cell.w + 4,
              cell.h + 4,
            )
          }
        }
      }

      if (currentWave <= maxWave + 1) {
        setTimeout(() => requestAnimationFrame(animate), WAVE_DELAY)
      } else {
        canvas.remove()
        animatingRef.current = false
      }
    }

    requestAnimationFrame(animate)
  }, [resolvedTheme, setTheme])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={runPixelTransition}
      className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--fg-tertiary)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)] transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
