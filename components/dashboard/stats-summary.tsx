"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getTotalUnreadMessages } from "@/lib/messaging"

interface StatsSummaryProps {
  role: "photographer" | "cosplayer"
}

export default function StatsSummary({ role }: StatsSummaryProps) {
  const { user, userData } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const count = await getTotalUnreadMessages(user.uid)
        setUnreadMessages(count)
      } catch (error) {
        console.error("Error fetching unread messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Mettre à jour le compteur toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Valeurs par défaut pour les statistiques
  const rating = userData?.averageRating || 4.8
  const reviews = userData?.totalReviews || 24
  const completedShoots = 36 // Valeur fictive pour l'instant
  const profileViews = 128 // Valeur fictive pour l'instant

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded-md">
        <span>Rating</span>
        <span className="font-bold text-[#ff7145]">{rating.toFixed(1)}/5</span>
      </div>

      <div className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded-md">
        <span>Reviews</span>
        <span className="font-bold">{reviews}</span>
      </div>

      <div className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded-md">
        <span>Completed Shoots</span>
        <span className="font-bold">{completedShoots}</span>
      </div>

      <div className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded-md">
        <span>Unread Messages</span>
        <span className="font-bold text-[#ff7145]">{loading ? "..." : unreadMessages}</span>
      </div>

      <div className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded-md">
        <span>Profile Views</span>
        <span className="font-bold">{profileViews}</span>
      </div>
    </div>
  )
}
