"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Loader } from "lucide-react"
import { getCosplayerReviews, type Review } from "@/lib/firebase"
import ReviewItem from "./review-item"

type ReviewListCosplayerProps = {
  cosplayerId: string
  refreshTrigger?: number
}

export default function ReviewListCosplayer({ cosplayerId, refreshTrigger = 0 }: ReviewListCosplayerProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const fetchedReviews = await getCosplayerReviews(cosplayerId)
      setReviews(fetchedReviews)
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Impossible de charger les avis. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [cosplayerId, refreshTrigger])

  // Function called when a review is deleted
  const handleReviewDeleted = () => {
    fetchReviews()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin text-[#ff7145]" size={24} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-white p-4 rounded-lg">
        <p>{error}</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-lg text-center">
        <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} onReviewDeleted={handleReviewDeleted} />
      ))}

      {reviews.length >= 3 && (
        <div className="mt-6 text-center">
          <motion.button
            className="text-[#ff7145] font-medium flex items-center gap-1 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Voir tous les avis</span>
            <ChevronRight size={16} />
          </motion.button>
        </div>
      )}
    </div>
  )
}
