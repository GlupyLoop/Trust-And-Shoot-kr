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
import { Badge } from "@/components/ui/badge"

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

  const getStatusConfig = () => {
    switch (timeSlot.status) {
      case "available":
        return {
          bgColor: "bg-[#1a1a1a]",
          borderColor: "border-[#2a2a2a] hover:border-[#ff7145]/30",
          badgeColor: "bg-[#2a2a2a] text-[#ff7145]",
          icon: <CheckCircle className="h-4 w-4 text-[#ff7145]" />,
          text: "Disponible",
        }
      case "pending":
        return {
          bgColor: "bg-[#1a1a1a]",
          borderColor: "border-[#2a2a2a] hover:border-yellow-500/30",
          badgeColor: "bg-[#2a2a2a] text-yellow-500",
          icon: <Clock4 className="h-4 w-4 text-yellow-500" />,
          text: "En attente",
        }
      case "booked":
        return isPast
          ? {
              bgColor: "bg-[#1a1a1a]",
              borderColor: "border-[#2a2a2a] hover:border-blue-500/30",
              badgeColor: "bg-[#2a2a2a] text-blue-500",
              icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
              text: "Réservation passée",
            }
          : {
              bgColor: "bg-[#1a1a1a]",
              borderColor: "border-[#2a2a2a] hover:border-blue-500/30",
              badgeColor: "bg-[#2a2a2a] text-blue-500",
              icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
              text: "Réservé",
            }
      case "cancelled":
        return {
          bgColor: "bg-[#1a1a1a]",
          borderColor: "border-[#2a2a2a] hover:border-red-500/30",
          badgeColor: "bg-[#2a2a2a] text-red-500",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: "Annulé",
        }
      default:
        return {
          bgColor: "bg-[#1a1a1a]",
          borderColor: "border-[#2a2a2a] hover:border-[#3a3a3a]",
          badgeColor: "bg-[#2a2a2a] text-gray-400",
          icon: <Clock className="h-4 w-4 text-gray-400" />,
          text: "Inconnu",
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <>
      <Card
        className={`${statusConfig.bgColor} border ${statusConfig.borderColor} ${
          isPast ? "opacity-70" : ""
        } transition-all hover:shadow-md hover:shadow-black/20 rounded-lg`}
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
                <Badge variant="outline" className={`px-2 py-1 flex items-center gap-1 ${statusConfig.badgeColor}`}>
                  {statusConfig.icon}
                  <span className="text-xs font-medium">{statusConfig.text}</span>
                </Badge>
                <Badge variant="outline" className="px-2 py-1 bg-[#2a2a2a] text-[#fffbea]">
                  <span className="text-xs font-medium">{timeSlot.price}€</span>
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {isPhotographer && timeSlot.status === "available" && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-[#1a1a1a] border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-200"
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
