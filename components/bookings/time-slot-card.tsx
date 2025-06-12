"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { TimeSlot } from "@/types/booking"
import { deleteTimeSlot } from "@/lib/bookings"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { MapPin, Clock, Calendar, Trash2, CheckCircle, AlertCircle, Clock4 } from "lucide-react"
import { motion } from "framer-motion"

interface TimeSlotCardProps {
  timeSlot: TimeSlot
  isPhotographer?: boolean
  onDelete?: () => void
  onBook?: () => void
  isPast?: boolean
}

export function TimeSlotCard({
  timeSlot,
  isPhotographer = false,
  onDelete,
  onBook,
  isPast = false,
}: TimeSlotCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteTimeSlot(timeSlot.id)
      setIsDeleteDialogOpen(false)
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error("Error deleting time slot:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = () => {
    switch (timeSlot.status) {
      case "available":
        return "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/40"
      case "pending":
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40"
      case "booked":
        return isPast
          ? "bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/30"
          : "bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/40"
      case "cancelled":
        return "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/40"
      default:
        return "bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/40"
    }
  }

  const getStatusIcon = () => {
    switch (timeSlot.status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock4 className="h-4 w-4 text-yellow-500" />
      case "booked":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (timeSlot.status) {
      case "available":
        return "Disponible"
      case "pending":
        return "En attente"
      case "booked":
        return isPast ? "Réservation passée" : "Réservé"
      case "cancelled":
        return "Annulé"
      default:
        return "Inconnu"
    }
  }

  return (
    <>
      <Card
        className={`border ${getStatusColor()} ${
          isPast ? "opacity-70" : ""
        } transition-all hover:shadow-md hover:shadow-black/20`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#ff7145]" />
                  <span className="text-sm font-medium text-[#fffbea]">
                    {format(new Date(timeSlot.date), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <span className="text-[#666]">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#ff7145]" />
                  <span className="text-sm font-medium text-[#fffbea]">
                    {timeSlot.startTime} - {timeSlot.endTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#ff7145]" />
                <span className="text-sm font-medium text-[#fffbea]">{timeSlot.location}</span>
              </div>

              {timeSlot.description && <p className="text-sm text-gray-300 mt-1">{timeSlot.description}</p>}

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-[#2a2a2a] px-2 py-1 rounded-full">
                  {getStatusIcon()}
                  <span className="text-xs font-medium text-[#fffbea]">{getStatusText()}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#2a2a2a] px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-[#fffbea]">{timeSlot.price}€</span>
                </div>
                {timeSlot.status === "booked" && timeSlot.bookedBy && (
                  <div className="flex items-center gap-1.5 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30">
                    <span className="text-xs font-medium text-blue-200">Réservé</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isPhotographer && timeSlot.status === "available" && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {!isPhotographer && timeSlot.status === "available" && onBook && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-[#ff7145] hover:bg-[#ff8d69] text-white"
                    onClick={onBook}
                  >
                    Réserver
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#fffbea]">
          <DialogHeader>
            <DialogTitle>Supprimer ce créneau</DialogTitle>
          </DialogHeader>
          <p className="text-[#a0a0a0]">
            Êtes-vous sûr de vouloir supprimer ce créneau ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#3a3a3a] text-[#fffbea] hover:bg-[#2a2a2a]"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/80 hover:bg-red-500 text-white"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
