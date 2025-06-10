"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { listenToUserConversations, getUserInfo, markMessagesAsRead } from "@/lib/messaging"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Search, UserIcon, Loader } from "lucide-react"
import Image from "next/image"
import type { Conversation } from "@/lib/messaging"
import type { UserData } from "@/lib/firebase"

interface ConversationListProps {
  onSelectConversation: (id: string) => void
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationUsers, setConversationUsers] = useState<Record<string, UserData>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modifier la fonction onSelectConversation pour gérer les erreurs plus gracieusement
  const handleSelectConversation = async (conversationId: string) => {
    // Marquer les messages comme lus lorsque l'utilisateur sélectionne une conversation
    if (user) {
      try {
        await markMessagesAsRead(conversationId, user.uid)
      } catch (error) {
        console.error("Error marking messages as read:", error)
        // Continue despite error - don't block conversation selection
      }
    }

    // Appeler la fonction de callback pour sélectionner la conversation
    onSelectConversation(conversationId)
  }

  useEffect(() => {
    if (!user) return

    const unsubscribe = listenToUserConversations(user.uid, async (updatedConversations) => {
      setConversations(updatedConversations)
      setLoading(false)

      // Charger les informations des utilisateurs pour chaque conversation
      for (const conv of updatedConversations) {
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

  // Filtrer les conversations par recherche
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true

    const otherUserId = conversation.participants.find((id) => id !== user?.uid)
    if (!otherUserId) return false

    const otherUser = conversationUsers[otherUserId]
    if (!otherUser) return false

    return otherUser.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  })

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

  return (
    <div className="bg-[#1a1a1a] h-full">
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full bg-[#2a2a2a] rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-73px)]">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <Loader className="animate-spin text-[#ff7145]" size={24} />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-gray-400">
            {searchQuery ? "Aucune conversation trouvée" : "Aucune conversation"}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation)
            const unreadCount = conversation.unreadCount?.[user?.uid || ""] || 0

            return (
              <div
                key={conversation.id}
                className="p-4 border-b border-[#2a2a2a] cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                    {otherUser?.photoURL ? (
                      <Image
                        src={otherUser.photoURL || "/placeholder.svg"}
                        alt={otherUser.displayName || "User"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon size={24} className="text-[#ff7145]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{otherUser?.displayName || "Utilisateur"}</h3>
                      <span className="text-xs text-gray-400">
                        {formatMessageDate(conversation.lastMessage?.timestamp as Date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
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
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ConversationList
