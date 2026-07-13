"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus, X, Save, Layout, Cpu,
  Users, FileText, Link as LinkIcon,
  Github, ExternalLink, Image as ImageIcon,
  Eye, EyeOff, AlertCircle, Loader2
} from "lucide-react"
import ReactMarkdown from "react-markdown"

const inputClass = "w-full rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg)] focus:outline-none transition-colors text-sm"

export function ProjectForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState("basic")
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    shortDescription: initialData?.shortDescription || "",
    category: initialData?.category || "Innovation",
    image: initialData?.image || "",
    featured: initialData?.featured || false,
    published: initialData?.published || false,
    hardwareUsed: initialData?.hardwareUsed || [],
    softwareUsed: initialData?.softwareUsed || [],
    techStack: initialData?.techStack || [],
    contributors: initialData?.contributors || [],
    mentors: initialData?.mentors || [],
    content: initialData?.content || "",
    achievements: initialData?.achievements || [],
    links: initialData?.links || { github: "", documentation: "", demo: "" },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name.startsWith('links.')) {
      const linkField = name.split('.')[1]
      setFormData(prev => ({ ...prev, links: { ...prev.links, [linkField]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }
  }

  const addArrayItem = (field: string, item: string) => {
    if (!item.trim()) return
    setFormData((prev: any) => ({ ...prev, [field]: [...prev[field], item] }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => ({ ...prev, [field]: prev[field].filter((_: any, i: number) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const url = initialData ? `/api/projects/${initialData._id}` : "/api/projects"
      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save project.")
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sections = [
    { id: "basic", label: "Basic Info", icon: Layout },
    { id: "details", label: "Tech Stack", icon: Cpu },
    { id: "team", label: "Team", icon: Users },
    { id: "links", label: "Links", icon: LinkIcon },
    { id: "content", label: "Content", icon: FileText },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map((sec) => {
          const Icon = sec.icon
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeSection === sec.id
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "bg-[var(--bg-secondary)] text-[var(--fg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]"
              }`}
            >
              <Icon size={16} /> {sec.label}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 min-h-[400px]">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        {activeSection === "basic" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Project Title</label>
                <input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Autonomous Drone" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className={`${inputClass} appearance-none`}>
                  <option value="Innovation">Innovation</option>
                  <option value="Competition">Competition</option>
                  <option value="Research">Research</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Short Description</label>
              <input name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} placeholder="One liner for cards..." required className={inputClass} />
            </div>

            <div>
              <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Full Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Detailed summary..." className={`${inputClass} min-h-[120px]`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-2">Cover Image URL</label>
                <input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." className={inputClass} />
                <div className="flex gap-6 mt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.published ? "bg-emerald-500 border-emerald-500" : "border-[var(--border)]"}`}>
                      {formData.published && <span className="text-white font-bold text-xs">✓</span>}
                    </div>
                    <input type="checkbox" name="published" checked={formData.published} onChange={handleInputChange} className="hidden" />
                    <span className="text-sm text-[var(--fg-secondary)]">Published</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.featured ? "bg-amber-500 border-amber-500" : "border-[var(--border)]"}`}>
                      {formData.featured && <span className="text-white font-bold text-xs">✓</span>}
                    </div>
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="hidden" />
                    <span className="text-sm text-[var(--fg-secondary)]">Featured</span>
                  </label>
                </div>
              </div>

              <div className="aspect-video rounded-xl bg-[var(--bg)] border border-[var(--border)] overflow-hidden flex items-center justify-center">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-[var(--fg-tertiary)]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "details" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {[
              { key: "techStack", label: "Core Technologies" },
              { key: "hardwareUsed", label: "Hardware" },
              { key: "softwareUsed", label: "Software" }
            ].map((section) => (
              <div key={section.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
                <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-4">{section.label}</label>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(formData as any)[section.key].map((item: string, i: number) => (
                    <span key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] text-xs border border-[var(--border)]">
                      {item}
                      <button type="button" onClick={() => removeArrayItem(section.key, i)} className="hover:text-[var(--fg)] transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type and press Enter..."
                    className={inputClass}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem(section.key, (e.target as any).value);
                        (e.target as any).value = ""
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === "team" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <h4 className="font-display text-base font-semibold text-[var(--fg)] mb-4 flex items-center gap-2"><Users size={18} className="text-[var(--fg-tertiary)]" /> Contributors</h4>
              <div className="space-y-3 mb-4">
                {formData.contributors.map((c: any, i: any) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Name" value={c.name} className={inputClass}
                      onChange={(e) => { const items = [...formData.contributors]; (items[i] as any).name = e.target.value; setFormData({ ...formData, contributors: items }) }} />
                    <input placeholder="Role" value={c.role} className={inputClass}
                      onChange={(e) => { const items = [...formData.contributors]; (items[i] as any).role = e.target.value; setFormData({ ...formData, contributors: items }) }} />
                    <button type="button" onClick={() => removeArrayItem("contributors", i)} className="p-2 text-[var(--fg-tertiary)] hover:text-red-500"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setFormData({ ...formData, contributors: [...formData.contributors, { name: "", role: "" }] })} className="text-sm px-4 py-2 rounded-full border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)] flex items-center gap-2 transition-colors">
                <Plus size={14} /> Add Member
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <h4 className="font-display text-base font-semibold text-[var(--fg)] mb-4 flex items-center gap-2"><Users size={18} className="text-amber-500" /> Mentors</h4>
              <div className="space-y-3 mb-4">
                {formData.mentors.map((c: any, i: any) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Name" value={c.name} className={inputClass}
                      onChange={(e) => { const items = [...formData.mentors]; (items[i] as any).name = e.target.value; setFormData({ ...formData, mentors: items }) }} />
                    <input placeholder="Role" value={c.role} className={inputClass}
                      onChange={(e) => { const items = [...formData.mentors]; (items[i] as any).role = e.target.value; setFormData({ ...formData, mentors: items }) }} />
                    <button type="button" onClick={() => removeArrayItem("mentors", i)} className="p-2 text-[var(--fg-tertiary)] hover:text-red-500"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setFormData({ ...formData, mentors: [...formData.mentors, { name: "", role: "" }] })} className="text-sm px-4 py-2 rounded-full border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)] flex items-center gap-2 transition-colors">
                <Plus size={14} /> Add Mentor
              </button>
            </div>
          </motion.div>
        )}

        {activeSection === "links" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-5">
              {[
                { name: "links.github", icon: Github, label: "GitHub Repository", placeholder: "https://github.com/...", value: formData.links.github },
                { name: "links.demo", icon: ExternalLink, label: "Live Demo", placeholder: "https://...", value: formData.links.demo },
                { name: "links.documentation", icon: FileText, label: "Documentation", placeholder: "https://docs...", value: formData.links.documentation },
              ].map((link) => (
                <div key={link.name} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--fg-tertiary)]"><link.icon size={18} /></div>
                  <div className="flex-1">
                    <label className="block text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium mb-1">{link.label}</label>
                    <input name={link.name} value={link.value} onChange={handleInputChange} placeholder={link.placeholder} className={inputClass} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === "content" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[var(--fg-tertiary)] uppercase tracking-wider font-medium">Documentation (Markdown)</label>
              <button type="button" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)] transition-colors">
                {showPreview ? <><EyeOff size={14} /> Edit</> : <><Eye size={14} /> Preview</>}
              </button>
            </div>

            {showPreview ? (
              <div className="w-full p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] min-h-[400px] prose prose-neutral dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown>{formData.content || "*No content entered yet...*"}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="# Introduction&#10;&#10;Describe the project..."
                className={`${inputClass} min-h-[400px] font-mono`}
              />
            )}
          </motion.div>
        )}

        <div className="sticky bottom-0 bg-[var(--bg)]/90 backdrop-blur-xl border-t border-[var(--border)] py-4 -mx-6 px-6 mt-8">
          <div className="max-w-5xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={() => window.history.back()} className="px-6 py-3 rounded-full border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)] text-sm font-medium transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save size={16} /> Save Project</>}
            </button>
          </div>
        </div>

        <div className="h-4" />
      </form>
    </div>
  )
}
