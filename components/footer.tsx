"use client"

import { useSiteContent } from "@/lib/use-site-content"
import { Instagram, Linkedin, Mail } from "lucide-react"

const iconMap: Record<string, any> = { Instagram, Linkedin, Mail }

const defaults = {
  brandName: "MNNIT Robotics",
  brandDescription:
    "A student-led technical community at MNNIT Allahabad building autonomous systems, competing nationally, and pushing the frontier of applied robotics.",
  address: "Student Activity Centre, MNNIT Allahabad, Prayagraj",
  socialLinks: [
    {
      platform: "Instagram",
      url: "https://www.instagram.com/roboticsclubmnnit",
      icon: "Instagram",
    },
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/company/robotics-club-mnnit-allahabad",
      icon: "Linkedin",
    },
    {
      platform: "Email",
      url: "mailto:roboticsclub@mnnit.ac.in",
      icon: "Mail",
    },
  ],
  navLinks: [
    { label: "About", href: "/#who-are-we" },
    { label: "Projects", href: "/projects" },
    { label: "Events", href: "/events" },
    { label: "SDC", href: "/sdc" },
    { label: "Team", href: "/team" },
  ],
}

export default function Footer() {
  const { content } = useSiteContent("footer", defaults)
  const data = content ?? defaults

  return (
    <footer className="bg-[var(--bg)] border-t border-[var(--border)]">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <p className="font-display uppercase tracking-widest text-[var(--fg)] text-lg mb-3">
              {data.brandName}
            </p>
            <p className="text-sm text-[var(--fg-secondary)] font-sans leading-relaxed">
              {data.brandDescription}
            </p>
          </div>

          <div>
            <p className="font-mono uppercase text-xs tracking-wider text-[var(--fg-tertiary)] mb-4">
              Quick Links
            </p>
            <ul className="space-y-2">
              {(data.navLinks ?? []).map((link: any) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono uppercase text-xs tracking-wider text-[var(--fg-tertiary)] mb-4">
              Location
            </p>
            <p className="text-sm text-[var(--fg-secondary)] font-sans leading-relaxed">
              {data.address}
            </p>
          </div>

          <div>
            <p className="font-mono uppercase text-xs tracking-wider text-[var(--fg-tertiary)] mb-4">
              Connect
            </p>
            <div className="flex gap-4">
              {(data.socialLinks ?? []).map((s: any) => {
                const Icon = iconMap[s.icon] || Mail
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--fg-tertiary)] hover:text-[var(--fg)] transition-colors"
                    aria-label={s.platform}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-[var(--border)]">
          <p className="font-mono uppercase text-xs tracking-wider text-[var(--fg-tertiary)]">
            &copy; {new Date().getFullYear()} MNNIT Robotics Club. Precision in
            motion.
          </p>
        </div>
      </div>
    </footer>
  )
}
