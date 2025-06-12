"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import { TimeSlotForm } from "@/components/bookings/time-slot-form"
import { BookingCalendar } from "@/components/bookings/booking-calendar"
import { BookingRequestCard } from "@/components/bookings/booking-request-card"
import type { TimeSlot, BookingRequest } from "@/types/booking"
import { subscribeToTimeSlots, subscribeToBookingRequests } from "@/lib/bookings"
import { getUserData } from "@/lib/firebase"
import { ArrowLeft, Calendar, Plus, Search, Filter, CheckCircle, Users, List, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import AnimatedSection from "@/components/ui/animated-section"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function PhotographerBookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])
  const [timeSlotsMap, setTimeSlotsMap] = useState<Record<string, TimeSlot>>({})
  const [cosplayerNames, setCosplayerNames] = useState<Record<string, string>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeView, setActiveView] = useState<"calendar" | "requests">("calendar")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Utiliser l'abonnement en temps réel pour les créneaux
  useEffect(() => {
    if (!user?.uid) return

    console.log("Setting up real-time subscription for photographer:", user.uid)

    const unsubscribe = subscribeToTimeSlots(user.uid, (slots) => {
      console.log("Dashboard received updated time slots:", slots.length)
      setTimeSlots(slots)

      // Créer une map des créneaux pour un accès rapide
      const slotsMap: Record<string, TimeSlot> = {}
      slots.forEach((slot) => {
        slotsMap[slot.id] = slot
      })
      setTimeSlotsMap(slotsMap)
    })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up time slots subscription")
      unsubscribe()
    }
  }, [user?.uid])

  // Utiliser l'abonnement en temps réel pour les demandes de réservation
  useEffect(() => {
    if (!user?.uid) return

    console.log("Setting up real-time subscription for booking requests:", user.uid)

    const unsubscribe = subscribeToBookingRequests(user.uid, (requests) => {
      console.log("Dashboard received updated booking requests:", requests.length)
      setBookingRequests(requests)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up booking requests subscription")
      unsubscribe()
    }
  }, [user?.uid])

  // Charger les noms des cosplayers
  const fetchCosplayerNames = useCallback(async () => {
    if (bookingRequests.length === 0) return

    try {
      console.log("Fetching cosplayer names for", bookingRequests.length, "requests")

      // Récupérer les noms des cosplayers
      const cosplayerIds = [...new Set(bookingRequests.map((req) => req.cosplayerId))]
      const names: Record<string, string> = {}

      await Promise.all(
        cosplayerIds.map(async (id) => {
          try {
            const cosplayerData = await getUserData(id)
            if (cosplayerData) {
              names[id] = cosplayerData.displayName || cosplayerData.username || "Cosplayer"
            }
          } catch (error) {
            console.error(`Error fetching cosplayer ${id}:`, error)
            names[id] = "Cosplayer"
          }
        }),
      )

      setCosplayerNames(names)
      console.log("Cosplayer names loaded:", names)
    } catch (error) {
      console.error("Error fetching cosplayer names:", error)
    }
  }, [bookingRequests])

  useEffect(() => {
    if (bookingRequests.length > 0) {
      fetchCosplayerNames()
    }
  }, [bookingRequests, fetchCosplayerNames])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleAddTimeSlot = () => {
    setShowAddForm(true)
  }

  const handleFormSuccess = () => {
    setShowAddForm(false)
    console.log("Time slot form submitted successfully")
  }

  const filterRequests = (requests: BookingRequest[]) => {
    return requests.filter((req) => {
      // Filtre par statut
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false
      }

      // Filtre par recherche
      if (searchTerm && cosplayerNames[req.cosplayerId]) {
        const name = cosplayerNames[req.cosplayerId].toLowerCase()
        const character = (req.cosplayCharacter || "").toLowerCase()
        const search = searchTerm.toLowerCase()
        return name.includes(search) || character.includes(search)
      }

      return true
    })
  }

  const getPendingRequests = () => {
    return filterRequests(bookingRequests.filter((req) => req.status === "pending"))
  }

  const getAcceptedRequests = () => {
    return filterRequests(bookingRequests.filter((req) => req.status === "accepted"))
  }

  const getRejectedRequests = () => {
    return filterRequests(bookingRequests.filter((req) => req.status === "rejected"))
  }

  const getStatusCount = (status: string) => {
    if (status === "all") {
      return bookingRequests.length
    }
    return bookingRequests.filter((req) => req.status === status).length
  }

  // Calculate stats
  const stats = {
    pending: bookingRequests.filter((req) => req.status === "pending").length,
    confirmed: bookingRequests.filter((req) => req.status === "accepted").length,
    completed: timeSlots.filter((slot) => slot.status === "booked" && new Date(slot.date) < new Date()).length,
    totalSlots: timeSlots.length,
  }

  if (authLoading || (loading && bookingRequests.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#141414] to-[#1a1a1a] pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <AnimatedSection>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => router.push("/photographer-dashboard")}
                  className="flex items-center gap-2 text-[#fffbea] hover:text-[#ff7145] transition-colors"
                  whileHover={{ x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff7145] to-[#ff8d69] bg-clip-text text-transparent">
                    Gestion des réservations
                  </h1>
                  <p className="text-gray-400 mt-1">Gérez vos créneaux et demandes de réservation</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                <Button
                  onClick={handleAddTimeSlot}
                  className="bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau créneau
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Stats Overview */}
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                className="bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a] hover:border-[#ff7145]/30 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Demandes en attente</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a] hover:border-[#ff7145]/30 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Réservations confirmées</p>
                    <p className="text-2xl font-bold text-green-500">{stats.confirmed}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a] hover:border-[#ff7145]/30 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Sessions terminées</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a] hover:border-[#ff7145]/30 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Créneaux disponibles</p>
                    <p className="text-2xl font-bold text-[#ff7145]">{stats.totalSlots}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#ff7145]/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#ff7145]" />
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Navigation Tabs */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-[#2a2a2a]">
                <button
                  onClick={() => setActiveView("calendar")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeView === "calendar"
                      ? "bg-gradient-to-r from-[#ff7145] to-[#ff8d69] text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Calendrier
                </button>
                <button
                  onClick={() => setActiveView("requests")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeView === "requests"
                      ? "bg-gradient-to-r from-[#ff7145] to-[#ff8d69] text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                  Toutes les demandes
                  {stats.pending > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-yellow-500 text-black">
                      {stats.pending}
                    </Badge>
                  )}
                </button>
              </div>

              {/* Search and Filter - Only show for requests view */}
              {activeView === "requests" && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher par nom ou personnage..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#ff7145]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-[#1a1a1a] border-[#2a2a2a]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="accepted">Acceptées</SelectItem>
                      <SelectItem value="rejected">Rejetées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Content Area */}
          <AnimatedSection delay={0.3}>
            {activeView === "calendar" && (
              <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
                <BookingCalendar photographerId={user?.uid || ""} isPhotographer={true} />
              </div>
            )}

            {activeView === "requests" && (
              <div className="space-y-6">
                {/* Pending Requests */}
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <AlertCircle className="mr-2 text-yellow-500" />
                    Demandes en attente
                    {stats.pending > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-yellow-500 text-black">
                        {stats.pending}
                      </Badge>
                    )}
                  </h2>

                  {getPendingRequests().length === 0 ? (
                    <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-[#2a2a2a]">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune demande en attente</h3>
                      <p className="text-gray-500">Les nouvelles demandes de réservation apparaîtront ici</p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {getPendingRequests().map((request) => {
                        const timeSlot = timeSlotsMap[request.timeSlotId]
                        if (!timeSlot) return null

                        return (
                          <motion.div key={request.id} variants={itemVariants}>
                            <BookingRequestCard
                              request={request}
                              timeSlot={timeSlot}
                              cosplayerName={cosplayerNames[request.cosplayerId] || "Cosplayer"}
                              isPhotographer={true}
                              onStatusChange={() => console.log("Status changed")}
                            />
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}
                </div>

                {/* Confirmed Requests */}
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <CheckCircle className="mr-2 text-green-500" />
                    Réservations confirmées
                    {stats.confirmed > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-green-500 text-white">
                        {stats.confirmed}
                      </Badge>
                    )}
                  </h2>

                  {getAcceptedRequests().length === 0 ? (
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-xl p-8 text-center border border-[#2a2a2a] hover:border-[#ff7145]/30 transition-all duration-300">
                      <div className="w-20 h-20 bg-gradient-to-r from-[#ff7145]/20 to-[#ff8d69]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#ff7145]/30">
                        <CheckCircle className="w-10 h-10 text-[#ff7145]" />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-[#ff7145] to-[#ff8d69] bg-clip-text text-transparent mb-3">
                        Aucune réservation confirmée
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        Les réservations acceptées apparaîtront ici avec un design élégant
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {getAcceptedRequests().map((request) => {
                        const timeSlot = timeSlotsMap[request.timeSlotId]
                        if (!timeSlot) return null

                        return (
                          <motion.div key={request.id} variants={itemVariants}>
                            <BookingRequestCard
                              request={request}
                              timeSlot={timeSlot}
                              cosplayerName={cosplayerNames[request.cosplayerId] || "Cosplayer"}
                              isPhotographer={true}
                              onStatusChange={() => console.log("Status changed")}
                            />
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </main>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-[#2a2a2a] shadow-xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-center text-xl">Ajouter un créneau horaire</DialogTitle>
            <DialogDescription className="text-center">
              Créez un nouveau créneau de disponibilité pour les séances photo
            </DialogDescription>
          </DialogHeader>

          <TimeSlotForm photographerId={user?.uid || ""} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </>
  )
}
