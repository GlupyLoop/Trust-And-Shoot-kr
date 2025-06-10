"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { MessageSquare, Camera, User } from "lucide-react"
import { listenToUserConversations, getUserInfo, markMessagesAsRead } from "@/lib/messaging"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Conversation } from "@/lib/messaging"
import type { UserData } from "@/lib/firebase"

export default function RecentMessages() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationUsers, setConversationUsers] = useState<Record<string, UserData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const unsubscribe = listenToUserConversations(user.uid, async (updatedConversations) => {
      // Trier par date de dernier message
      const sortedConversations = [...updatedConversations].sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0
        const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0
        return dateB - dateA
      })

      setConversations(sortedConversations)
      setLoading(false)

      // Charger les informations des utilisateurs pour chaque conversation
      for (const conv of sortedConversations) {
        const otherUserId = conv.participants.find((id) => id !== user.uid)
        if (otherUserId && !conversationUsers[otherUserId]) {
          try {
            const userData = await getUserInfo(otherUserId)
            if (userData) {
              setConversationUsers((prev) => ({
                ...prev,
                [otherUserId]: userData,
              }))
            }
          } catch (error) {
            console.error("Error loading user data:", error)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [user, conversationUsers])

  // Obtenir l'autre utilisateur dans la conversation
  const getOtherUser = (conversation: Conversation): UserData | undefined => {
    if (!user) return undefined

    const otherUserId = conversation.participants.find((id) => id !== user.uid)
    return otherUserId ? conversationUsers[otherUserId] : undefined
  }

  // Formater la date du dernier message
  const formatMessageDate = (date: Date | undefined) => {
    if (!date) return ""

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr,
    })
  }

  // Modifier la fonction handleViewConversation pour gérer les erreurs plus gracieusement
  const handleViewConversation = async (conversationId: string) => {
    // Marquer les messages comme lus lorsque l'utilisateur clique pour voir la conversation
    if (user) {
      try {
        await markMessagesAsRead(conversationId, user.uid)
      } catch (error) {
        console.error("Error marking messages as read:", error)
        // Continue despite error - don't block navigation
      }
    }

    // Stocker l'ID de conversation dans localStorage pour l'ouvrir automatiquement
    localStorage.setItem("openConversationId", conversationId)

    // Rediriger vers la page de messagerie
    router.push("/messages")
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 bg-[#2a2a2a] rounded-md animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3a3a3a]"></div>
              <div className="flex-1">
                <div className="h-4 bg-[#3a3a3a] rounded w-24 mb-2"></div>
                <div className="h-3 bg-[#3a3a3a] rounded w-40"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-6 text-gray-400">
        <MessageSquare className="mx-auto mb-2 text-[#ff7145]" size={24} />
        <p>Aucun message récent</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {conversations.slice(0, 3).map((conversation) => {
        const otherUser = getOtherUser(conversation)
        const unreadCount = conversation.unreadCount?.[user?.uid || ""] || 0

        return (
          <motion.div
            key={conversation.id}
            className="p-3 bg-[#2a2a2a] rounded-md cursor-pointer"
            whileHover={{ scale: 1.02, x: 5 }}
            onClick={() => handleViewConversation(conversation.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#3a3a3a] flex items-center justify-center">
                {otherUser?.photoURL ? (
                  <Image
                    src={otherUser.photoURL || "/placeholder.svg"}
                    alt={otherUser.displayName || "User"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : otherUser?.role === "photographer" ? (
                  <Camera size={18} />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{otherUser?.displayName || "Utilisateur"}</h3>
                  <span className="text-xs text-[#ff7145]">
                    {formatMessageDate(conversation.lastMessage?.timestamp as Date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-400 truncate">
                    {conversation.lastMessage?.text || "Nouvelle conversation"}
                  </p>
                  {unreadCount > 0 && (
                    <span className="bg-[#ff7145] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}

      <motion.button
        className="mt-4 border border-[#ff7145] text-[#ff7145] py-2 px-4 rounded-md font-medium hover:bg-[#ff7145]/10 transition-colors w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push("/messages")}
      >
        Voir tous les messages
      </motion.button>
    </div>
  )
}
