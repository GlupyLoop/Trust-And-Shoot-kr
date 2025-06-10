"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimeSlot } from "@/types/booking"
import { subscribeToTimeSlots } from "@/lib/bookings"
import { TimeSlotCard } from "./time-slot-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BookingCalendarProps {
  photographerId: string
  isPhotographer?: boolean
  onBookSlot?: (timeSlot: TimeSlot) => void
}

export function BookingCalendar({ photographerId, isPhotographer = false, onBookSlot }: BookingCalendarProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([])

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
      setTimeSlots(slots)
      setLoading(false)

      // Si aucune date n'est sélectionnée et qu'il y a des créneaux, sélectionner automatiquement une date
      if (!selectedDate && slots.length > 0) {
        const availableSlot = slots.find((slot) => slot.status === "available")
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
    if (selectedDate && timeSlots.length > 0) {
      console.log("Filtering slots for selected date:", selectedDate)
      const filtered = timeSlots.filter((slot) => {
        const slotDate = new Date(slot.date)
        return isSameDay(slotDate, selectedDate)
      })
      console.log("Filtered slots for date:", filtered.length)
      setFilteredSlots(filtered)
    } else {
      setFilteredSlots([])
    }
  }, [selectedDate, timeSlots])

  // Fonction pour déterminer les jours qui ont des créneaux disponibles
  const getDaysWithSlots = () => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const days = eachDayOfInterval({ start, end })

    return days.map((day) => {
      const hasAvailableSlot = timeSlots.some((slot) => {
        const slotDate = new Date(slot.date)
        return isSameDay(slotDate, day) && slot.status === "available"
      })

      const hasBookedSlot = timeSlots.some((slot) => {
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

  return (
    <div className="space-y-8">
      <Card className="border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-full flex items-center justify-center">
                <CalendarIcon size={20} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#fffbea]">Calendrier de disponibilité</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Sélectionnez une date pour voir les créneaux disponibles
                  {timeSlots.length > 0 && ` (${timeSlots.length} créneaux)`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="h-10 w-10 border-[#ff7145] bg-[#ff7145]/10 text-[#ff7145] hover:border-[#ff8d69] hover:bg-[#ff7145]/20 hover:text-[#ff8d69]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[140px] text-center">
                <span className="text-lg font-semibold capitalize text-[#fffbea]">
                  {format(date, "MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="h-10 w-10 border-[#ff7145] bg-[#ff7145]/10 text-[#ff7145] hover:border-[#ff8d69] hover:bg-[#ff7145]/20 hover:text-[#ff8d69]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="xl:w-1/2">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
                month={date}
                className="rounded-xl border border-[#3a3a3a] bg-[#1a1a1a] p-4 text-[#fffbea]"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-[#fffbea]",
                  caption_label: "text-lg font-medium text-[#fffbea]",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-7 w-7 bg-transparent p-0 text-[#a0a0a0] hover:text-[#ff7145] hover:bg-[#ff7145]/10 rounded-md transition-colors",
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
                    "bg-green-500/30 text-green-200 font-bold hover:bg-green-500/40 border border-green-500/60 rounded-lg",
                  booked:
                    "bg-blue-500/30 text-blue-200 font-bold hover:bg-blue-500/40 border border-blue-500/60 rounded-lg",
                  pending:
                    "bg-yellow-500/30 text-yellow-200 font-bold hover:bg-yellow-500/40 border border-yellow-500/60 rounded-lg",
                }}
              />

              {/* Legend */}
              <div className="mt-6 p-4 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/50">
                <h4 className="text-sm font-medium mb-3 text-[#fffbea]">Légende</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                    <span className="text-xs text-[#a0a0a0]">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                    <span className="text-xs text-[#a0a0a0]">Réservé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                    <span className="text-xs text-[#a0a0a0]">En attente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:w-1/2">
              <div className="sticky top-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-full flex items-center justify-center">
                    <Clock size={16} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#fffbea]">
                    {selectedDate
                      ? `Créneaux du ${format(selectedDate, "d MMMM yyyy", { locale: fr })}`
                      : "Sélectionnez une date"}
                  </h3>
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#ff7145]/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#ff7145] rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 text-[#a0a0a0] font-medium">Chargement des créneaux...</p>
                    </motion.div>
                  ) : filteredSlots.length > 0 ? (
                    <motion.div
                      key={`slots-${selectedDate?.getTime()}`}
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
                      className="text-center py-12 bg-[#2a2a2a]/30 rounded-xl border border-[#3a3a3a]/50"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={24} className="text-gray-500" />
                      </div>
                      <h4 className="text-lg font-medium mb-2 text-[#fffbea]">
                        {selectedDate ? "Aucun créneau disponible" : "Sélectionnez une date"}
                      </h4>
                      <p className="text-[#a0a0a0] text-sm">
                        {selectedDate
                          ? "Aucun créneau n'est disponible pour cette date"
                          : "Choisissez une date dans le calendrier pour voir les créneaux disponibles"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          background: #ff7145;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ff8d69;
        }
      `}</style>
    </div>
  )
}
