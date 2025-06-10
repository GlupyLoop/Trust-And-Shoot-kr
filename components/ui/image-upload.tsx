"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Upload, X, Plus } from "lucide-react"

type ImageUploadProps = {
  onImageSelect: (file: File) => void
  previewUrl?: string
  title?: string
  description?: string
  onRemove?: () => void
  className?: string
}

export default function ImageUpload({
  onImageSelect,
  previewUrl,
  title,
  description,
  onRemove,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      className={`relative aspect-square rounded-lg overflow-hidden ${className || ""}`}
      whileHover={{ scale: 1.02 }}
    >
      {previewUrl ? (
        <div className="relative w-full h-full">
          <Image src={previewUrl || "/placeholder.svg"} alt={title || "Image"} fill className="object-cover" />

          {/* Overlay with info */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
            {title && <div className="text-white text-sm font-medium truncate">{title}</div>}

            {description && <div className="text-white text-xs truncate">{description}</div>}

            {onRemove && (
              <motion.button
                className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                onClick={onRemove}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-[#2a2a2a] border-2 border-dashed ${
            isDragging ? "border-[#ff7145]" : "border-[#3a3a3a]"
          } p-4 cursor-pointer`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

          {isDragging ? (
            <Upload className="w-8 h-8 text-[#ff7145] mb-2" />
          ) : (
            <Plus className="w-8 h-8 text-[#ff7145] mb-2" />
          )}

          <p className="text-xs text-center text-gray-400">{isDragging ? "Drop image here" : "Click or drag image"}</p>
        </div>
      )}
    </motion.div>
  )
}
