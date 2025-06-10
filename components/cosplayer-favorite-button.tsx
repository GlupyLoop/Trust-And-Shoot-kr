"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { addFavoriteCosplayer, removeFavoriteCosplayer, isFavoriteCosplayer } from "@/lib/firebase"
import { toast } from "sonner"

type FavoriteButtonProps = {
  cosplayerId: string
  className?: string
}

export default function CosplayerFavoriteButton({ cosplayerId, className = "" }: FavoriteButtonProps) {
  const { user, userData } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!user || userData?.role !== "photographer") {
        setIsLoading(false)
        return
      }

      try {
        const result = await isFavoriteCosplayer(user.uid, cosplayerId)
        setIsFavorite(result)
      } catch (error) {
        console.error("Error checking if cosplayer is favorite:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkIfFavorite()
  }, [user, userData, cosplayerId])

  const toggleFavorite = async () => {
    if (!user || userData?.role !== "photographer") {
      toast.error("You must be logged in as a photographer to add favorites")
      return
    }

    try {
      setIsLoading(true)
      if (isFavorite) {
        await removeFavoriteCosplayer(user.uid, cosplayerId)
        toast.success("Removed from favorites")
      } else {
        await addFavoriteCosplayer(user.uid, cosplayerId)
        toast.success("Added to favorites")
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorites")
    } finally {
      setIsLoading(false)
    }
  }

  // Only show the button for photographers
  if (!user || userData?.role !== "photographer") {
    return null
  }

  return (
    <motion.button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
        isFavorite ? "bg-red-500 text-white hover:bg-red-600" : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Heart size={16} fill={isFavorite ? "white" : "none"} />
      <span className="text-sm font-medium">{isFavorite ? "Favorited" : "Add to Favorites"}</span>
    </motion.button>
  )
}
