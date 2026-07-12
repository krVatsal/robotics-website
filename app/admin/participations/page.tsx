"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import { Search, Trophy, Users, CheckCircle, Clock, Download, ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AdminParticipationsPage() {
    const [teams, setTeams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("ALL")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/participations")
                if (res.ok) {
                    const data = await res.json()
                    setTeams(data)
                }
            } catch (error) {
                console.error("Error loading participations", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredTeams = teams.filter(team => {
        const matchesSearch =
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.leaderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.competitionName?.toLowerCase().includes(searchTerm.toLowerCase())

        if (filter === "FINALIZED") return matchesSearch && team.isFinalized
        if (filter === "PENDING") return matchesSearch && !team.isFinalized
        return matchesSearch
    })

    const exportCSV = () => {
        const headers = ["Team Name", "Competition", "Leader Name", "Leader Email", "Members", "Status", "Created At"]
        const rows = filteredTeams.map(t => [
            t.name,
            t.competitionName || "Unknown",
            t.leaderName || "Unknown",
            t.leaderEmail || "Unknown",
            t.memberCount,
            t.isFinalized ? "Finalized" : "Pending",
            new Date(t.createdAt).toLocaleDateString()
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "participations_data.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--fg-tertiary)]">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="font-display text-4xl font-bold text-[var(--fg)] tracking-tight">Participations</h1>
                            <p className="text-[var(--fg-secondary)] mt-1">Monitor all team registrations across competitions.</p>
                        </div>
                    </div>

                    <button
                        onClick={exportCSV}
                        className="px-5 py-2.5 rounded-full text-sm font-medium bg-[var(--bg-secondary)] text-[var(--fg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all flex items-center gap-2"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-tertiary)] w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search teams, leaders, or competitions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg)] focus:outline-none transition-colors text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["ALL", "FINALIZED", "PENDING"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    filter === f
                                        ? "bg-[var(--fg)] text-[var(--bg)]"
                                        : "bg-[var(--bg)] text-[var(--fg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]"
                                }`}
                            >
                                {f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-secondary)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--fg-tertiary)]">
                                        <th className="p-4">Team Details</th>
                                        <th className="p-4">Competition</th>
                                        <th className="p-4">Leader</th>
                                        <th className="p-4 text-center">Members</th>
                                        <th className="p-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {filteredTeams.map((team) => (
                                        <motion.tr
                                            key={team._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            <td className="p-4">
                                                <p className="font-medium text-[var(--fg)]">{team.name}</p>
                                                <p className="text-xs text-[var(--fg-tertiary)]">{team.teamCode}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Trophy size={14} className="text-[var(--fg-tertiary)]" />
                                                    <span className="text-sm text-[var(--fg-secondary)]">{team.competitionName || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-[var(--fg)]">{team.leaderName}</p>
                                                <p className="text-xs text-[var(--fg-tertiary)]">{team.leaderEmail}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--bg)] text-[var(--fg-secondary)] text-xs border border-[var(--border)]">
                                                    <Users size={12} /> {team.memberCount}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {team.isFinalized ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                                        <CheckCircle size={12} /> Finalized
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredTeams.length === 0 && (
                            <div className="p-12 text-center text-[var(--fg-tertiary)]">
                                No records found matching your filters.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
