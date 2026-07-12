"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, Loader2, Copy, Check, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MediaItem {
  _id: string
  filename: string
  url: string
  cloudinaryId: string
  uploadedAt: Date
  size: number
}

interface MediaUploaderProps {
  onMediaUploaded?: (media: MediaItem) => void
}

export function MediaUploader({ onMediaUploaded }: MediaUploaderProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch("/api/media", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (err) {
      console.error("Failed to fetch media:", err)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setLoading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        const MAX_FILE_SIZE = 10 * 1024 * 1024
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`)
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        if (!validTypes.includes(file.type)) {
          throw new Error(`File type "${file.type}" not supported. Please use JPEG, PNG, GIF, WebP, or SVG.`)
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        })

        let responseData
        try {
          responseData = await response.json()
        } catch {
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        if (!response.ok) {
          throw new Error(responseData.error || `Upload failed with status ${response.status}`)
        }

        setMedia((prev) => [responseData, ...prev])
        onMediaUploaded?.(responseData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, { method: "DELETE", credentials: "include" })
      if (!response.ok) throw new Error("Delete failed")
      setMedia((prev) => prev.filter((m) => m._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 hover:border-[var(--border-hover)] transition-colors cursor-pointer bg-[var(--bg-secondary)]"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <Loader2 size={40} className="text-[var(--fg-tertiary)] animate-spin mb-3" />
          ) : (
            <Upload size={40} className="text-[var(--fg-tertiary)] mb-3" />
          )}
          <h3 className="text-lg font-semibold text-[var(--fg)] mb-1">{loading ? "Uploading..." : "Upload Images"}</h3>
          <p className="text-[var(--fg-tertiary)] text-sm">Click to select or drag and drop (PNG, JPG, WebP)</p>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      <div>
        <h3 className="font-display text-lg font-semibold text-[var(--fg)] mb-4">Uploaded Media ({media.length})</h3>

        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[var(--fg-tertiary)] animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12 text-[var(--fg-tertiary)]">
            <p>No images uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {media.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden hover:border-[var(--border-hover)] transition-all group"
                >
                  <div className="aspect-video bg-[var(--bg)] relative overflow-hidden">
                    <img src={item.url || "/placeholder.svg"} alt={item.filename} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => copyToClipboard(item.url, item._id)} className="p-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 transition-opacity" title="Copy URL">
                        {copiedId === item._id ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2.5 rounded-full bg-red-500 text-white hover:opacity-90 transition-opacity" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)] truncate">{item.filename}</p>
                      <p className="text-xs text-[var(--fg-tertiary)]">{formatDate(item.uploadedAt)} · {formatFileSize(item.size)}</p>
                    </div>

                    <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-2 flex gap-1">
                      <input type="text" readOnly value={item.url} className="flex-1 text-xs bg-transparent text-[var(--fg-secondary)] outline-none truncate" />
                      <button onClick={() => copyToClipboard(item.url, item._id)} className="text-[var(--fg-tertiary)] hover:text-[var(--fg)] transition-colors" title="Copy URL">
                        {copiedId === item._id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
