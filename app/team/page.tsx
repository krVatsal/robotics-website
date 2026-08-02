"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const faculty = [
  { name: "Prof. Rama Shanker Verma", role: "Director", dept: "MNNIT Allahabad", initials: "RV" },
  { name: "Prof. Pritam Singh", role: "SAC President", dept: "MNNIT Allahabad", initials: "PS" },
  { name: "Prof. Asim Mukharjee", role: "Faculty In-Charge", dept: "Technical Activities", initials: "AM" },
  { name: "Prof. Anand Sharma", role: "Faculty Coordinator", dept: "Robotics Club", initials: "AS" },
  { name: "Prof. Samir Saraswati", role: "Faculty In-Charge & Mentor", dept: "Self Driving Car · MED", initials: "SS" },
  { name: "Prof. Jitendra Narayan Gangwar", role: "Faculty In-Charge & Mentor", dept: "Self Driving Car · Asst. Prof. Grade-1", initials: "JG" },
]

const coordinators25 = [
  { name: "Anu Priya", initials: "AP" },
  { name: "Ayush Verma", initials: "AV" },
  { name: "Ashay Jadhav", initials: "AJ" },
  { name: "Bhanu Pratap Singh", initials: "BS" },
  { name: "Devendra Saini", initials: "DS" },
  { name: "Rishi Mishra", initials: "RM" },
  { name: "Sudhanshu Ranjan", initials: "SR" },
  { name: "Sarthak Kumar", initials: "SK" },
  { name: "Tushar Kesarwani", initials: "TK" },
]

const coordinators26 = [
  { name: "Inam Yadav", initials: "IY" },
  { name: "Krishna Gupta", initials: "KG" },
  { name: "Kushagra Verma", initials: "KV" },
  { name: "Devanshi Gupta", initials: "DG" },
  { name: "Ankit Upadhyay", initials: "AU" },
  { name: "Mohammad Kaif", initials: "MK" },
  { name: "Abdul Basit", initials: "AB" },
  { name: "Aman Sharma", initials: "AS" },
  { name: "Astha Singh", initials: "AS" },
  { name: "Abhay Agarwal", initials: "AA" },
  { name: "Dhruv Chandhok", initials: "DC" },
  { name: "Aryan Vishwakarma", initials: "AV" },
  { name: "Avneesh Sahu", initials: "AS" },
]

const nonTechMembers = [
  { name: "Kanishk Agrawal", role: "Design Lead" },
  { name: "Vatsal Kumar", role: "Design Lead" },
  { name: "Rudraksh Mall", role: "Designer" },
  { name: "Rishu Raj", role: "Designer" },
  { name: "Deepak Hadiya", role: "Designer" },
  { name: "Raghav Bansal", role: "Designer" },
  { name: "Gaurab Gupta", role: "Designer" },
  { name: "Ranjan Kumar", role: "Video Lead" },
  { name: "Krishna Garg", role: "Video Lead" },
  { name: "Daksh Katta", role: "Video Editor" },
  { name: "Roli Rathour", role: "Video Editor" },
]

const alumniMentors = [
  { name: "Bhuvan Jhamb", role: "R&D Engineer, Tesla", batch: "Alumni, 2020", initials: "BJ" },
  { name: "Kishan Tiwari", role: "Founder, TSAW Drones", batch: "Alumni, 2019", initials: "KT" },
  { name: "Sharad Rawat", role: "Software Engineer, Germany", batch: "Alumni, 2016", initials: "SR" },
  { name: "Rohit Garg", role: "Head Member, MNNIT Alumni Excellence (MAE) Foundation", batch: "", initials: "RG" },
]

const verticals = [
  { name: "Computer Vision", description: "Object detection, depth estimation, lane detection" },
  { name: "AI & ML", description: "Machine learning, reinforcement learning, sentiment analysis" },
  { name: "Embedded Systems", description: "Arduino, ESP32, sensor integration, firmware" },
  { name: "Hardware & Mechanical", description: "CAD, fabrication, 3D printing, chassis design" },
  { name: "Software", description: "ROS 2, path planning, SLAM, simulation, odometry" },
]

const stats = [
  { value: "22+", label: "Coordinators" },
  { value: "6", label: "Verticals" },
  { value: "11", label: "Design & Media" },
  { value: "4", label: "Alumni Mentors" },
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
              intersection of hardware, software, and autonomy at MNNIT Allahabad.
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
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Faculty & Mentors</h2>
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
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Coordinators &apos;25</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--border)]">
            {coordinators25.map((person, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-5 bg-[var(--bg)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center font-display text-sm shrink-0">
                  {person.initials}
                </div>
                <p className="text-base text-[var(--fg)]">{person.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Next Generation</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Coordinators &apos;26</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[var(--border)]">
            {coordinators26.map((person, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-5 bg-[var(--bg)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center font-display text-sm text-[var(--fg-secondary)] shrink-0">
                  {person.initials}
                </div>
                <p className="text-sm text-[var(--fg)]">{person.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
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
                <p className="text-sm text-[var(--fg)] font-medium mb-2">{v.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-tertiary)] leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Creative</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Design & Media</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[var(--border)]">
            {nonTechMembers.map((person, i) => (
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
                  <p className="font-mono text-[10px] uppercase text-[var(--fg-tertiary)]">{person.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-tertiary)] mb-3">Mentorship</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--fg)] tracking-tight leading-[0.9] mb-12">Alumni Mentors</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-px bg-[var(--border)]">
            {alumniMentors.map((person, i) => (
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
                  {person.batch && <p className="font-mono text-xs uppercase tracking-wider text-[var(--fg-tertiary)] mt-0.5">{person.batch}</p>}
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
              href="/auth/signin"
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
