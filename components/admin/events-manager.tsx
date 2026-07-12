"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Calendar, MapPin, Save, X, Trophy, ListChecks, Loader2 } from "lucide-react"

type Event = {
    _id: string
    name: string
    theme: string
    tagline: string
    description: string
    date: string
    location: string
    competitions: any[]
}

type Competition = {
    _id?: string
    eventId: string
    title: string
    type: string
    description: string
    teamSize: string
    minTeamSize: number
    maxTeamSize: number
    rules: string[]
}

const inputClass = "w-full rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg)] focus:outline-none transition-colors text-sm"

export function EventsManager() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
    const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null)
    const [editingComp, setEditingComp] = useState<Partial<Competition> | null>(null)
    const [newRule, setNewRule] = useState("")

    useEffect(() => { fetchEvents() }, [])

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/events")
            const data = await res.json()
            setEvents(data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleSaveEvent = async () => {
        if (!editingEvent) return
        const isNew = !editingEvent._id
        const url = isNew ? "/api/events" : `/api/events/${editingEvent._id}`
        const method = isNew ? "POST" : "PUT"
        try {
            const { _id, ...payload } = editingEvent as any
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
            if (res.ok) { fetchEvents(); setEditingEvent(null) }
        } catch (e) { alert("Failed to save event") }
    }

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Delete this event and ALL its competitions?")) return
        try { await fetch(`/api/events/${id}`, { method: "DELETE" }); fetchEvents() }
        catch (e) { alert("Delete failed") }
    }

    const handleAddRule = () => {
        if (!newRule.trim() || !editingComp) return
        setEditingComp({ ...editingComp, rules: [...(editingComp.rules || []), newRule.trim()] })
        setNewRule("")
    }

    const handleRemoveRule = (index: number) => {
        if (!editingComp?.rules) return
        const updatedRules = [...editingComp.rules]
        updatedRules.splice(index, 1)
        setEditingComp({ ...editingComp, rules: updatedRules })
    }

    const handleSaveComp = async () => {
        if (!editingComp) return
        const isNew = !editingComp._id
        const url = isNew ? "/api/competitions" : `/api/competitions/${editingComp._id}`
        const method = isNew ? "POST" : "PUT"
        try {
            const { _id, ...payload } = editingComp as any
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed") }
            fetchEvents(); setEditingComp(null); setNewRule("")
        } catch (e: any) { alert(`Failed to save: ${e.message}`) }
    }

    const handleDeleteComp = async (id: string) => {
        if (!confirm("Delete this competition?")) return
        try { await fetch(`/api/competitions/${id}`, { method: "DELETE" }); fetchEvents() }
        catch (e) { alert("Delete failed") }
    }

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" /></div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="font-display text-2xl font-bold text-[var(--fg)]">Manage Events</h2>
                <button onClick={() => setEditingEvent({ theme: 'red' })} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus size={16} /> New Event
                </button>
            </div>

            {/* Edit Event Modal */}
            {editingEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[var(--shadow-lg)]">
                        <h3 className="font-display text-xl font-bold text-[var(--fg)] mb-6">{editingEvent._id ? "Edit Event" : "Create Event"}</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Event Name" className={inputClass} value={editingEvent.name || ""} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} />
                                <select className={`${inputClass} appearance-none`} value={editingEvent.theme} onChange={e => setEditingEvent({ ...editingEvent, theme: e.target.value })}>
                                    <option value="red">Red Theme</option>
                                    <option value="cyan">Cyan Theme</option>
                                </select>
                            </div>
                            <input placeholder="Tagline" className={inputClass} value={editingEvent.tagline || ""} onChange={e => setEditingEvent({ ...editingEvent, tagline: e.target.value })} />
                            <textarea placeholder="Description" className={`${inputClass} h-24`} value={editingEvent.description || ""} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Date (e.g. OCT 24-26)" className={inputClass} value={editingEvent.date || ""} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} />
                                <input placeholder="Location" className={inputClass} value={editingEvent.location || ""} onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setEditingEvent(null)} className="px-5 py-2.5 rounded-full border border-[var(--border)] text-[var(--fg-secondary)] text-sm font-medium hover:border-[var(--border-hover)] transition-colors">Cancel</button>
                                <button onClick={handleSaveEvent} className="px-6 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity">Save Event</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Competition Modal */}
            {editingComp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[var(--shadow-lg)]">
                        <h3 className="font-display text-xl font-bold text-[var(--fg)] mb-6">{editingComp._id ? "Edit Competition" : "Add Competition"}</h3>
                        <div className="space-y-4">
                            <input placeholder="Title" className={inputClass} value={editingComp.title || ""} onChange={e => setEditingComp({ ...editingComp, title: e.target.value })} />
                            <div className="grid grid-cols-3 gap-4">
                                <input placeholder="Type (e.g. Combat)" className={inputClass} value={editingComp.type || ""} onChange={e => setEditingComp({ ...editingComp, type: e.target.value })} />
                                <input type="number" placeholder="Min Members" className={inputClass} value={editingComp.minTeamSize || ""} onChange={e => setEditingComp({ ...editingComp, minTeamSize: parseInt(e.target.value) })} />
                                <input type="number" placeholder="Max Members" className={inputClass} value={editingComp.maxTeamSize || ""} onChange={e => setEditingComp({ ...editingComp, maxTeamSize: parseInt(e.target.value) })} />
                            </div>
                            <textarea placeholder="Description" className={`${inputClass} h-24`} value={editingComp.description || ""} onChange={e => setEditingComp({ ...editingComp, description: e.target.value })} />

                            <div className="border-t border-[var(--border)] pt-4">
                                <label className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                                    <ListChecks size={14} /> Rules
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input type="text" placeholder="Add a rule..." className={inputClass} value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())} />
                                    <button onClick={handleAddRule} className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)] transition-colors" type="button">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {editingComp.rules?.map((rule, idx) => (
                                        <div key={idx} className="flex justify-between items-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-2.5 text-sm text-[var(--fg-secondary)]">
                                            <span>{rule}</span>
                                            <button onClick={() => handleRemoveRule(idx)} className="text-[var(--fg-tertiary)] hover:text-red-500 p-1"><X size={14} /></button>
                                        </div>
                                    ))}
                                    {(!editingComp.rules || editingComp.rules.length === 0) && (
                                        <p className="text-xs text-[var(--fg-tertiary)]">No rules defined yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                                <button onClick={() => { setEditingComp(null); setNewRule("") }} className="px-5 py-2.5 rounded-full border border-[var(--border)] text-[var(--fg-secondary)] text-sm font-medium hover:border-[var(--border-hover)] transition-colors">Cancel</button>
                                <button onClick={handleSaveComp} className="px-6 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity">Save Competition</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="space-y-4">
                {events.map(event => (
                    <div key={event._id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
                        <div className="p-5 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                            <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedEvent(expandedEvent === event._id ? null : event._id)}>
                                {expandedEvent === event._id ? <ChevronUp className="w-4 h-4 text-[var(--fg-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--fg-tertiary)]" />}
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-[var(--fg)]">{event.name}</h3>
                                    <div className="flex gap-4 text-xs text-[var(--fg-tertiary)] mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {event.date}</span>
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setEditingEvent(event)} className="p-2 rounded-lg text-[var(--fg-tertiary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteEvent(event._id)} className="p-2 rounded-lg text-[var(--fg-tertiary)] hover:text-red-500 hover:bg-[var(--bg)] transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedEvent === event._id && (
                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-[var(--border)]">
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium">Competitions</h4>
                                            <button onClick={() => setEditingComp({ eventId: event._id, minTeamSize: 1, maxTeamSize: 4, rules: [] })} className="text-xs flex items-center gap-1 text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors">
                                                <Plus size={14} /> Add Competition
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {event.competitions?.map((comp: Competition) => (
                                                <div key={comp._id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border-hover)] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center"><Trophy size={14} className="text-[var(--fg-tertiary)]" /></div>
                                                        <div>
                                                            <p className="font-medium text-[var(--fg)] text-sm">{comp.title}</p>
                                                            <p className="text-xs text-[var(--fg-tertiary)]">{comp.type} · {comp.minTeamSize}-{comp.maxTeamSize} members · {comp.rules?.length || 0} rules</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setEditingComp(comp)} className="p-2 rounded-lg text-[var(--fg-tertiary)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] transition-colors"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDeleteComp(comp._id!)} className="p-2 rounded-lg text-[var(--fg-tertiary)] hover:text-red-500 hover:bg-[var(--bg-secondary)] transition-colors"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!event.competitions || event.competitions.length === 0) && (
                                                <div className="text-center py-4 text-[var(--fg-tertiary)] text-sm">No competitions added yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}
