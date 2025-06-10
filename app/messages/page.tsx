"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import ConversationList from "@/components/conversations/ConversationList"
import EmptyState from "@/components/EmptyState"
import ConversationBody from "@/components/conversations/ConversationBody"
import Form from "@/components/Form"
import useConversation from "@/app/hooks/useConversation"
import { useWindowSize } from "@/app/hooks/useWindowSize"
import AnimatedSection from "@/components/ui/animated-section"
import { markMessagesAsRead } from "@/lib/messaging"

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { conversationId } = useConversation()
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null)
  const [showConversationList, setShowConversationList] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const windowSize = useWindowSize()

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Détecter la vue mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Vérifier s'il y a une conversation à ouvrir depuis localStorage
  useEffect(() => {
    const conversationToOpen = localStorage.getItem("openConversationId")
    if (conversationToOpen) {
      setCurrentConversationId(conversationToOpen)
      localStorage.removeItem("openConversationId")

      if (isMobileView) {
        setShowConversationList(false)
      }
    }
  }, [isMobileView])

  // Modifier la fonction handleSelectConversation pour gérer les erreurs plus gracieusement
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

    setCurrentConversationId(conversationId)

    if (isMobileView) {
      setShowConversationList(false)
    }
  }

  // Retourner à la liste des conversations (mobile)
  const handleBackToList = () => {
    setShowConversationList(true)
    setCurrentConversationId(null)
  }

  // Afficher le chargement si l'authentification est en cours
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#141414] pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <AnimatedSection>
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
          </AnimatedSection>

          <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a] h-[calc(100vh-180px)] flex">
            {/* Liste des conversations (masquée en mobile si une conversation est ouverte) */}
            {(showConversationList || !isMobileView) && (
              <div className="w-full md:w-1/3 border-r border-[#2a2a2a]">
                <ConversationList onSelectConversation={handleSelectConversation} />
              </div>
            )}

            {/* Zone de conversation */}
            {(!showConversationList || !isMobileView) && (
              <div className="w-full md:w-2/3 flex flex-col">
                {currentConversationId ? (
                  <>
                    <Header conversationId={currentConversationId} handleBackToList={handleBackToList} />
                    <ConversationBody conversationId={currentConversationId} windowSize={windowSize} />
                    <Form conversationId={currentConversationId} />
                  </>
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
