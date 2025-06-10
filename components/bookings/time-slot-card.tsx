"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, MapPin, Euro, Trash2, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteTimeSlot } from "@/lib/bookings"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { TimeSlot } from "@/types/booking"

interface TimeSlotCardProps {
  timeSlot: TimeSlot
  isPhotographer?: boolean
  onDelete?: () => void
  onBook?: () => void
}

export function TimeSlotCard({ timeSlot, isPhotographer = false, onDelete, onBook }: TimeSlotCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce créneau horaire ?")) {
      try {
        setIsDeleting(true)
        await deleteTimeSlot(timeSlot.id)
        toast.success("Créneau horaire supprimé avec succès")
        if (onDelete) {
          onDelete()
        }
      } catch (error) {
        console.error("Error deleting time slot:", error)
        toast.error("Erreur lors de la suppression du créneau horaire")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleBook = () => {
    if (onBook) {
      onBook()
    }
  }

  const getStatusBadge = () => {
    switch (timeSlot.status) {
      case "available":
        return <Badge className="bg-green-500/20 text-green-400 border border-green-500/40">Disponible</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">En attente</Badge>
      case "booked":
        return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/40">Réservé</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border border-red-500/40">Annulé</Badge>
      default:
        return null
    }
  }

  const slotDate = new Date(timeSlot.date)

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card className="border border-[#ff7145]/20 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#ff7145]" />
                <span className="font-medium text-white">{format(slotDate, "d MMMM yyyy", { locale: fr })}</span>
              </div>
              {getStatusBadge()}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#ff7145]" />
                <span className="text-white">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#ff7145]" />
                <span className="text-white">{timeSlot.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-[#ff7145]" />
                <span className="text-white">{timeSlot.price} €</span>
              </div>

              {timeSlot.bookedBy && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#ff7145]" />
                  <span className="text-white">Réservé par: {timeSlot.bookedByName || timeSlot.bookedBy}</span>
                </div>
              )}
            </div>

            {timeSlot.description && (
              <div className="mb-4 p-3 bg-[#2a2a2a]/50 rounded-md text-sm">
                <p className="text-gray-300">{timeSlot.description}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              {isPhotographer && timeSlot.status === "available" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isDeleting ? "Suppression..." : "Supprimer"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supprimer ce créneau horaire</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : !isPhotographer && timeSlot.status === "available" ? (
                <Button
                  onClick={handleBook}
                  className="bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] text-white"
                  size="sm"
                >
                  Réserver ce créneau
                </Button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
