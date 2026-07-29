"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const faculty = [
  { name: "Dr. Rajesh Kumar", role: "Faculty Advisor", dept: "Mechanical Engineering", initials: "RK" },
  { name: "Dr. Anita Srivastava", role: "Co-Advisor", dept: "Electronics & Communication", initials: "AS" },
]

const coordinators = [
  { name: "Aarav Mehta", role: "President", year: "Final Year · ME", bio: "Leading the club's strategic direction and competition portfolio. 3 years in autonomous systems.", initials: "AM" },
  { name: "Priya Sharma", role: "Vice President", year: "Final Year · ECE", bio: "Oversees all technical verticals. Built our LiDAR perception pipeline from scratch.", initials: "PS" },
  { name: "Vikram Singh", role: "Technical Head", year: "Pre-Final · CSE", bio: "ROS 2 architect and simulation lead. Manages the software stack across all projects.", initials: "VS" },
]

const leads = [
  { name: "Rohan Gupta", role: "Mechanical Lead", vertical: "Mechanical", initials: "RG" },
  { name: "Sneha Verma", role: "Electronics Lead", vertical: "Electronics", initials: "SV" },
  { name: "Ananya Rao", role: "CV Lead", vertical: "Computer Vision", initials: "AR" },
  { name: "Karan Patel", role: "Software Lead", vertical: "Software", initials: "KP" },
  { name: "Meera Iyer", role: "Design Lead", vertical: "CAD & Fabrication", initials: "MI" },
  { name: "Arjun Nair", role: "Outreach Lead", vertical: "Events & PR", initials: "AN" },
]

const members = [
  { name: "Aditya Raj", vertical: "Software", year: "2nd Year" },
  { name: "Ishita Gupta", vertical: "Electronics", year: "2nd Year" },
  { name: "Manav Reddy", vertical: "Mechanical", year: "3rd Year" },
  { name: "Sanya Kapoor", vertical: "Computer Vision", year: "2nd Year" },
  { name: "Dhruv Tiwari", vertical: "Software", year: "3rd Year" },
  { name: "Nisha Agarwal", vertical: "Electronics", year: "2nd Year" },
  { name: "Rahul Saxena", vertical: "Mechanical", year: "2nd Year" },
  { name: "Pooja Mishra", vertical: "Software", year: "3rd Year" },
  { name: "Amit Verma", vertical: "Computer Vision", year: "2nd Year" },
  { name: "Tanvi Joshi", vertical: "CAD & Fabrication", year: "2nd Year" },
  { name: "Nikhil Sharma", vertical: "Electronics", year: "3rd Year" },
  { name: "Kavya Nair", vertical: "Software", year: "2nd Year" },
]

const verticals = [
  { name: "Software", count: 28, description: "ROS 2, path planning, SLAM, simulation" },
  { name: "Electronics", count: 16, description: "PCB design, embedded firmware, CAN bus" },
  { name: "Mechanical", count: 14, description: "CAD, fabrication, 3D printing, chassis" },
  { name: "Computer Vision", count: 12, description: "Object detection, depth estimation, tracking" },
  { name: "CAD & Fabrication", count: 8, description: "SolidWorks, laser cutting, CNC milling" },
]

const stats = [
  { value: "120+", label: "Active Members" },
  { value: "5", label: "Verticals" },
  { value: "6", label: "Team Leads" },
  { value: "2016", label: "Founded" },
]

const ease = [0.32, 0.72, 0, 1] as const

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-4">The People</p>
            <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.85] mb-6">
              Behind<br />The Club
            </h1>
            <p className="text-lg text-[var(--fg-secondary)] max-w-2xl leading-relaxed tracking-[-0.01em]">
              A multidisciplinary team of engineers, designers, and builders working at the
              intersection of hardware, software, and autonomy.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border)] mt-16"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-[var(--bg)] p-6">
                <p className="font-display text-4xl text-[var(--fg)] leading-none">{stat.value}</p>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--fg-tertiary)] mt-2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Guidance</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Faculty Advisors</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-px bg-[var(--border)]">
            {faculty.map((person, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, ease }}
                viewport={{ once: true }}
                className="flex items-center gap-5 p-6 bg-[var(--bg)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center font-display text-lg text-[var(--fg-secondary)] shrink-0">
                  {person.initials}
                </div>
                <div>
                  <p className="text-base text-[var(--fg)]">{person.name}</p>
                  <p className="text-sm text-[var(--fg-secondary)]">{person.role}</p>
                  <p className="font-mono text-xs uppercase tracking-wider text-[var(--fg-tertiary)] mt-0.5">{person.dept}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Leadership</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Core Coordinators</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-[var(--border)]">
            {coordinators.map((person, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, ease }}
                viewport={{ once: true }}
                className="p-6 bg-[var(--bg)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center font-display text-sm mb-5">
                  {person.initials}
                </div>
                <p className="text-xl text-[var(--fg)] mb-0.5">{person.name}</p>
                <p className="text-sm text-[var(--fg-secondary)]">{person.role}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)] mt-1 mb-4">{person.year}</p>
                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{person.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Structure</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Technical Verticals</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[var(--border)]">
            {verticals.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease }}
                viewport={{ once: true }}
                className="p-5 bg-[var(--bg)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <p className="font-display text-3xl text-[var(--fg)] leading-none mb-1">{v.count}</p>
                <p className="text-sm text-[var(--fg)] mb-2">{v.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-tertiary)] leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Vertical Heads</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Team Leads</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
            {leads.map((person, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-5 bg-[var(--bg)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center font-mono text-xs text-[var(--fg-secondary)] shrink-0">
                  {person.initials}
                </div>
                <div>
                  <p className="text-sm text-[var(--fg)]">{person.name}</p>
                  <p className="text-xs text-[var(--fg-secondary)]">{person.role}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-tertiary)] mt-0.5">{person.vertical}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Community</p>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9]">Active Members</h2>
            </div>
            <p className="font-mono text-xs uppercase text-[var(--fg-tertiary)] hidden md:block">{members.length} of 120+</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[var(--border)]">
            {members.map((person, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-3.5 bg-[var(--bg)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center font-mono text-[10px] text-[var(--fg-secondary)] shrink-0">
                  {person.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--fg)] truncate">{person.name}</p>
                  <p className="font-mono text-[10px] uppercase text-[var(--fg-tertiary)]">{person.vertical} / {person.year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-4">
              See yourself here?
            </h2>
            <p className="text-[var(--fg-secondary)] mb-8 max-w-md mx-auto">
              We recruit every semester. No prior robotics experience needed — just curiosity and the drive to build.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[var(--fg)] text-[var(--fg)] text-sm hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
            >
              Apply to Join <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
