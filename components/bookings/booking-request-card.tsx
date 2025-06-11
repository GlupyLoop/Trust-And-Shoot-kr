"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { BookingRequest, TimeSlot } from "@/types/booking"
import { acceptBookingRequest, rejectBookingRequest } from "@/lib/bookings"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Calendar,
  Clock,
  MapPin,
  Euro,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
} from "lucide-react"
import { motion } from "framer-motion"

interface BookingRequestCardProps {
  request: BookingRequest
  timeSlot: TimeSlot
  cosplayerName: string
  isPhotographer?: boolean
  onStatusChange?: () => void
}

export function BookingRequestCard({
  request,
  timeSlot,
  cosplayerName,
  isPhotographer = false,
  onStatusChange,
}: BookingRequestCardProps) {
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleAccept = async () => {
    try {
      setLoading(true)
      await acceptBookingRequest(request.id)
      toast.success("Demande de réservation acceptée")
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error("Error accepting booking request:", error)
      toast.error("Erreur lors de l'acceptation de la demande")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (confirm("Êtes-vous sûr de vouloir rejeter cette demande ?")) {
      try {
        setLoading(true)
        await rejectBookingRequest(request.id)
        toast.success("Demande de réservation rejetée")
        if (onStatusChange) {
          onStatusChange()
        }
      } catch (error) {
        console.error("Error rejecting booking request:", error)
        toast.error("Erreur lors du rejet de la demande")
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusConfig = () => {
    switch (request.status) {
      case "pending":
        return {
          color: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/40",
          textColor: "text-yellow-200",
          icon: <AlertCircle className="h-4 w-4" />,
          label: "En attente",
        }
      case "accepted":
        return {
          color: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40",
          textColor: "text-green-200",
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Acceptée",
        }
      case "rejected":
        return {
          color: "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/40",
          textColor: "text-red-200",
          icon: <XCircle className="h-4 w-4" />,
          label: "Rejetée",
        }
      default:
        return {
          color: "bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/40",
          textColor: "text-gray-200",
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Inconnu",
        }
    }
  }

  const statusConfig = getStatusConfig()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
      <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }} className="group">
        <Card className="bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] border border-[#2a2a2a]/50 hover:border-[#ff7145]/30 transition-all duration-300 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-[#ff7145]/50 shadow-lg shadow-[#ff7145]/20">
                    <AvatarImage
                      src={`/placeholder.svg?height=48&width=48&query=cosplayer-${cosplayerName}`}
                      alt={cosplayerName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#ff7145] to-[#ff8d69] text-white font-bold">
                      {getInitials(cosplayerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-[#2a2a2a]">
                    {statusConfig.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#fffbea] group-hover:text-[#ff7145] transition-colors">
                    {cosplayerName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Demande du {format(request.requestDate, "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>

              <Badge className={`${statusConfig.color} ${statusConfig.textColor} border font-medium`}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Time Slot Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
                <Calendar className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                <span className="text-sm text-[#fffbea] truncate">
                  {format(new Date(timeSlot.date), "d MMM", { locale: fr })}
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
                <Clock className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                <span className="text-sm text-[#fffbea]">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
                <Euro className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                <span className="text-sm font-semibold text-[#fffbea]">{timeSlot.price}€</span>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-xl border border-[#3a3a3a]/30">
                <MapPin className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
                <span className="text-sm text-[#fffbea] truncate">{timeSlot.location}</span>
              </div>
            </div>

            {/* Cosplay Character */}
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#ff7145]/10 to-[#ff8d69]/10 rounded-xl border border-[#ff7145]/20">
              <User className="h-4 w-4 text-[#ff7145] flex-shrink-0" />
              <div className="text-sm text-[#fffbea]">
                <span className="text-gray-400">Cosplay:</span>{" "}
                <span className="font-medium">{request.cosplayCharacter}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="flex-1 border-[#3a3a3a] bg-[#2a2a2a]/50 text-[#fffbea] hover:bg-[#3a3a3a] hover:border-[#ff7145]/50 transition-all"
              >
                <Eye className="h-4 w-4 mr-2" />
                Détails
              </Button>

              {isPhotographer && request.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white shadow-lg shadow-green-500/25"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accepter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReject}
                    disabled={loading}
                    className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Refuser
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] border border-[#2a2a2a] text-[#fffbea] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Détails de la demande</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 font-medium">Cosplayer</label>
                <p className="text-[#fffbea] font-semibold">{cosplayerName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-medium">Statut</label>
                <Badge className={`${statusConfig.color} ${statusConfig.textColor} border font-medium mt-1`}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 font-medium">Personnage cosplayé</label>
              <p className="text-[#fffbea] font-semibold">{request.cosplayCharacter}</p>
            </div>

            {request.description && (
              <div>
                <label className="text-sm text-gray-400 font-medium">Description</label>
                <p className="text-[#fffbea] leading-relaxed">{request.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 font-medium">Date</label>
                <p className="text-[#fffbea]">{format(new Date(timeSlot.date), "d MMMM yyyy", { locale: fr })}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-medium">Horaire</label>
                <p className="text-[#fffbea]">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 font-medium">Prix</label>
                <p className="text-[#fffbea] font-semibold">{timeSlot.price}€</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-medium">Lieu</label>
                <p className="text-[#fffbea]">{timeSlot.location}</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 font-medium">Date de demande</label>
              <p className="text-[#fffbea]">{format(request.requestDate, "d MMMM yyyy à HH:mm", { locale: fr })}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetails(false)}
              className="border-[#3a3a3a] bg-[#2a2a2a] text-[#fffbea] hover:bg-[#3a3a3a] hover:border-[#ff7145]/50"
            >
              Fermer
            </Button>
            <Button className="bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contacter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
