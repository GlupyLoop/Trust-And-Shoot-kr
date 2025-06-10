"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { listenToUserConversations } from "@/lib/messaging"

export default function MessageNotification() {
  const { user } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    // Utiliser listenToUserConversations pour mettre à jour en temps réel
    const unsubscribe = listenToUserConversations(user.uid, (conversations) => {
      // Calculer le nombre total de messages non lus
      let total = 0
      conversations.forEach((conv) => {
        if (conv.unreadCount && conv.unreadCount[user.uid]) {
          total += conv.unreadCount[user.uid]
        }
      })
      setUnreadCount(total)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleClick = () => {
    router.push("/messages")
  }

  if (loading || !user) return null

  return (
    <motion.button
      onClick={handleClick}
      className="relative p-2 rounded-full hover:bg-[#2a2a2a] transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageSquare size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#ff7145] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </motion.button>
  )
}
