"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, X, Send, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { createSupportTicket, getUserTickets, getTicketsByEmail, type SupportTicket } from "@/lib/support-tickets"

interface HelpTicket {
  subject: string
  description: string
  priority: "low" | "medium" | "high"
  email: string
}

export default function HelpPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"new" | "history">("new")
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const { user, userData } = useAuth()

  const [ticket, setTicket] = useState<HelpTicket>({
    subject: "",
    description: "",
    priority: "medium",
    email: userData?.email || "",
  })

  // Update email when user data changes
  useEffect(() => {
    if (userData?.email) {
      setTicket((prev) => ({ ...prev, email: userData.email || "" }))
    }
  }, [userData])

  // Load user tickets when opening history tab
  useEffect(() => {
    if (activeTab === "history" && isOpen) {
      loadUserTickets()
    }
  }, [activeTab, isOpen, user])

  const loadUserTickets = async () => {
    setLoadingTickets(true)
    try {
      let tickets: SupportTicket[] = []

      if (user) {
        // User is authenticated, get tickets by userId
        tickets = await getUserTickets(user.uid)
      } else if (ticket.email) {
        // User is not authenticated, get tickets by email
        tickets = await getTicketsByEmail(ticket.email)
      }

      setUserTickets(tickets)
    } catch (error) {
      console.error("Error loading tickets:", error)
      toast.error("Erreur lors du chargement de l'historique")
    } finally {
      setLoadingTickets(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createSupportTicket({
        userId: user?.uid,
        email: ticket.email,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
      })

      toast.success("Ticket créé avec succès ! Nous vous répondrons dans les plus brefs délais.")

      // Reset form
      setTicket({
        subject: "",
        description: "",
        priority: "medium",
        email: userData?.email || ticket.email,
      })

      // Refresh tickets if on history tab
      if (activeTab === "history") {
        loadUserTickets()
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast.error("Erreur lors de la création du ticket. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePopup = () => {
    if (isMinimized) {
      setIsMinimized(false)
      setIsOpen(true)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const minimizePopup = () => {
    setIsOpen(false)
    setIsMinimized(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "resolved":
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Ouvert"
      case "in_progress":
        return "En cours"
      case "resolved":
        return "Résolu"
      case "closed":
        return "Fermé"
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    return "text-gray-500"
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl w-96 mb-4 max-h-[600px] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#ff7145]" />
                <h3 className="font-semibold text-[#fffbea]">Centre d'aide</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={minimizePopup} className="text-[#888] hover:text-[#fffbea] transition-colors">
                  <div className="w-4 h-0.5 bg-current"></div>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-[#888] hover:text-[#fffbea] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2a2a2a]">
              <button
                onClick={() => setActiveTab("new")}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "new"
                    ? "text-[#ff7145] border-b-2 border-[#ff7145]"
                    : "text-[#888] hover:text-[#fffbea]"
                }`}
              >
                Nouveau ticket
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "text-[#ff7145] border-b-2 border-[#ff7145]"
                    : "text-[#888] hover:text-[#fffbea]"
                }`}
              >
                Historique
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "new" ? (
                <div className="p-4">
                  <p className="text-[#ccc] text-sm mb-4">Décrivez votre problème et nous vous aiderons rapidement.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-[#fffbea] mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={ticket.email}
                        onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-[#fffbea] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-[#ff7145] focus:border-transparent"
                        placeholder="votre@email.com"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-[#fffbea] mb-1">Sujet</label>
                      <input
                        type="text"
                        required
                        value={ticket.subject}
                        onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-[#fffbea] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-[#ff7145] focus:border-transparent"
                        placeholder="Résumé du problème"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-[#fffbea] mb-1">Description</label>
                      <textarea
                        required
                        rows={4}
                        value={ticket.description}
                        onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-[#fffbea] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-[#ff7145] focus:border-transparent resize-none"
                        placeholder="Décrivez votre problème en détail..."
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#ff7145] hover:bg-[#ff8d69] text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Envoi en cours...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Envoyer le ticket
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="p-4">
                  {loadingTickets ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-[#ff7145] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : userTickets.length === 0 ? (
                    <div className="text-center py-8 text-[#888]">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun ticket trouvé</p>
                      {!user && (
                        <p className="text-xs mt-2">
                          {ticket.email ? "Aucun ticket pour cet email" : "Entrez votre email pour voir vos tickets"}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userTickets.map((userTicket) => (
                        <div key={userTicket.id} className="bg-[#2a2a2a] rounded-lg p-3 border border-[#3a3a3a]">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-[#fffbea] text-sm truncate flex-1 mr-2">
                              {userTicket.subject}
                            </h4>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(userTicket.status || "open")}
                              <span className="text-xs text-[#888]">{getStatusText(userTicket.status || "open")}</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#888] mb-2 line-clamp-2">{userTicket.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-medium ${getPriorityColor(userTicket.priority)}`}></span>
                            <span className="text-[#888]">{formatDate(userTicket.createdAt as Date)}</span>
                          </div>
                          {userTicket.adminResponse && (
                            <div className="mt-2 p-2 bg-[#1a1a1a] rounded border-l-2 border-[#ff7145]">
                              <p className="text-xs text-[#ccc]">{userTicket.adminResponse}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={togglePopup}
        className="bg-[#ff7145] hover:bg-[#ff8d69] text-white p-3 rounded-full shadow-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMinimized ? <MessageCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  )
}
