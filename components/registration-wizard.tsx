"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Users, Plus, Loader2, Check, AlertCircle, Copy } from "lucide-react"
import WizardStepIndicator from "./wizard-step-indicator"

interface Props {
  competitionId: string
}

export default function RegistrationWizard({ competitionId }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<"join" | "create" | null>(null)
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [teamName, setTeamName] = useState("")
  const [teamCode, setTeamCode] = useState("")
  const [validatedTeam, setValidatedTeam] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [result, setResult] = useState<{ teamId: string; teamCode?: string; teamName?: string; pending?: boolean } | null>(null)
  const [copied, setCopied] = useState(false)

  const steps = mode === "create"
    ? ["Mode", "Identity", "Review"]
    : mode === "join"
    ? ["Mode", "Identity", "Review"]
    : ["Mode"]

  async function validateCode(code: string) {
    // Nanoid codes are 6 chars — start validating at 6 so we don't chatter
    // the API on every keystroke.
    if (code.length < 4) { setValidatedTeam(null); setError(""); return }
    setIsValidating(true)
    try {
      const res = await fetch(
        `/api/teams/validate-code?code=${encodeURIComponent(code)}`,
        { credentials: "include" },
      )
      const data = await res.json()
      if (data.valid) {
        setValidatedTeam(data.teamName)
        setError("")
      } else {
        setValidatedTeam(null)
        // Show a targeted message per reason so users know how to recover.
        if (data.reason === "finalized") {
          setError(`Team "${data.teamName ?? "?"}" is already finalized and can't accept new members.`)
        } else if (data.reason === "not_found") {
          setError("No team matches that code.")
        } else if (data.reason === "malformed") {
          // Silent — user is still typing.
          setError("")
        } else {
          setError(data.error ?? "Invalid team code")
        }
      }
    } catch {
      setValidatedTeam(null)
      setError("Couldn't verify code — try again.")
    } finally {
      setIsValidating(false)
    }
  }

  async function handleSubmit() {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: mode!.toUpperCase(),
          competitionId,
          teamName: mode === "create" ? teamName : undefined,
          teamCode: mode === "join" ? teamCode : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Operation failed")

      // JOIN now returns { pending: true, teamId, teamName, requestId } — the
      // wizard needs to show a "request sent" state instead of dumping the user
      // onto the team page (they're not on it yet — leader has to approve).
      if (mode === "join" && data.pending) {
        setResult({
          teamId: data.teamId,
          teamName: data.teamName,
          pending: true,
        } as any)
        setStep(steps.length)
        return
      }

      const teamId = data._id || data.team?._id || data.value?._id
      setResult({
        teamId,
        teamCode: data.teamCode || data.team?.teamCode,
        teamName: data.teamName || data.team?.name || teamName,
      })
      setStep(steps.length)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function copyCode() {
    if (result?.teamCode) {
      navigator.clipboard.writeText(result.teamCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-10 text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-display font-bold text-[var(--fg)] mb-2">
          {mode === "create"
            ? "Team Created!"
            : result.pending
              ? "Request Sent!"
              : "Team Joined!"}
        </h2>
        <p className="text-[var(--fg-secondary)] text-sm mb-6">
          {result.pending
            ? `Waiting for the leader of "${result.teamName}" to approve your request.`
            : result.teamName}
        </p>

        {result.teamCode && mode === "create" && (
          <div className="mb-8">
            <p className="text-xs text-[var(--fg-tertiary)] mb-2">Share this code with teammates</p>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors"
            >
              <span className="text-2xl font-bold tracking-[0.3em] text-[var(--fg)]">
                {result.teamCode}
              </span>
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--fg-tertiary)]" />}
            </button>
          </div>
        )}

        <button
          onClick={() => router.push(`/teams/${result.teamId}`)}
          className="px-8 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Go to Team
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <WizardStepIndicator steps={steps} currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-display font-semibold text-[var(--fg)] text-center mb-6">
              How would you like to participate?
            </h2>

            <button
              onClick={() => { setMode("join"); setStep(1) }}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 text-left hover:border-[var(--border-hover)] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <Users className="w-6 h-6 text-[var(--fg-secondary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--fg)] group-hover:text-[var(--fg)] transition-colors">
                    Join a Team
                  </h3>
                  <p className="text-sm text-[var(--fg-secondary)]">Enter an invite code from your teammates</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--fg-tertiary)] ml-auto group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button
              onClick={() => { setMode("create"); setStep(1) }}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 text-left hover:border-[var(--border-hover)] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <Plus className="w-6 h-6 text-[var(--fg-secondary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--fg)] group-hover:text-[var(--fg)] transition-colors">
                    Create a Team
                  </h3>
                  <p className="text-sm text-[var(--fg-secondary)]">Start a new team and invite members</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--fg-tertiary)] ml-auto group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-8"
          >
            {mode === "join" ? (
              <div className="space-y-4">
                <h2 className="text-lg font-display font-semibold text-[var(--fg)]">Enter Team Code</h2>
                <p className="text-sm text-[var(--fg-secondary)]">Ask your team leader for the invite code</p>
                <input
                  type="text"
                  placeholder="e.g. RB-X79Z"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 text-xl tracking-[0.3em] text-center text-[var(--fg)] focus:border-[var(--fg)] focus:outline-none transition-colors"
                  value={teamCode}
                  onChange={e => {
                    const v = e.target.value.toUpperCase()
                    setTeamCode(v)
                    setError("")
                    validateCode(v)
                  }}
                />
                {isValidating && (
                  <div className="flex items-center gap-2 text-xs text-[var(--fg-tertiary)]">
                    <Loader2 className="w-3 h-3 animate-spin" /> Validating...
                  </div>
                )}
                {validatedTeam && (
                  <div className="flex items-center gap-2 text-xs text-emerald-500">
                    <Check className="w-3 h-3" /> Team: {validatedTeam}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-display font-semibold text-[var(--fg)]">Fleet Designation</h2>
                <p className="text-sm text-[var(--fg-secondary)]">Choose a memorable name for your team</p>
                <input
                  type="text"
                  placeholder="e.g. Nexus Vanguard"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 text-[var(--fg)] focus:border-[var(--fg)] focus:outline-none transition-colors"
                  value={teamName}
                  onChange={e => { setTeamName(e.target.value); setError("") }}
                />
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setStep(0); setMode(null); setError("") }}
                className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm text-[var(--fg-secondary)] hover:border-[var(--border-hover)] transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Mode Select
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={mode === "join" ? !validatedTeam : !teamName.trim()}
                className="flex-1 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Configure Roster <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-8"
          >
            <h2 className="text-lg font-display font-semibold text-[var(--fg)] mb-6">Review & Confirm</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--fg-tertiary)] uppercase tracking-wider">Action</span>
                <span className="text-sm font-medium text-[var(--fg)] capitalize">{mode} Team</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--fg-tertiary)] uppercase tracking-wider">{mode === "join" ? "Team Code" : "Team Name"}</span>
                <span className="text-sm font-medium text-[var(--fg)]">
                  {mode === "join" ? teamCode : teamName}
                </span>
              </div>
              {mode === "join" && validatedTeam && (
                <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--fg-tertiary)] uppercase tracking-wider">Team Name</span>
                  <span className="text-sm font-medium text-[var(--fg)]">{validatedTeam}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-[var(--fg-tertiary)] uppercase tracking-wider">Competition</span>
                <span className="text-sm text-[var(--fg-secondary)] font-mono">{competitionId}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm text-[var(--fg-secondary)] hover:border-[var(--border-hover)] transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Confirm <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
