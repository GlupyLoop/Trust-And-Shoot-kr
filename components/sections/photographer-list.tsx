"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import AnimatedSection from "../ui/animated-section"
import PhotographerCard from "../photographer-card"
import type { PhotographerData } from "@/lib/firebase"

type PhotographerListProps = {
  photographers: PhotographerData[]
}

export default function PhotographerList({ photographers }: PhotographerListProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const photographersPerPage = 6

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    const maxPage = Math.ceil(photographers.length / photographersPerPage) - 1
    setCurrentPage((prev) => Math.min(maxPage, prev + 1))
  }

  // Calculate pagination
  const totalPages = Math.ceil(photographers.length / photographersPerPage)
  const startIndex = currentPage * photographersPerPage
  const displayedPhotographers = photographers.slice(startIndex, startIndex + photographersPerPage)

  if (photographers.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-lg text-center">
        <p>No photographers found matching your criteria. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPhotographers.map((photographer) => (
          <AnimatedSection key={photographer.uid} delay={0.1} direction="up">
            <PhotographerCard photographer={photographer} />
          </AnimatedSection>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <AnimatedSection delay={0.3} direction="up" className="flex justify-center items-center mt-8 gap-2">
          <motion.button
            className="p-2 hover:text-[#ff7145] transition-colors disabled:opacity-50 disabled:hover:text-inherit"
            onClick={handlePrevPage}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {[...Array(totalPages)].map((_, i) => (
            <motion.button
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                i === currentPage ? "bg-[#ff7145] text-white" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage(i)}
            >
              {i + 1}
            </motion.button>
          ))}

          <motion.button
            className="p-2 hover:text-[#ff7145] transition-colors disabled:opacity-50 disabled:hover:text-inherit"
            onClick={handleNextPage}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </AnimatedSection>
      )}
    </div>
  )
}
