"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Plus, Trash2, Loader2, ChevronDown, ChevronUp, CheckCircle } from "lucide-react"

interface SectionConfig {
  id: string
  label: string
  fields: FieldConfig[]
}

interface FieldConfig {
  key: string
  label: string
  type: "text" | "textarea" | "array"
  arrayFields?: { key: string; label: string; type: "text" | "textarea" }[]
}

const sections: SectionConfig[] = [
  {
    id: "hero",
    label: "Hero Section",
    fields: [
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "heading", label: "Heading Line 1", type: "text" },
      { key: "headingLine2", label: "Heading Line 2", type: "text" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
    ],
  },
  {
    id: "who-are-we",
    label: "Who Are We",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "headingHighlight", label: "Heading Highlight", type: "text" },
      { key: "paragraph1", label: "Paragraph 1", type: "textarea" },
      { key: "paragraph2", label: "Paragraph 2", type: "textarea" },
      {
        key: "stats",
        label: "Stats",
        type: "array",
        arrayFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
      {
        key: "competencies",
        label: "Core Competencies",
        type: "array",
        arrayFields: [
          { key: "label", label: "Label", type: "text" },
          { key: "icon", label: "Icon (Target/Globe/Cpu/PenTool/Code/Zap)", type: "text" },
        ],
      },
    ],
  },
  {
    id: "purpose",
    label: "Our Purpose",
    fields: [
      {
        key: "items",
        label: "Purpose Cards",
        type: "array",
        arrayFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "icon", label: "Icon (Users/Lightbulb/Rocket/Zap)", type: "text" },
        ],
      },
    ],
  },
  {
    id: "tech-stack",
    label: "Tech Stack",
    fields: [
      {
        key: "items",
        label: "Technologies",
        type: "array",
        arrayFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "icon", label: "Icon (emoji)", type: "text" },
          { key: "description", label: "Description", type: "text" },
          { key: "size", label: "Size (small/medium/large)", type: "text" },
        ],
      },
    ],
  },
  {
    id: "featured-projects",
    label: "Featured Projects",
    fields: [
      {
        key: "items",
        label: "Projects",
        type: "array",
        arrayFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "image", label: "Image URL", type: "text" },
          { key: "tech", label: "Tech (comma separated)", type: "text" },
        ],
      },
    ],
  },
  {
    id: "achievements",
    label: "Achievements",
    fields: [
      {
        key: "items",
        label: "Achievement Items",
        type: "array",
        arrayFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "source", label: "Source", type: "text" },
          { key: "date", label: "Date", type: "text" },
          { key: "category", label: "Category", type: "text" },
        ],
      },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    fields: [
      {
        key: "items",
        label: "Questions",
        type: "array",
        arrayFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "team-page",
    label: "Team Page",
    fields: [
      {
        key: "stats",
        label: "Stats",
        type: "array",
        arrayFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
      {
        key: "faculty",
        label: "Faculty Advisors",
        type: "array",
        arrayFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "dept", label: "Department", type: "text" },
        ],
      },
      {
        key: "coordinators",
        label: "Core Coordinators",
        type: "array",
        arrayFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "year", label: "Year", type: "text" },
          { key: "bio", label: "Bio", type: "textarea" },
        ],
      },
      {
        key: "leads",
        label: "Team Leads",
        type: "array",
        arrayFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "vertical", label: "Vertical", type: "text" },
        ],
      },
      {
        key: "verticals",
        label: "Verticals",
        type: "array",
        arrayFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "count", label: "Member Count", type: "text" },
          { key: "description", label: "Description", type: "text" },
        ],
      },
      {
        key: "members",
        label: "Members",
        type: "array",
        arrayFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "vertical", label: "Vertical", type: "text" },
          { key: "year", label: "Year", type: "text" },
        ],
      },
    ],
  },
]

