'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

const departments = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Engineering and Computational Mechanics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotech Engineering",
  "Production and Industrial Engineering",
  "Chemical Engineering",
  "Materials Engineering",
  "Other"
]

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    department: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.name, formData.rollNo, formData.department)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg)] focus:outline-none transition-colors text-sm"

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-5 h-5 text-[var(--fg-tertiary)]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--fg)]">Create Account</h1>
            <p className="text-sm text-[var(--fg-tertiary)] mt-1">Join the MNNIT Robotics Club</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required disabled={isLoading} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@mnnit.ac.in" required disabled={isLoading} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Roll Number</label>
                <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="2024XXX" disabled={isLoading} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Department</label>
                <select name="department" value={formData.department} onChange={handleChange} disabled={isLoading} className={`${inputClass} appearance-none`}>
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required disabled={isLoading} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required disabled={isLoading} className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[var(--border)] pt-5">
            <p className="text-sm text-[var(--fg-secondary)]">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-[var(--fg)] font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
