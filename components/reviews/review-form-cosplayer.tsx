"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { addReview } from "@/lib/firebase"
import { toast } from "sonner"

type ReviewFormCosplayerProps = {
  cosplayerId: string
  onReviewSubmitted: () => void
}

export default function ReviewFormCosplayer({ cosplayerId, onReviewSubmitted }: ReviewFormCosplayerProps) {
  const { user, userData } = useAuth()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [experienceDate, setExperienceDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Vous devez être connecté pour laisser un avis")
      return
    }

    if (userData?.role !== "photographer") {
      toast.error("Seuls les photographes peuvent laisser un avis sur les cosplayers")
      return
    }

    if (rating === 0) {
      toast.error("Veuillez attribuer une note")
      return
    }

    if (!title.trim()) {
      toast.error("Veuillez ajouter un titre à votre avis")
      return
    }

    if (!comment.trim()) {
      toast.error("Veuillez ajouter un commentaire")
      return
    }

    try {
      setIsSubmitting(true)

      // Ensure we have the correct user information
      const userName = userData?.displayName || user.displayName || "Utilisateur anonyme"
      const userPhotoURL = userData?.photoURL || user.photoURL || null
      const userRole = userData?.role

      // Prepare the review data
      const reviewData = {
        userId: user.uid,
        userName: userName,
        userPhotoURL: userPhotoURL,
        userRole: userRole,
        targetId: cosplayerId,
        targetType: "cosplayer" as const,
        rating,
        title,
        comment,
        date: new Date(),
      }

      // Add experience date if it exists
      if (experienceDate && experienceDate.trim() !== "") {
        reviewData.experienceDate = experienceDate
      }

      await addReview(reviewData)

      // Reset the form
      setRating(0)
      setTitle("")
      setComment("")
      setExperienceDate("")

      toast.success("Votre avis a été publié avec succès")
      onReviewSubmitted()
    } catch (error) {
      console.error("Erreur lors de la soumission de l'avis:", error)
      toast.error("Une erreur s'est produite lors de la publication de votre avis")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Original Review Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#fffbea] mb-1">Votre note</label>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoveredStar(i + 1)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={
                        (hoveredStar !== null && i < hoveredStar) || (hoveredStar === null && i < rating)
                          ? "text-[#ff7145]"
                          : "text-gray-400"
                      }
                      fill={
                        (hoveredStar !== null && i < hoveredStar) || (hoveredStar === null && i < rating)
                          ? "#ff7145"
                          : "none"
                      }
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="reviewTitle" className="block text-sm font-medium text-[#fffbea] mb-1">
                Titre de l'avis
              </label>
              <input
                type="text"
                id="reviewTitle"
                className="w-full p-3 border border-[#3a3a3a] bg-[#2a2a2a] text-[#fffbea] rounded-lg focus:ring-2 focus:ring-[#ff7145] focus:border-transparent"
                placeholder="Résumez votre expérience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="experienceDate" className="block text-sm font-medium text-[#fffbea] mb-1">
                Date de l'expérience
              </label>
              <input
                type="month"
                id="experienceDate"
                className="w-full p-3 border border-[#3a3a3a] bg-[#2a2a2a] text-[#fffbea] rounded-lg focus:ring-2 focus:ring-[#ff7145] focus:border-transparent [color-scheme:dark]"
                value={experienceDate}
                onChange={(e) => setExperienceDate(e.target.value)}
                max={new Date().toISOString().slice(0, 7)}
                placeholder="YYYY-MM"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium text-[#fffbea] mb-1">
              Votre avis
            </label>
            <textarea
              id="reviewText"
              className="w-full p-3 border border-[#3a3a3a] bg-[#2a2a2a] text-[#fffbea] rounded-lg focus:ring-2 focus:ring-[#ff7145] focus:border-transparent min-h-[180px]"
              placeholder="Qu'avez-vous aimé ou pas ? Comment s'est passée votre expérience avec ce cosplayer ?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            className="bg-[#ff7145] text-[#fffbea] py-3 px-8 rounded-lg font-medium disabled:opacity-50"
            whileHover={{ scale: 1.02, backgroundColor: "#ff8d69" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Publier l'avis"}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
