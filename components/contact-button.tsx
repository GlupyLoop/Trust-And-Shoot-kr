"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { createConversation } from "@/lib/messaging"
import { toast } from "sonner"
import { Mail } from "lucide-react"
import { motion } from "framer-motion"

interface ContactButtonProps {
  userId: string
  className?: string
}

export default function ContactButton({ userId, className = "" }: ContactButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleContact = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour contacter cet utilisateur")
      router.push("/login")
      return
    }

    if (user.uid === userId) {
      toast.error("Vous ne pouvez pas vous contacter vous-même")
      return
    }

    try {
      setLoading(true)
      // Créer ou récupérer une conversation existante
      const conversationId = await createConversation(user.uid, userId)

      // Stocker l'ID de conversation dans localStorage pour l'ouvrir automatiquement
      localStorage.setItem("openConversationId", conversationId)

      // Rediriger vers la page de messagerie
      router.push("/messages")
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast.error("Une erreur est survenue lors de la création de la conversation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handleContact}
      disabled={loading}
      className={`bg-[#ff7145] hover:bg-[#e55a2b] text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Mail size={18} />
      <span>{loading ? "Connexion..." : "Contacter"}</span>
    </motion.button>
  )
}
