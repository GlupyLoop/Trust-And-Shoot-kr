"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import type { CosplayerData } from "@/lib/firebase"

type RatingSummaryCosplayerProps = {
  cosplayer: CosplayerData
}

export default function RatingSummaryCosplayer({ cosplayer }: RatingSummaryCosplayerProps) {
  // If there are no reviews yet, show a message
  if (!cosplayer.totalReviews || cosplayer.totalReviews === 0) {
    return (
      <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg">
        <p className="text-center text-gray-400">Aucun avis pour le moment</p>
      </div>
    )
  }

  // Calculate percentages for the rating bars
  const calculatePercentage = (count: number) => {
    return cosplayer.totalReviews ? Math.round((count / cosplayer.totalReviews) * 100) : 0
  }

  const ratingDistribution = cosplayer.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <div className="flex items-center mr-4">
          <span className="text-3xl font-bold text-[#fffbea]">{cosplayer.averageRating?.toFixed(1) || "0.0"}</span>
          <span className="text-lg text-gray-400 ml-1">/ 5</span>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={20}
              className={i < Math.floor(cosplayer.averageRating || 0) ? "text-[#ff7145]" : "text-gray-400"}
              fill={i < Math.floor(cosplayer.averageRating || 0) ? "#ff7145" : "none"}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-400">({cosplayer.totalReviews} avis)</span>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center">
            <div className="flex items-center w-12">
              <span className="text-sm text-gray-400">{rating}</span>
              <Star size={14} className="ml-1 text-gray-400" />
            </div>
            <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden mx-2">
              <motion.div
                className="h-full bg-[#ff7145]"
                initial={{ width: 0 }}
                animate={{ width: `${calculatePercentage(ratingDistribution[rating as 1 | 2 | 3 | 4 | 5])}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm text-gray-400 w-10 text-right">
              {calculatePercentage(ratingDistribution[rating as 1 | 2 | 3 | 4 | 5])}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
