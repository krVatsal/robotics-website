'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ChevronDown } from 'lucide-react'

export function UserAvatar() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    setIsOpen(false)
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-1.5 outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--border-hover)] transition-colors">
          <span className="font-medium text-sm text-[var(--fg)]">{initials}</span>
        </div>
        <ChevronDown
          size={12}
          className={`hidden md:block text-[var(--fg-tertiary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg)] border border-[var(--border)] shadow-[var(--shadow-lg)] z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border)]">
                <p className="font-medium text-sm text-[var(--fg)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--fg-tertiary)] truncate mt-0.5">{user.email}</p>
              </div>

              <div className="p-1.5">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Profile
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
