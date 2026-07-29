"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { motion } from "framer-motion"
import { Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react"

/**
 * Map error codes surfaced by /api/auth/google/callback into friendly text.
 * Anything not in this map falls back to the raw code (URL-decoded).
 */
const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Google sign-in session expired. Please try again.",
  missing_code_or_state: "Google sign-in was cancelled or malformed. Please try again.",
  google_access_denied: "You cancelled Google sign-in.",
  oauth_failed: "Google sign-in failed. Please try again.",
}

function SignInInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })

  // The `next` param — where we should send the user after login.
  // Same-origin only; the API layer also validates this defensively.
  const nextParam = searchParams.get("next") ?? "/"
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/"

  // Google callback redirects here with ?error=... on failure. Surface it.
  useEffect(() => {
    const err = searchParams.get("error")
    if (!err) return
    setError(GOOGLE_ERROR_MESSAGES[err] ?? decodeURIComponent(err))
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await signIn(formData.email, formData.password)
      router.push(safeNext)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Anchor href — no client JS needed for the OAuth flow, just a plain redirect.
  const googleHref = `/api/auth/google?next=${encodeURIComponent(safeNext)}`

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-[var(--fg-tertiary)]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--fg)]">Sign In</h1>
            <p className="text-sm text-[var(--fg-tertiary)] mt-1">MNNIT Robotics Club</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          {/*
            Google OAuth entry point.
            Plain <a> — no fetch. The route handler at /api/auth/google issues
            a 302 to Google, and the callback lands back here with cookies set.
          */}
          <a
            href={googleHref}
            className="w-full mb-5 py-3 rounded-full border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--bg-tertiary)] text-[var(--fg)] text-sm font-medium flex items-center justify-center gap-3 transition-colors"
          >
            <GoogleLogo />
            Continue with Google
          </a>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--bg-secondary)] text-[var(--fg-tertiary)] uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@mnnit.ac.in"
                required
                disabled={isLoading}
                className="w-full rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg)] focus:outline-none transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg)] focus:outline-none transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[var(--border)] pt-5 space-y-2">
            <p className="text-sm text-[var(--fg-secondary)]">
              New here?{" "}
              <Link href="/auth/signup" className="text-[var(--fg)] font-medium hover:underline">Create an account</Link>
            </p>
            {/*
              Admin login lives on a separate track — a shared password, no user
              account. Deliberately kept low-key (small link, muted) so regular
              members don't wander over there thinking that's their login.
            */}
            <p className="text-xs text-[var(--fg-tertiary)]">
              Site admin?{" "}
              <Link href="/admin/auth" className="text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:underline">
                Sign in here →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Wrapping SignInInner in <Suspense> is required because useSearchParams()
 * needs a suspense boundary in the App Router. Without it, Next.js throws
 * during static export / prerender.
 */
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  )
}

/** Inline Google G logo — no lucide equivalent, and no extra dep needed. */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.57v2.97h3.85c2.25-2.08 3.58-5.14 3.58-8.78z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-2.97c-1.07.72-2.44 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.97-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.97 3.09C6.21 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}
