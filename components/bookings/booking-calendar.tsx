"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
} from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimeSlot } from "@/types/booking"
import { subscribeToTimeSlots } from "@/lib/bookings"
import { TimeSlotCard } from "./time-slot-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BookingCalendarProps {
  photographerId: string
  isPhotographer?: boolean
  onBookSlot?: (timeSlot: TimeSlot) => void
}

export function BookingCalendar({ photographerId, isPhotographer = false, onBookSlot }: BookingCalendarProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([])
  const [activeTab, setActiveTab] = useState<"available" | "booked">("available")

  // Utiliser l'abonnement en temps réel pour les créneaux
  useEffect(() => {
    if (!photographerId) {
      console.log("No photographerId provided")
      setLoading(false)
      return
    }

    setLoading(true)
    console.log("Setting up real-time subscription for photographer:", photographerId)

    const unsubscribe = subscribeToTimeSlots(photographerId, (slots) => {
      console.log("Calendar received updated time slots:", slots.length, "slots")

      // Séparer les créneaux disponibles et réservés
      const now = new Date()
      const available = slots.filter(
        (slot) => (slot.status === "available" || slot.status === "pending") && isAfter(new Date(slot.date), now),
      )

      // Garder TOUS les créneaux réservés, même passés
      const booked = slots.filter((slot) => slot.status === "booked")

      console.log(`Available slots: ${available.length}, Booked slots: ${booked.length}`)

      setTimeSlots(available)
      setBookedSlots(booked)
      setLoading(false)

      // Si aucune date n'est sélectionnée et qu'il y a des créneaux, sélectionner automatiquement une date
      if (!selectedDate && available.length > 0) {
        const availableSlot = available.find((slot) => slot.status === "available")
        if (availableSlot) {
          const slotDate = new Date(availableSlot.date)
          console.log("Auto-selecting date:", slotDate)
          setSelectedDate(slotDate)
        }
      }
    })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up time slots subscription")
      unsubscribe()
    }
  }, [photographerId, selectedDate])

  // Filtrer les créneaux par date sélectionnée
  useEffect(() => {
    if (selectedDate) {
      console.log("Filtering slots for selected date:", selectedDate)

      // Filtrer selon l'onglet actif
      if (activeTab === "available") {
        const filtered = timeSlots.filter((slot) => {
          const slotDate = new Date(slot.date)
          return isSameDay(slotDate, selectedDate)
        })
        console.log("Filtered available slots for date:", filtered.length)
        setFilteredSlots(filtered)
      } else {
        const filtered = bookedSlots.filter((slot) => {
          const slotDate = new Date(slot.date)
          return isSameDay(slotDate, selectedDate)
        })
        console.log("Filtered booked slots for date:", filtered.length)
        setFilteredSlots(filtered)
      }
    } else {
      setFilteredSlots([])
    }
  }, [selectedDate, timeSlots, bookedSlots, activeTab])

  // Fonction pour déterminer les jours qui ont des créneaux disponibles ou réservés
  const getDaysWithSlots = () => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const days = eachDayOfInterval({ start, end })

    return days.map((day) => {
      const hasAvailableSlot = timeSlots.some((slot) => {
        const slotDate = new Date(slot.date)
        return isSameDay(slotDate, day) && slot.status === "available"
      })

      const hasBookedSlot = bookedSlots.some((slot) => {
        const slotDate = new Date(slot.date)
        return isSameDay(slotDate, day) && slot.status === "booked"
      })

      const hasPendingSlot = timeSlots.some((slot) => {
        const slotDate = new Date(slot.date)
        return isSameDay(slotDate, day) && slot.status === "pending"
      })

      return {
        date: day,
        hasAvailableSlot,
        hasBookedSlot,
        hasPendingSlot,
      }
    })
  }

  const daysWithSlots = getDaysWithSlots()

  const handlePrevMonth = () => {
    setDate(subMonths(date, 1))
  }

  const handleNextMonth = () => {
    setDate(addMonths(date, 1))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log("Selected date:", date)
      setSelectedDate(date)
    }
  }

  const handleDeleteSlot = () => {
    console.log("Slot deleted, real-time subscription will update automatically")
  }

  const handleBookSlot = (timeSlot: TimeSlot) => {
    if (onBookSlot) {
      onBookSlot(timeSlot)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "available" | "booked")
  }

  // Fonction pour trouver la prochaine date avec un créneau réservé
  const findNextBookedDate = () => {
    if (bookedSlots.length === 0) return null

    // Trier les créneaux réservés par date
    const sortedBookedSlots = [...bookedSlots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Trouver le prochain créneau réservé à partir d'aujourd'hui
    const now = new Date()
    const nextBooking = sortedBookedSlots.find((slot) => isAfter(new Date(slot.date), now)) || sortedBookedSlots[0] // Si tous sont passés, prendre le premier

    return new Date(nextBooking.date)
  }

  // Bouton pour naviguer vers la prochaine réservation
  const goToNextBooking = () => {
    const nextBookingDate = findNextBookedDate()
    if (nextBookingDate) {
      setDate(nextBookingDate)
      setSelectedDate(nextBookingDate)
      setActiveTab("booked")
    }
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-[#2a2a2a]/50 bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] shadow-2xl backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-[#1e1e1e] to-[#1a1a1a] border-b border-[#2a2a2a]/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff7145] to-[#ff8d69] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff7145]/25">
                <CalendarIcon size={24} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-[#fffbea] font-bold">Calendrier de disponibilité</CardTitle>
                <p className="text-gray-400 mt-1 text-sm">
                  Sélectionnez une date pour voir les créneaux disponibles
                  {timeSlots.length > 0 && ` • ${timeSlots.length} créneaux disponibles`}
                  {bookedSlots.length > 0 && ` • ${bookedSlots.length} réservations`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="h-11 w-11 border-[#ff7145]/50 bg-[#ff7145]/10 text-[#ff7145] hover:border-[#ff8d69] hover:bg-[#ff7145]/20 hover:text-[#ff8d69] transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-[160px] text-center">
                <span className="text-xl font-bold capitalize text-[#fffbea]">
                  {format(date, "MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="h-11 w-11 border-[#ff7145]/50 bg-[#ff7145]/10 text-[#ff7145] hover:border-[#ff8d69] hover:bg-[#ff7145]/20 hover:text-[#ff8d69] transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              {bookedSlots.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextBooking}
                  className="ml-2 border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 transition-all"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Voir réservations</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col xl:flex-row gap-8 pt-4">
            <div className="xl:w-1/2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  month={date}
                  className="rounded-xl border border-[#3a3a3a]/50 bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] p-4 text-[#fffbea] shadow-lg"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center text-[#fffbea]",
                    caption_label: "text-lg font-medium text-[#fffbea]",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-7 w-7 bg-transparent p-0 text-[#ff7145] hover:text-[#ff8d69] hover:bg-[#ff7145]/20 rounded-md transition-colors border border-[#ff7145]/50",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-[#a0a0a0] rounded-md w-9 font-medium text-[0.8rem] text-center",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#ff7145]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal text-[#fffbea] hover:bg-[#3a3a3a] hover:text-[#ff7145] rounded-md transition-colors aria-selected:opacity-100",
                    day_selected:
                      "bg-[#ff7145] text-white hover:bg-[#ff7145] hover:text-white focus:bg-[#ff7145] focus:text-white",
                    day_today: "bg-[#2a2a2a] text-[#ff7145] font-semibold",
                    day_outside: "text-[#666] opacity-50",
                    day_disabled: "text-[#666] opacity-50",
                    day_range_middle: "aria-selected:bg-[#ff7145]/20 aria-selected:text-[#fffbea]",
                    day_hidden: "invisible",
                  }}
                  modifiers={{
                    available: daysWithSlots.filter((day) => day.hasAvailableSlot).map((day) => day.date),
                    booked: daysWithSlots.filter((day) => day.hasBookedSlot).map((day) => day.date),
                    pending: daysWithSlots.filter((day) => day.hasPendingSlot).map((day) => day.date),
                  }}
                  modifiersClassNames={{
                    available:
                      "bg-gradient-to-br from-green-500/30 to-green-600/30 text-green-200 font-bold hover:bg-green-500/40 border border-green-500/60 rounded-lg shadow-sm shadow-green-500/20",
                    booked:
                      "bg-gradient-to-br from-blue-500/40 to-blue-600/40 text-blue-100 font-bold hover:bg-blue-500/50 border border-blue-500/60 rounded-lg shadow-sm shadow-blue-500/20",
                    pending:
                      "bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 text-yellow-200 font-bold hover:bg-yellow-500/40 border border-yellow-500/60 rounded-lg shadow-sm shadow-yellow-500/20",
                  }}
                />
              </motion.div>

              {/* Legend */}
              <motion.div
                className="mt-8 p-6 bg-gradient-to-r from-[#2a2a2a]/30 to-[#2e2e2e]/30 rounded-2xl border border-[#3a3a3a]/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-lg font-semibold mb-4 text-[#fffbea] flex items-center">
                  <div className="w-2 h-2 bg-[#ff7145] rounded-full mr-3"></div>
                  Légende
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 rounded-xl border border-green-500/20">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-lg shadow-green-500/30"></div>
                    <span className="text-sm text-green-200 font-medium">Disponible</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 rounded-xl border border-blue-500/20">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg shadow-blue-500/30"></div>
                    <span className="text-sm text-blue-200 font-medium">Réservé</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 rounded-xl border border-yellow-500/20">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-500/30"></div>
                    <span className="text-sm text-yellow-200 font-medium">En attente</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="xl:w-1/2">
              <div className="sticky top-4">
                <div className="flex flex-col gap-4">
                  <motion.div
                    className="flex items-center justify-between bg-gradient-to-r from-[#1e1e1e] to-[#1a1a1a] p-4 rounded-xl border border-[#2a2a2a]/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-xl flex items-center justify-center shadow-md shadow-[#ff7145]/20">
                        <Clock size={18} className="text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#fffbea]">
                        {selectedDate
                          ? `Créneaux du ${format(selectedDate, "d MMMM yyyy", { locale: fr })}`
                          : "Sélectionnez une date"}
                      </h3>
                    </div>

                    {selectedDate && (
                      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
                        <TabsList className="bg-[#2a2a2a] border border-[#3a3a3a]/50">
                          <TabsTrigger
                            value="available"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7145] data-[state=active]:to-[#ff8d69] data-[state=active]:text-white"
                          >
                            Disponibles
                          </TabsTrigger>
                          <TabsTrigger
                            value="booked"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                          >
                            Réservés
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1e1e1e]/80 rounded-xl border border-[#2a2a2a]/30 backdrop-blur-sm"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-[#ff7145]/20 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#ff7145] rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-6 text-[#a0a0a0] font-medium text-lg">Chargement des créneaux...</p>
                      </motion.div>
                    ) : filteredSlots.length > 0 ? (
                      <motion.div
                        key={`slots-${selectedDate?.getTime()}-${activeTab}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
                      >
                        {filteredSlots
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((slot, index) => (
                            <motion.div
                              key={slot.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <TimeSlotCard
                                timeSlot={slot}
                                isPhotographer={isPhotographer}
                                onDelete={handleDeleteSlot}
                                onBook={() => handleBookSlot(slot)}
                                isPast={isBefore(new Date(slot.date), new Date()) && slot.status === "booked"}
                              />
                            </motion.div>
                          ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-16 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1e1e1e]/80 rounded-xl border border-[#2a2a2a]/30 backdrop-blur-sm"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Clock size={32} className="text-gray-500" />
                        </div>
                        <h4 className="text-xl font-medium mb-3 text-[#fffbea]">
                          {selectedDate
                            ? activeTab === "available"
                              ? "Aucun créneau disponible"
                              : "Aucune réservation pour cette date"
                            : "Sélectionnez une date"}
                        </h4>
                        <p className="text-[#a0a0a0] text-base max-w-md mx-auto">
                          {selectedDate
                            ? activeTab === "available"
                              ? "Aucun créneau n'est disponible pour cette date. Essayez une autre date."
                              : "Aucune réservation n'est enregistrée pour cette date."
                            : "Choisissez une date dans le calendrier pour voir les créneaux disponibles"}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff7145, #ff8d69);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ff8d69, #ff7145);
        }
      `}</style>
    </motion.div>
  )
}
