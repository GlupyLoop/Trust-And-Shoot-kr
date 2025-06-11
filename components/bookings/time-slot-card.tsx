"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock, MapPin, Euro, Trash, Edit, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { TimeSlot } from "@/types/booking"

interface TimeSlotCardProps {
  timeSlot: TimeSlot
  onDelete?: (id: string) => void
  onEdit?: (timeSlot: TimeSlot) => void
  isManageable?: boolean
  onSelect?: (timeSlot: TimeSlot) => void
  isSelected?: boolean
  isReserved?: boolean
}

export function TimeSlotCard({
  timeSlot,
  onDelete,
  onEdit,
  isManageable = false,
  onSelect,
  isSelected = false,
  isReserved = false,
}: TimeSlotCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    try {
      setIsDeleting(true)
      await onDelete(timeSlot.id)
      toast.success("Créneau supprimé avec succès")
    } catch (error) {
      console.error("Error deleting time slot:", error)
      toast.error("Erreur lors de la suppression du créneau")
    } finally {
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  const formatDate = (date: string | Date) => {
    if (typeof date === "string") {
      date = new Date(date)
    }
    return format(date, "EEEE d MMMM yyyy", { locale: fr })
  }

  const getStatusBadge = () => {
    if (isReserved) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-200 border">
          <Check className="h-3 w-3 mr-1" />
          Réservé
        </Badge>
      )
    }

    return (
      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-200 border">
        <Check className="h-3 w-3 mr-1" />
        Disponible
      </Badge>
    )
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className={`group ${isSelected ? "ring-2 ring-[#ff7145] ring-offset-2 ring-offset-[#141414]" : ""}`}
      >
        <Card className="bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] border border-[#2a2a2a]/50 hover:border-[#ff7145]/30 transition-all duration-300 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#ff7145]" />
                <span className="text-sm font-medium text-[#fffbea]">{formatDate(timeSlot.date)}</span>
              </div>
              {getStatusBadge()}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
                <Clock className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                <span className="text-sm text-[#fffbea]">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
                <Euro className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                <span className="text-sm font-semibold text-[#fffbea]">{timeSlot.price}€</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
              <MapPin className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
              <span className="text-sm text-[#fffbea] truncate">{timeSlot.location}</span>
            </div>
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0">
            {isManageable ? (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit && onEdit(timeSlot)}
                  className="flex-1 border-[#3a3a3a] bg-[#2a2a2a]/50 text-[#fffbea] hover:bg-[#3a3a3a] hover:border-[#ff7145]/50 transition-all"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => onSelect && onSelect(timeSlot)}
                disabled={isReserved}
                className={`w-full ${
                  isSelected
                    ? "bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] text-white"
                    : isReserved
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#ff7145]/80 to-[#ff8d69]/80 hover:from-[#ff7145] hover:to-[#ff8d69] text-white"
                }`}
              >
                {isSelected ? "Sélectionné" : isReserved ? "Déjà réservé" : "Sélectionner"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] border border-[#2a2a2a] text-[#fffbea] max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold mt-2">Confirmer la suppression</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center text-gray-400">
              Êtes-vous sûr de vouloir supprimer ce créneau horaire ? Cette action est irréversible.
            </p>

            <div className="mt-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#ff7145]" />
                <span className="text-sm text-[#fffbea]">{formatDate(timeSlot.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#ff7145]" />
                <span className="text-sm text-[#fffbea]">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              className="flex-1 border-[#3a3a3a] bg-[#2a2a2a] text-[#fffbea] hover:bg-[#3a3a3a] hover:border-[#ff7145]/50"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
            >
              <Trash className="h-4 w-4 mr-2" />
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
