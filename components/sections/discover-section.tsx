"use client"

import Image from "next/image"
import AnimatedSection from "../ui/animated-section"
import { motion } from "framer-motion"

// Modifier la fonction DiscoverSection pour adapter le style
export default function DiscoverSection() {
  const categories = ["Portrait", "Landscape", "Wedding"]

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((category, i) => (
          <AnimatedSection key={category} delay={0.3 + i * 0.1} direction="up">
            <motion.button
              className="bg-[#ff7145] text-white rounded-full px-4 py-1 text-sm"
              whileHover={{ scale: 1.05, backgroundColor: "#ff8d69" }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          </AnimatedSection>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <AnimatedSection key={i} delay={0.5 + i * 0.1} direction="up">
            <motion.div
              className="bg-[#2a2a2a] aspect-video rounded-md overflow-hidden"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Image
                src={`/placeholder.svg?height=120&width=160&text=Image${i + 1}`}
                alt={`Discover ${i + 1}`}
                width={160}
                height={120}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  )
}
