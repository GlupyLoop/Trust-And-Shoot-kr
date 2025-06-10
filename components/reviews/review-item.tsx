"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, ThumbsUp, ThumbsDown, Trash2, AlertCircle } from "lucide-react"
import { updateReviewReaction, deleteReview, type Review } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import Link from "next/link"

type ReviewItemProps = {
  review: Review
  onReviewDeleted?: () => void
}

export default function ReviewItem({ review, onReviewDeleted }: ReviewItemProps) {
  const { user } = useAuth()
  const [likes, setLikes] = useState(review.likes || 0)
  const [dislikes, setDislikes] = useState(review.dislikes || 0)
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Vérifier si l'utilisateur connecté est l'auteur de l'avis
  const isAuthor = user && user.uid === review.userId

  // Améliorer la fonction formatDate pour gérer tous les cas possibles
  const formatDate = (date: Date | string | any) => {
    if (!date) return "Date inconnue"

    try {
      if (typeof date === "string") {
        return new Date(date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }

      if (date instanceof Date) {
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }

      // Pour les cas où date est un objet Timestamp de Firestore
      if (date && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }

      return "Date invalide"
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return "Date invalide"
    }
  }

  // Update the handleReaction function to work with the updated Review type
  const handleReaction = async (reaction: "like" | "dislike") => {
    if (!user) {
      toast.error("Vous devez être connecté pour réagir à un avis")
      return
    }

    try {
      // If the user has already reacted the same way, cancel their reaction
      if (userReaction === reaction) {
        await updateReviewReaction(review.id, reaction, false)
        if (reaction === "like") {
          setLikes((prev) => prev - 1)
        } else {
          setDislikes((prev) => prev - 1)
        }
        setUserReaction(null)
      }
      // If the user changes their reaction
      else if (userReaction !== null) {
        // Cancel the old reaction
        await updateReviewReaction(review.id, userReaction, false)
        if (userReaction === "like") {
          setLikes((prev) => prev - 1)
        } else {
          setDislikes((prev) => prev - 1)
        }

        // Add the new reaction
        await updateReviewReaction(review.id, reaction, true)
        if (reaction === "like") {
          setLikes((prev) => prev + 1)
        } else {
          setDislikes((prev) => prev + 1)
        }
        setUserReaction(reaction)
      }
      // If the user hasn't reacted yet
      else {
        await updateReviewReaction(review.id, reaction, true)
        if (reaction === "like") {
          setLikes((prev) => prev + 1)
        } else {
          setDislikes((prev) => prev + 1)
        }
        setUserReaction(reaction)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réaction:", error)
      toast.error("Une erreur s'est produite")
    }
  }

  // Fonction pour supprimer l'avis
  const handleDeleteReview = async () => {
    if (!isAuthor) {
      toast.error("Vous ne pouvez pas supprimer cet avis")
      return
    }

    try {
      setIsDeleting(true)
      await deleteReview(review.id)
      toast.success("Votre avis a été supprimé avec succès")

      // Appeler la fonction de callback si elle existe
      if (onReviewDeleted) {
        onReviewDeleted()
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'avis:", error)
      toast.error("Une erreur s'est produite lors de la suppression de l'avis")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Update the getUserProfileLink function to handle both photographer and cosplayer reviews
  const getUserProfileLink = () => {
    if (!review.userId) return "#"

    // If we have the user role information
    if (review.userRole) {
      if (review.userRole === "photographer") {
        return `/photographer/${review.userId}`
      } else if (review.userRole === "cosplayer") {
        return `/cosplayer/${review.userId}`
      }
    }

    // Default to a generic user link
    return `/user/${review.userId}`
  }

  return (
    <motion.div className="border-b border-[#2a2a2a] pb-6 last:border-0 last:pb-0" whileHover={{ x: 5 }}>
      <div className="flex gap-4">
        <Link href={getUserProfileLink()} className="block">
          <motion.div
            className="w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] flex-shrink-0"
            whileHover={{ scale: 1.1, boxShadow: "0 0 8px rgba(255, 113, 69, 0.6)" }}
          >
            <Image
              src={review.userPhotoURL || "/placeholder.svg?height=40&width=40"}
              alt={review.userName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <Link href={getUserProfileLink()} className="hover:text-[#ff7145] transition-colors">
              <h3 className="font-bold text-[#fffbea]">{review.userName}</h3>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#ff7145] font-medium">{formatDate(review.date)}</span>

              {/* Bouton de suppression (visible uniquement pour l'auteur) */}
              {isAuthor && (
                <div className="relative">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                  </motion.button>

                  {/* Confirmation de suppression */}
                  {showDeleteConfirm && (
                    <div className="absolute right-0 top-6 z-10 bg-[#1a1a1a] border border-[#3a3a3a] rounded-md shadow-lg p-3 w-48">
                      <p className="text-xs mb-2 flex items-center gap-1">
                        <AlertCircle size={12} className="text-red-500" />
                        Supprimer cet avis ?
                      </p>
                      <div className="flex justify-between gap-2">
                        <motion.button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="text-xs px-2 py-1 bg-[#2a2a2a] rounded"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Annuler
                        </motion.button>
                        <motion.button
                          onClick={handleDeleteReview}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "..." : "Confirmer"}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < review.rating ? "text-[#ff7145]" : "text-gray-400"}
                fill={i < review.rating ? "#ff7145" : "none"}
              />
            ))}
            {review.experienceDate && (
              <span className="text-xs text-gray-400 ml-2">Expérience: {review.experienceDate}</span>
            )}
          </div>

          <h4 className="font-medium text-[#fffbea] mt-2">{review.title}</h4>
          <p className="text-gray-300 mt-1 text-sm">{review.comment}</p>

          <div className="flex items-center gap-4 mt-3">
            <motion.button
              className={`flex items-center gap-1 text-sm ${
                userReaction === "like" ? "text-green-500" : "text-gray-400"
              }`}
              whileHover={{ scale: 1.05, color: "#22c55e" }}
              onClick={() => handleReaction("like")}
            >
              <ThumbsUp size={14} />
              <span>{likes}</span>
            </motion.button>
            <motion.button
              className={`flex items-center gap-1 text-sm ${
                userReaction === "dislike" ? "text-red-500" : "text-gray-400"
              }`}
              whileHover={{ scale: 1.05, color: "#ef4444" }}
              onClick={() => handleReaction("dislike")}
            >
              <ThumbsDown size={14} />
              <span>{dislikes}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
