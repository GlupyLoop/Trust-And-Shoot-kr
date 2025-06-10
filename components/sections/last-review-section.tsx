"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

// Modifier la fonction LastReviewSection pour adapter le style
export default function LastReviewSection() {
  return (
    <motion.div
      className="bg-[#2a2a2a] rounded-lg p-3"
      whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(255, 113, 69, 0.2)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <span className="font-bold">OkayLoop</span>
          <ChevronRight className="w-4 h-4" />
          <span>Photographer</span>
        </div>
        <motion.div
          className="w-6 h-6 rounded-full bg-[#3a3a3a] overflow-hidden ml-auto"
          whileHover={{ scale: 1.2, rotate: 10 }}
        >
          <Image src="/placeholder.svg?height=24&width=24" alt="User" width={24} height={24} />
        </motion.div>
      </div>
      <p className="text-sm">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt...
      </p>
      <div className="text-right text-xs text-[#ff7145]">20/02/23</div>
    </motion.div>
  )
}