export function ContentEditor() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [sectionData, setSectionData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllContent()
  }, [])

  const fetchAllContent = async () => {
    try {
      const res = await fetch("/api/site-content")
      if (res.ok) {
        const data = await res.json()
        const mapped: Record<string, any> = {}
        for (const section of data) {
          mapped[section.sectionId] = section.content
        }
        setSectionData(mapped)
      }
    } catch (err) {
      console.error("Failed to load content:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (sectionId: string) => {
    setSaving(sectionId)
    try {
      const content = sectionData[sectionId]
      const res = await fetch(`/api/site-content/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        setSaved(sectionId)
        setTimeout(() => setSaved(null), 2000)
      }
    } catch (err) {
      console.error("Save failed:", err)
    } finally {
      setSaving(null)
    }
  }

  const updateField = (sectionId: string, key: string, value: any) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [key]: value },
    }))
  }

  const updateArrayItem = (sectionId: string, key: string, index: number, field: string, value: any) => {
    setSectionData((prev) => {
      const arr = [...(prev[sectionId]?.[key] || [])]
      arr[index] = { ...arr[index], [field]: value }
      return { ...prev, [sectionId]: { ...prev[sectionId], [key]: arr } }
    })
  }

  const addArrayItem = (sectionId: string, key: string, fields: { key: string }[]) => {
    setSectionData((prev) => {
      const arr = [...(prev[sectionId]?.[key] || [])]
      const newItem: any = {}
      fields.forEach((f) => (newItem[f.key] = ""))
      arr.push(newItem)
      return { ...prev, [sectionId]: { ...prev[sectionId], [key]: arr } }
    })
  }

  const removeArrayItem = (sectionId: string, key: string, index: number) => {
    setSectionData((prev) => {
      const arr = [...(prev[sectionId]?.[key] || [])]
      arr.splice(index, 1)
      return { ...prev, [sectionId]: { ...prev[sectionId], [key]: arr } }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Site Content</h2>
        <p className="text-neutral-400">Edit all website sections. Changes appear immediately after saving.</p>
      </div>

      {sections.map((section) => {
        const isActive = activeSection === section.id
        const data = sectionData[section.id] || {}

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-neutral-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setActiveSection(isActive ? null : section.id)}
              className="w-full flex items-center justify-between px-6 py-4 bg-neutral-900 hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-white">{section.label}</span>
                {saved === section.id && (
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle size={14} /> Saved
                  </span>
                )}
              </div>
              {isActive ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
            </button>

            {isActive && (
              <div className="p-6 bg-neutral-950 space-y-6">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    {field.type === "text" && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">{field.label}</label>
                        <input
                          type="text"
                          value={data[field.key] || ""}
                          onChange={(e) => updateField(section.id, field.key, e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#00D4FF] transition-colors"
                        />
                      </div>
                    )}

                    {field.type === "textarea" && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">{field.label}</label>
                        <textarea
                          value={data[field.key] || ""}
                          onChange={(e) => updateField(section.id, field.key, e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#00D4FF] transition-colors resize-y"
                        />
                      </div>
                    )}

                    {field.type === "array" && field.arrayFields && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-neutral-300">{field.label}</label>
                          <button
                            onClick={() => addArrayItem(section.id, field.key, field.arrayFields!)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#00D4FF]/10 text-[#00D4FF] text-xs rounded-md hover:bg-[#00D4FF]/20 transition-colors"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(data[field.key] || []).map((item: any, idx: number) => (
                            <div key={idx} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg relative group">
                              <button
                                onClick={() => removeArrayItem(section.id, field.key, idx)}
                                className="absolute top-2 right-2 p-1 text-neutral-600 hover:text-[#E55B5B] transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                                {field.arrayFields!.map((af) => (
                                  <div key={af.key} className={af.type === "textarea" ? "md:col-span-2" : ""}>
                                    <label className="block text-xs text-neutral-500 mb-1">{af.label}</label>
                                    {af.type === "textarea" ? (
                                      <textarea
                                        value={
                                          af.key === "tech" && Array.isArray(item[af.key])
                                            ? item[af.key].join(", ")
                                            : item[af.key] || ""
                                        }
                                        onChange={(e) => {
                                          const val = af.key === "tech" ? e.target.value : e.target.value
                                          updateArrayItem(section.id, field.key, idx, af.key, val)
                                        }}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-[#00D4FF] resize-y"
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        value={
                                          af.key === "tech" && Array.isArray(item[af.key])
                                            ? item[af.key].join(", ")
                                            : item[af.key] || ""
                                        }
                                        onChange={(e) => {
                                          let val: any = e.target.value
                                          if (af.key === "tech") val = val.split(",").map((s: string) => s.trim()).filter(Boolean)
                                          if (af.key === "count") val = parseInt(val) || 0
                                          updateArrayItem(section.id, field.key, idx, af.key, val)
                                        }}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => handleSave(section.id)}
                    disabled={saving === section.id}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E55B5B] hover:bg-[#E55B5B]/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving === section.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving === section.id ? "Saving..." : "Save Section"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
