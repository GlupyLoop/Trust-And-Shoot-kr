"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

type ImageDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (details: { title: string; description: string; photographer?: string }) => void
  initialData?: {
    title?: string
    description?: string
    photographer?: string
  }
  showPhotographerField?: boolean
}

export default function ImageDetailsModal({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  showPhotographerField = false,
}: ImageDetailsModalProps) {
  const [title, setTitle] = useState(initialData.title || "")
  const [description, setDescription] = useState(initialData.description || "")
  const [photographer, setPhotographer] = useState(initialData.photographer || "")

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTitle(initialData.title || "")
      setDescription(initialData.description || "")
      setPhotographer(initialData.photographer || "")

      // Prevent body scrolling
      document.body.style.overflow = "hidden"
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      ...(showPhotographerField && { photographer }),
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1a1a1a] rounded-lg w-full max-w-md p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Image Details</h3>
              <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="Enter a title for your image"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145] min-h-[100px]"
                  placeholder="Add a description"
                />
              </div>

              {showPhotographerField && (
                <div>
                  <label htmlFor="photographer" className="block text-sm font-medium mb-1">
                    Photographer
                  </label>
                  <input
                    id="photographer"
                    type="text"
                    value={photographer}
                    onChange={(e) => setPhotographer(e.target.value)}
                    className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                    placeholder="Photographer name"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#3a3a3a] rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#2a2a2a" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-[#ff7145] text-white rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#ff8d69" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
