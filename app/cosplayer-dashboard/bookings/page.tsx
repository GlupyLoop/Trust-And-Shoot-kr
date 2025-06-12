"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import type { TimeSlot, BookingRequest } from "@/types/booking"
import { getCosplayerBookings } from "@/lib/bookings"
import { getUserData } from "@/lib/firebase"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  Euro,
  MapPin,
  User,
  MessageSquare,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import AnimatedSection from "@/components/ui/animated-section"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Utils functions
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0") // Month is 0-indexed
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function formatRequestDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
  return date.toLocaleDateString("fr-FR", options)
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export default function CosplayerBookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])
  const [timeSlotsMap, setTimeSlotsMap] = useState<Record<string, TimeSlot>>({})
  const [photographerNames, setPhotographerNames] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null)

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Récupérer les réservations
      const requests = await getCosplayerBookings(user.uid)
      setBookingRequests(requests)

      // Récupérer les créneaux horaires associés
      const slotsMap: Record<string, TimeSlot> = {}
      const photographerIds = [...new Set(requests.map((req) => req.photographerId))]
      const names: Record<string, string> = {}

      // Récupérer les noms des photographes
      await Promise.all(
        photographerIds.map(async (id) => {
          try {
            const photographerData = await getUserData(id)
            if (photographerData) {
              names[id] = photographerData.displayName || "Photographe"
            }
          } catch (error) {
            console.error(`Error fetching photographer ${id}:`, error)
          }
        }),
      )

      setPhotographerNames(names)

      // Simuler les créneaux horaires (à remplacer par une vraie requête)
      requests.forEach((request) => {
        // Créer un créneau horaire fictif pour chaque demande
        slotsMap[request.timeSlotId] = {
          id: request.timeSlotId,
          photographerId: request.photographerId,
          date: new Date(), // À remplacer par la vraie date
          startTime: "10:00",
          endTime: "11:00",
          status: request.status === "accepted" ? "booked" : request.status === "pending" ? "pending" : "available",
          price: 50,
          location: "Paris, France",
          createdAt: new Date(),
        }
      })

      setTimeSlotsMap(slotsMap)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.uid) {
        fetchData()
      }
    }
  }, [user, authLoading, router])

  const handleStatusChange = () => {
    fetchData()
  }

  const filterRequests = (requests: BookingRequest[]) => {
    return requests.filter((req) => {
      // Filtre par statut
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false
      }

      // Filtre par recherche
      if (searchTerm && photographerNames[req.photographerId]) {
        const name = photographerNames[req.photographerId].toLowerCase()
        const character = req.cosplayCharacter.toLowerCase()
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

  if (authLoading || loading) {
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
        <div className="container mx-auto px-4 max-w-6xl">
          <AnimatedSection>
            <motion.button
              onClick={() => router.push("/cosplayer-dashboard")}
              className="flex items-center gap-2 mb-6 text-[#fffbea] font-bold"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              <span>RETOUR AU TABLEAU DE BORD</span>
            </motion.button>
          </AnimatedSection>

          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl font-bold flex items-center bg-gradient-to-r from-[#ff7145] to-[#ff8d69] bg-clip-text text-transparent">
                <Calendar className="mr-2 text-[#ff7145]" />
                Mes réservations
              </h1>

              <motion.button
                onClick={() => router.push("/booking")}
                className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] rounded-md text-white font-medium flex items-center gap-2 shadow-lg shadow-[#ff7145]/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calendar className="h-4 w-4" />
                Réserver un photographe
              </motion.button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6 bg-[#1a1a1a] p-1 border border-[#2a2a2a]">
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7145] data-[state=active]:to-[#ff8d69] data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">En attente</span>
                  {getPendingRequests().length > 0 && (
                    <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {getPendingRequests().length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="confirmed"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7145] data-[state=active]:to-[#ff8d69] data-[state=active]:text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Confirmées</span>
                  {getAcceptedRequests().length > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {getAcceptedRequests().length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7145] data-[state=active]:to-[#ff8d69] data-[state=active]:text-white"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Rejetées</span>
                  {getRejectedRequests().length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {getRejectedRequests().length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-lg p-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <Clock className="mr-2 text-yellow-500" />
                      Demandes en attente
                    </h2>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-[#2a2a2a] border-[#3a3a3a] w-full"
                        />
                      </div>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] bg-[#2a2a2a] border-[#3a3a3a]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filtrer" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="accepted">Acceptées</SelectItem>
                          <SelectItem value="rejected">Rejetées</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {getPendingRequests().length === 0 ? (
                    <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-[#2a2a2a] flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Aucune demande en attente</h3>
                      <p className="text-gray-400 max-w-md">
                        Vous n'avez pas de demandes de réservation en attente pour le moment. Réservez un créneau avec
                        un photographe pour voir apparaître votre demande ici.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {getPendingRequests().map(
                        (request) =>
                          timeSlotsMap[request.timeSlotId] && (
                            <motion.div key={request.id} variants={itemVariants}>
                              <Card className="group overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#222] border border-[#2a2a2a] hover:border-[#ff7145]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#ff7145]/10 hover:scale-[1.02]">
                                <CardHeader className="pb-3 relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff7145]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <Avatar className="h-12 w-12 border-2 border-[#ff7145]/50 shadow-lg shadow-[#ff7145]/20 group-hover:border-[#ff7145] transition-colors">
                                          <AvatarImage
                                            src={`/photographer.png?height=48&width=48&query=photographer-${photographerNames[request.photographerId]}`}
                                            alt={photographerNames[request.photographerId]}
                                          />
                                          <AvatarFallback className="bg-gradient-to-br from-[#ff7145] to-[#ff8d69] text-white font-bold">
                                            {getInitials(photographerNames[request.photographerId])}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
                                          <AlertCircle className="w-2 h-2 text-white" />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-white group-hover:text-[#ff7145] transition-colors">
                                          {photographerNames[request.photographerId]}
                                        </CardTitle>
                                        <CardDescription className="flex items-center text-gray-400 text-sm">
                                          <Calendar size={12} className="mr-1 text-[#ff7145]" />
                                          Demande du {formatRequestDate(request.requestDate)}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 shadow-lg">
                                      <AlertCircle size={12} className="mr-1" />
                                      En attente
                                    </Badge>
                                  </div>
                                </CardHeader>

                                <CardContent className="pb-4 space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-[#ff7145]/20 transition-colors">
                                      <Calendar className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                                      <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                        {formatDate(timeSlotsMap[request.timeSlotId].date)}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-[#ff7145]/20 transition-colors">
                                      <Clock className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                                      <div className="text-sm text-white">
                                        {timeSlotsMap[request.timeSlotId].startTime} -{" "}
                                        {timeSlotsMap[request.timeSlotId].endTime}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-[#ff7145]/20 transition-colors">
                                      <Euro className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                                      <div className="text-sm text-white font-medium">
                                        {timeSlotsMap[request.timeSlotId].price} €
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-[#ff7145]/20 transition-colors">
                                      <MapPin className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                                      <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                        {timeSlotsMap[request.timeSlotId].location}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#ff7145]/10 to-[#ff8d69]/10 rounded-lg border border-[#ff7145]/20">
                                    <User className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                                    <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                      <span className="text-gray-400">Cosplay:</span>{" "}
                                      <span className="font-medium">{request.cosplayCharacter}</span>
                                    </div>
                                  </div>
                                </CardContent>

                                <CardFooter className="pt-0 bg-gradient-to-r from-[#1a1a1a] to-[#1e1e1e] border-t border-[#2a2a2a]">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBooking(request)}
                                    className="w-full border-[#3a3a3a] hover:bg-[#ff7145] hover:border-[#ff7145] hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#ff7145]/20"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Voir les détails du shoot
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ),
                      )}
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="confirmed">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-lg p-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <CheckCircle className="mr-2 text-green-500" />
                      Réservations confirmées
                    </h2>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-[#2a2a2a] border-[#3a3a3a] w-full"
                        />
                      </div>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] bg-[#2a2a2a] border-[#3a3a3a]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filtrer" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="accepted">Acceptées</SelectItem>
                          <SelectItem value="rejected">Rejetées</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {getAcceptedRequests().length === 0 ? (
                    <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-[#2a2a2a] flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Aucune réservation confirmée</h3>
                      <p className="text-gray-400 max-w-md">
                        Vous n'avez pas encore de réservations confirmées. Lorsqu'un photographe acceptera votre
                        demande, elle apparaîtra ici.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {getAcceptedRequests().map(
                        (request) =>
                          timeSlotsMap[request.timeSlotId] && (
                            <motion.div key={request.id} variants={itemVariants}>
                              <Card className="group overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#222] border border-[#2a2a2a] hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:scale-[1.02]">
                                <CardHeader className="pb-3 relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <Avatar className="h-12 w-12 border-2 border-green-500/50 shadow-lg shadow-green-500/20 group-hover:border-green-500 transition-colors">
                                          <AvatarImage
                                            src={`/photographer.png?height=48&width=48&query=photographer-${photographerNames[request.photographerId]}`}
                                            alt={photographerNames[request.photographerId]}
                                          />
                                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                                            {getInitials(photographerNames[request.photographerId])}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
                                          <CheckCircle className="w-2 h-2 text-white" />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                                          {photographerNames[request.photographerId]}
                                        </CardTitle>
                                        <CardDescription className="flex items-center text-gray-400 text-sm">
                                          <Calendar size={12} className="mr-1 text-green-500" />
                                          Confirmée le {formatRequestDate(request.requestDate)}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 shadow-lg">
                                      <CheckCircle size={12} className="mr-1" />
                                      Confirmée
                                    </Badge>
                                  </div>
                                </CardHeader>

                                <CardContent className="pb-4 space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-green-500/20 transition-colors">
                                      <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
                                      <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                        {formatDate(timeSlotsMap[request.timeSlotId].date)}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-green-500/20 transition-colors">
                                      <Clock className="h-4 w-4 text-green-500 flex-shrink-0" />
                                      <div className="text-sm text-white">
                                        {timeSlotsMap[request.timeSlotId].startTime} -{" "}
                                        {timeSlotsMap[request.timeSlotId].endTime}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-green-500/20 transition-colors">
                                      <Euro className="h-4 w-4 text-green-500 flex-shrink-0" />
                                      <div className="text-sm text-white font-medium">
                                        {timeSlotsMap[request.timeSlotId].price} €
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/80 to-[#252525]/80 rounded-lg border border-[#3a3a3a]/30 group-hover:border-green-500/20 transition-colors">
                                      <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                                      <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                        {timeSlotsMap[request.timeSlotId].location}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                                    <User className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                      <span className="text-gray-400">Cosplay:</span>{" "}
                                      <span className="font-medium">{request.cosplayCharacter}</span>
                                    </div>
                                  </div>
                                </CardContent>

                                <CardFooter className="pt-0 bg-gradient-to-r from-[#1a1a1a] to-[#1e1e1e] border-t border-[#2a2a2a]">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBooking(request)}
                                    className="w-full border-[#3a3a3a] hover:bg-green-500 hover:border-green-500 hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Voir les détails du shoot
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ),
                      )}
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rejected">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-lg p-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <XCircle className="mr-2 text-red-500" />
                      Réservations rejetées
                    </h2>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-[#2a2a2a] border-[#3a3a3a] w-full"
                        />
                      </div>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] bg-[#2a2a2a] border-[#3a3a3a]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filtrer" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="accepted">Acceptées</SelectItem>
                          <SelectItem value="rejected">Rejetées</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {getRejectedRequests().length === 0 ? (
                    <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-[#2a2a2a] flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
                        <XCircle className="h-8 w-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Aucune réservation rejetée</h3>
                      <p className="text-gray-400 max-w-md">Vous n'avez pas de réservations rejetées pour le moment.</p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {getRejectedRequests().map(
                        (request) =>
                          timeSlotsMap[request.timeSlotId] && (
                            <motion.div key={request.id} variants={itemVariants}>
                              <Card className="group overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#222] border border-[#2a2a2a] hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:scale-[1.02] opacity-75 hover:opacity-100">
                                <CardHeader className="pb-3 relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <Avatar className="h-12 w-12 border-2 border-red-500/50 shadow-lg shadow-red-500/20 group-hover:border-red-500 transition-colors grayscale group-hover:grayscale-0">
                                          <AvatarImage
                                            src={`/photographer.png?height=48&width=48&query=photographer-${photographerNames[request.photographerId]}`}
                                            alt={photographerNames[request.photographerId]}
                                          />
                                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-500 text-white font-bold">
                                            {getInitials(photographerNames[request.photographerId])}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
                                          <XCircle className="w-2 h-2 text-white" />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-gray-300 group-hover:text-red-400 transition-colors">
                                          {photographerNames[request.photographerId]}
                                        </CardTitle>
                                        <CardDescription className="flex items-center text-gray-500 text-sm">
                                          <Calendar size={12} className="mr-1 text-red-500" />
                                          Rejetée le {formatRequestDate(request.requestDate)}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge className="bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 shadow-lg">
                                      <XCircle size={12} className="mr-1" />
                                      Rejetée
                                    </Badge>
                                  </div>
                                </CardHeader>

                                <CardContent className="pb-4 space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/60 to-[#252525]/60 rounded-lg border border-[#3a3a3a]/20 group-hover:border-red-500/20 transition-colors">
                                      <Calendar className="h-4 w-4 text-red-500 flex-shrink-0" />
                                      <div className="text-sm text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
                                        {formatDate(timeSlotsMap[request.timeSlotId].date)}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/60 to-[#252525]/60 rounded-lg border border-[#3a3a3a]/20 group-hover:border-red-500/20 transition-colors">
                                      <Clock className="h-4 w-4 text-red-500 flex-shrink-0" />
                                      <div className="text-sm text-gray-300">
                                        {timeSlotsMap[request.timeSlotId].startTime} -{" "}
                                        {timeSlotsMap[request.timeSlotId].endTime}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/60 to-[#252525]/60 rounded-lg border border-[#3a3a3a]/20 group-hover:border-red-500/20 transition-colors">
                                      <Euro className="h-4 w-4 text-red-500 flex-shrink-0" />
                                      <div className="text-sm text-gray-300 font-medium">
                                        {timeSlotsMap[request.timeSlotId].price} €
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2a2a2a]/60 to-[#252525]/60 rounded-lg border border-[#3a3a3a]/20 group-hover:border-red-500/20 transition-colors">
                                      <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                                      <div className="text-sm text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
                                        {timeSlotsMap[request.timeSlotId].location}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-lg border border-red-500/20">
                                    <User className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    <div className="text-sm text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
                                      <span className="text-gray-500">Cosplay:</span>{" "}
                                      <span className="font-medium">{request.cosplayCharacter}</span>
                                    </div>
                                  </div>
                                </CardContent>

                                <CardFooter className="pt-0 bg-gradient-to-r from-[#1a1a1a] to-[#1e1e1e] border-t border-[#2a2a2a]">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBooking(request)}
                                    className="w-full border-[#3a3a3a] hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-500/20"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Voir les détails du shoot
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ),
                      )}
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </AnimatedSection>
        </div>
      </main>
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Détails du shoot</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Photographe</label>
                    <p className="text-white font-medium">{photographerNames[selectedBooking.photographerId]}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Statut</label>
                    <Badge
                      className={`${
                        selectedBooking.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : selectedBooking.status === "accepted"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {selectedBooking.status === "pending"
                        ? "En attente"
                        : selectedBooking.status === "accepted"
                          ? "Confirmée"
                          : "Rejetée"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Personnage cosplayé</label>
                  <p className="text-white font-medium">{selectedBooking.cosplayCharacter}</p>
                </div>

                {selectedBooking.description && (
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white">{selectedBooking.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Date</label>
                    <p className="text-white">
                      {formatDate(timeSlotsMap[selectedBooking.timeSlotId]?.date || new Date())}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Horaire</label>
                    <p className="text-white">
                      {timeSlotsMap[selectedBooking.timeSlotId]?.startTime} -{" "}
                      {timeSlotsMap[selectedBooking.timeSlotId]?.endTime}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Prix</label>
                    <p className="text-white font-medium">{timeSlotsMap[selectedBooking.timeSlotId]?.price}€</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Lieu</label>
                    <p className="text-white">{timeSlotsMap[selectedBooking.timeSlotId]?.location}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Date de demande</label>
                  <p className="text-white">{formatRequestDate(selectedBooking.requestDate)}</p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => router.push(`/messages?user=${selectedBooking.photographerId}`)}
                  className="w-full bg-gradient-to-r from-[#ff7145] to-[#ff8d69]"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le photographe
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
