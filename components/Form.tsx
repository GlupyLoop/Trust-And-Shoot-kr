"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { sendMessage } from "@/lib/messaging"
import { toast } from "sonner"
// Ajouter un indicateur de chargement pendant le téléchargement de l'image
import { Paperclip, Smile, Send, Loader } from "lucide-react"

interface FormProps {
  conversationId: string
}

const Form: React.FC<FormProps> = ({ conversationId }) => {
  const { user } = useAuth()
  const [messageText, setMessageText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Modifier la fonction handleFileSelect pour utiliser Firebase Storage
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une image
    if (!file.type.startsWith("image/")) {
      setFileError("Seules les images sont acceptées")
      return
    }

    // Vérifier la taille (5 Mo = 5 * 1024 * 1024 octets)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setFileError("L'image ne doit pas dépasser 5 Mo")
      return
    }

    try {
      setIsLoading(true)

      // Importer la fonction uploadMessageImage
      const { uploadMessageImage } = await import("@/lib/firebase")

      // Télécharger l'image vers Firebase Storage
      const imageUrl = await uploadMessageImage(file, conversationId)

      // Envoyer le message avec l'URL permanente de l'image
      await sendMessage(conversationId, user.uid, "Image envoyée", imageUrl)

      // Réinitialiser le champ de fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error sending image:", error)
      toast.error("Erreur lors de l'envoi de l'image")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageText.trim() || !user) return

    try {
      setIsLoading(true)
      await sendMessage(conversationId, user.uid, messageText.trim())
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Erreur lors de l'envoi du message")
    } finally {
      setIsLoading(false)
    }
  }

  // Fermer le sélecteur d'émojis lorsque l'utilisateur clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showEmojiPicker && !target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  return (
    <div className="p-4 border-t border-[#2a2a2a] bg-[#1a1a1a]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          {/* Modifier le bouton d'envoi de fichier pour afficher l'état de chargement */}
          <button
            type="button"
            className="p-2 hover:bg-[#2a2a2a] rounded-full transition"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? <Loader size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </button>
        </>
        <input
          type="text"
          placeholder="Écrivez votre message..."
          className="flex-1 bg-[#2a2a2a] rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={isLoading}
        />
        <div className="relative emoji-picker-container">
          <button
            type="button"
            className="p-2 hover:bg-[#2a2a2a] rounded-full transition"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-2 shadow-lg z-10 w-64">
              <div className="grid grid-cols-6 gap-2">
                {[
                  "😊",
                  "😂",
                  "❤️",
                  "👍",
                  "🔥",
                  "✨",
                  "🎉",
                  "👏",
                  "😎",
                  "🤔",
                  "😍",
                  "🙌",
                  "👌",
                  "🤩",
                  "😁",
                  "👋",
                  "🥰",
                  "🤗",
                  "😇",
                  "🌟",
                  "💯",
                  "🙏",
                  "💪",
                  "🤣",
                ].map((emoji) => (
                  <button
                    key={emoji}
                    className="w-8 h-8 hover:bg-[#3a3a3a] rounded flex items-center justify-center text-lg"
                    onClick={() => {
                      setMessageText((prev) => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="p-2 bg-[#ff7145] hover:bg-[#ff8d69] rounded-full transition"
          disabled={!messageText.trim() || isLoading}
        >
          <Send size={20} className="text-white" />
        </button>
      </form>
      {fileError && <div className="mt-2 text-xs text-red-500">{fileError}</div>}
    </div>
  )
}

export default Form
