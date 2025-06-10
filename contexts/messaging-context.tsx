"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import {
  listenToUserConversations,
  type Conversation,
  type Message,
  listenToConversationMessages,
  markMessagesAsRead,
  sendMessage as sendMessageApi,
  createConversation as createConversationApi,
  getUserInfo,
} from "@/lib/messaging"
import type { UserData } from "@/lib/firebase"

type MessagingContextType = {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  loadingConversations: boolean
  loadingMessages: boolean
  unreadCount: number
  setCurrentConversationId: (id: string | null) => void
  sendMessage: (text: string, imageUrl?: string) => Promise<void>
  markAsRead: () => Promise<void>
  createConversation: (otherUserId: string) => Promise<string>
  getUserData: (userId: string) => Promise<UserData | null>
  conversationUsers: Record<string, UserData>
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export const useMessaging = () => {
  const context = useContext(MessagingContext)
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider")
  }
  return context
}

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversationUsers, setConversationUsers] = useState<Record<string, UserData>>({})

  // Charger les conversations de l'utilisateur
  useEffect(() => {
    if (!user) {
      setConversations([])
      setLoadingConversations(false)
      return
    }

    setLoadingConversations(true)

    const unsubscribe = listenToUserConversations(user.uid, (updatedConversations) => {
      setConversations(updatedConversations)
      setLoadingConversations(false)

      // Calculer le nombre total de messages non lus
      let total = 0
      updatedConversations.forEach((conv) => {
        if (conv.unreadCount && conv.unreadCount[user.uid]) {
          total += conv.unreadCount[user.uid]
        }
      })
      setUnreadCount(total)

      // Mettre à jour la conversation actuelle si nécessaire
      if (currentConversationId) {
        const updated = updatedConversations.find((c) => c.id === currentConversationId)
        if (updated) {
          setCurrentConversation(updated)
        }
      }

      // Charger les informations des utilisateurs pour chaque conversation
      updatedConversations.forEach(async (conv) => {
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
      })
    })

    return () => unsubscribe()
  }, [user])

  // Charger les messages de la conversation actuelle
  useEffect(() => {
    if (!currentConversationId || !user) {
      setMessages([])
      setCurrentConversation(null)
      return
    }

    setLoadingMessages(true)

    // Trouver la conversation actuelle
    const conversation = conversations.find((c) => c.id === currentConversationId)
    setCurrentConversation(conversation || null)

    const unsubscribe = listenToConversationMessages(currentConversationId, (updatedMessages) => {
      setMessages(updatedMessages)
      setLoadingMessages(false)
    })

    // Marquer les messages comme lus lorsqu'on ouvre la conversation
    markMessagesAsRead(currentConversationId, user.uid).catch(console.error)

    return () => unsubscribe()
  }, [currentConversationId, user, conversations])

  // Fonction pour envoyer un message
  const sendMessageToConversation = async (text: string, imageUrl?: string) => {
    if (!user || !currentConversationId) return

    try {
      await sendMessageApi(currentConversationId, user.uid, text, imageUrl)
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  // Fonction pour marquer les messages comme lus
  const markAsRead = async () => {
    if (!user || !currentConversationId) return

    try {
      await markMessagesAsRead(currentConversationId, user.uid)
    } catch (error) {
      console.error("Error marking messages as read:", error)
      throw error
    }
  }

  // Fonction pour créer une nouvelle conversation
  const createConversation = async (otherUserId: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    try {
      return await createConversationApi(user.uid, otherUserId)
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
    }
  }

  // Fonction pour obtenir les données d'un utilisateur
  const getUserData = async (userId: string): Promise<UserData | null> => {
    if (conversationUsers[userId]) {
      return conversationUsers[userId]
    }

    try {
      const userData = await getUserInfo(userId)
      if (userData) {
        setConversationUsers((prev) => ({
          ...prev,
          [userId]: userData,
        }))
      }
      return userData
    } catch (error) {
      console.error("Error getting user data:", error)
      return null
    }
  }

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loadingConversations,
        loadingMessages,
        unreadCount,
        setCurrentConversationId,
        sendMessage: sendMessageToConversation,
        markAsRead,
        createConversation,
        getUserData,
        conversationUsers,
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}
