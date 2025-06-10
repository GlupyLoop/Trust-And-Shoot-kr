"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { listenToConversationMessages, markMessagesAsRead } from "@/lib/messaging"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { UserIcon, Check, Loader, X } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { Message } from "@/lib/messaging"
import type { UserData } from "@/lib/firebase"

// Modifier l'interface ConversationBodyProps pour ajouter les props nécessaires
interface ConversationBodyProps {
  conversationId: string
  windowSize: {
    width: number | undefined
    height: number | undefined
  }
}

// Modifier le composant ConversationBody pour ajouter la fonctionnalité d'agrandissement d'image
const ConversationBody: React.FC<ConversationBodyProps> = ({ conversationId, windowSize }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState<UserData | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Ajouter un état pour l'image agrandie
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  // Modifier la fonction useEffect pour gérer les erreurs plus gracieusement
  useEffect(() => {
    if (!conversationId || !user) return

    const unsubscribe = listenToConversationMessages(conversationId, (updatedMessages) => {
      setMessages(updatedMessages)
      setLoading(false)
    })

    // Marquer les messages comme lus lorsque l'utilisateur ouvre la conversation
    const markAsRead = async () => {
      try {
        await markMessagesAsRead(conversationId, user.uid)
      } catch (error) {
        console.error("Error marking messages as read:", error)
        // Continue despite error
      }
    }

    markAsRead()

    // Configurer un intervalle pour marquer régulièrement les messages comme lus
    // pendant que l'utilisateur a la conversation ouverte
    const interval = setInterval(markAsRead, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [conversationId, user])

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Ajouter un gestionnaire d'événements pour les touches du clavier (pour fermer l'image agrandie)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && enlargedImage) {
        setEnlargedImage(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enlargedImage])

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#1a1a1a]">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader className="animate-spin text-[#ff7145]" size={24} />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center p-6 text-gray-400">Aucun message. Commencez la conversation !</div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === user?.uid
            const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                {!isCurrentUser && showAvatar && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2a2a] mr-2 flex-shrink-0">
                    {otherUser?.photoURL ? (
                      <Image
                        src={otherUser.photoURL || "/placeholder.svg"}
                        alt={otherUser.displayName || "User"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon size={16} className="text-[#ff7145]" />
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[70%] ${
                    isCurrentUser
                      ? "bg-[#ff7145] text-white rounded-l-lg rounded-br-lg"
                      : "bg-[#2a2a2a] text-white rounded-r-lg rounded-bl-lg"
                  } p-3 relative`}
                >
                  <p>{message.text}</p>
                  <div className="text-xs opacity-70 text-right mt-1">
                    {message.timestamp instanceof Date &&
                      formatDistanceToNow(message.timestamp, {
                        addSuffix: true,
                        locale: fr,
                      })}
                    {isCurrentUser && (
                      <span className="ml-1">
                        {message.read ? (
                          <Check size={12} className="inline" />
                        ) : (
                          <Check size={12} className="inline opacity-50" />
                        )}
                      </span>
                    )}
                  </div>

                  {message.imageUrl && (
                    <div className="mt-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer"
                        onClick={() => setEnlargedImage(message.imageUrl)}
                      >
                        <Image
                          src={message.imageUrl || "/placeholder.svg"}
                          alt="Image"
                          width={200}
                          height={150}
                          className="rounded-md max-w-full"
                        />
                      </motion.div>
                    </div>
                  )}
                </div>

                {isCurrentUser && showAvatar && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2a2a] ml-2 flex-shrink-0">
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL || "/placeholder.svg"}
                        alt={user.displayName || "You"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon size={16} className="text-[#ff7145]" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Modal pour afficher l'image agrandie */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 bg-[#1a1a1a]/80 text-white p-2 rounded-full z-10"
                onClick={() => setEnlargedImage(null)}
              >
                <X size={24} />
              </button>
              <Image
                src={enlargedImage || "/placeholder.svg"}
                alt="Image agrandie"
                width={1200}
                height={800}
                className="max-h-[90vh] w-auto object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConversationBody
