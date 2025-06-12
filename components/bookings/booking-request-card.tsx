"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Clock,
  MapPin,
  Calendar,
  User,
  Check,
  X,
  MessageSquare,
  Euro,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BookingRequest, TimeSlot } from "@/types/booking"
import { acceptBookingRequest, rejectBookingRequest } from "@/lib/bookings"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface BookingRequestCardProps {
  request: BookingRequest
  timeSlot: TimeSlot
  cosplayerName?: string
  photographerName?: string
  isPhotographer?: boolean
  onStatusChange?: () => void
}

export function BookingRequestCard({
  request,
  timeSlot,
  cosplayerName,
  photographerName,
  isPhotographer = false,
  onStatusChange,
}: BookingRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleAccept = async () => {
    try {
      setIsProcessing(true)
      await acceptBookingRequest(request.id)
      toast.success("Demande de réservation acceptée")
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error("Error accepting booking request:", error)
      toast.error("Erreur lors de l'acceptation de la demande")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (confirm("Êtes-vous sûr de vouloir rejeter cette demande ?")) {
      try {
        setIsProcessing(true)
        await rejectBookingRequest(request.id)
        toast.success("Demande de réservation rejetée")
        if (onStatusChange) {
          onStatusChange()
        }
      } catch (error) {
        console.error("Error rejecting booking request:", error)
        toast.error("Erreur lors du rejet de la demande")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const getStatusConfig = () => {
    switch (request.status) {
      case "pending":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
              <AlertCircle size={12} className="mr-1" />
              En attente
            </Badge>
          ),
          cardClass: "border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-yellow-500/10",
          gradient: "from-yellow-500/5 to-amber-500/5",
          icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
        }
      case "accepted":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
              <CheckCircle size={12} className="mr-1" />
              Acceptée
            </Badge>
          ),
          cardClass: "border-green-500/20 hover:border-green-500/40 hover:shadow-green-500/10",
          gradient: "from-green-500/5 to-emerald-500/5",
          icon: <CheckCircle className="h-5 w-5 text-green-400" />,
          color: "text-green-400",
          bgColor: "bg-green-500/10",
        }
      case "rejected":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
              <XCircle size={12} className="mr-1" />
              Rejetée
            </Badge>
          ),
          cardClass: "border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10",
          gradient: "from-red-500/5 to-rose-500/5",
          icon: <XCircle className="h-5 w-5 text-red-400" />,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
        }
      case "cancelled":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30">
              <XCircle size={12} className="mr-1" />
              Annulée
            </Badge>
          ),
          cardClass: "border-gray-500/20 hover:border-gray-500/40 hover:shadow-gray-500/10",
          gradient: "from-gray-500/5 to-slate-500/5",
          icon: <XCircle className="h-5 w-5 text-gray-400" />,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
        }
      default:
        return {
          badge: null,
          cardClass: "border-[#2a2a2a] hover:border-[#3a3a3a]",
          gradient: "from-[#1a1a1a] to-[#1e1e1e]",
          icon: <AlertCircle className="h-5 w-5 text-gray-400" />,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
        }
    }
  }

  const statusConfig = getStatusConfig()

  const formatDate = (date: Date | string) => {
    if (typeof date === "string") {
      date = new Date(date)
    }
    return format(date, "EEEE d MMMM yyyy", { locale: fr })
  }

  const formatRequestDate = (date: Date | string) => {
    if (typeof date === "string") {
      date = new Date(date)
    }
    return format(date, "d MMM yyyy", { locale: fr })
  }

  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }} className="group">
        <Card
          className={`overflow-hidden bg-[#1a1a1a] border ${statusConfig.cardClass} transition-all duration-300 hover:shadow-xl`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-[#ff7145]/50 shadow-lg shadow-[#ff7145]/10">
                  <AvatarImage
                    src={`/abstract-geometric-shapes.png?height=40&width=40&query=${isPhotographer ? cosplayerName : photographerName}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#ff7145] to-[#ff8d69] text-white">
                    {getInitials(isPhotographer ? cosplayerName : photographerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-white group-hover:text-[#ff7145] transition-colors">
                    {isPhotographer ? cosplayerName : photographerName}
                  </CardTitle>
                  <CardDescription className="flex items-center text-gray-400">
                    <Calendar size={14} className="mr-1 text-[#ff7145]" />
                    Demande du {formatRequestDate(request.requestDate)}
                  </CardDescription>
                </div>
              </div>
              {statusConfig.badge}
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-[#ff7145]" />
                  <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                    {formatDate(timeSlot.date)}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-lg">
                  <Clock className="h-4 w-4 text-[#ff7145]" />
                  <div className="text-sm text-white">
                    {timeSlot.startTime} - {timeSlot.endTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-lg">
                  <Euro className="h-4 w-4 text-[#ff7145]" />
                  <div className="text-sm text-white">{timeSlot.price} €</div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-[#ff7145]" />
                  <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                    {timeSlot.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#2a2a2a]/50 rounded-lg">
                <User className="h-4 w-4 text-[#ff7145]" />
                <div className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                  Cosplay: {request.cosplayCharacter}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="w-full sm:w-auto border-[#3a3a3a] hover:bg-[#2a2a2a] hover:text-[#ff7145]"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Détails
            </Button>

            {isPhotographer && request.status === "pending" && (
              <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                      >
                        <X className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Rejeter</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rejeter la demande</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        onClick={handleAccept}
                        disabled={isProcessing}
                      >
                        <Check className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Accepter</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Accepter la demande</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border border-[#2a2a2a] shadow-xl">
          <DialogHeader className="space-y-3">
            <div className={`w-12 h-12 rounded-full ${statusConfig.bgColor} flex items-center justify-center mx-auto`}>
              {statusConfig.icon}
            </div>
            <DialogTitle className="text-center text-xl">Détails du shoot</DialogTitle>
            <div className={`text-center ${statusConfig.color} font-medium`}>
              {request.status === "pending" && "En attente de confirmation"}
              {request.status === "accepted" && "Réservation confirmée"}
              {request.status === "rejected" && "Réservation rejetée"}
              {request.status === "cancelled" && "Réservation annulée"}
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] p-4 rounded-lg border border-[#3a3a3a]/50">
              <h3 className="font-medium mb-3 text-[#ff7145]">Informations générales</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 bg-[#1a1a1a]/70 p-2 rounded">
                  <User className="h-4 w-4 text-[#ff7145]" />
                  <span>
                    {isPhotographer ? "Cosplayer: " : "Photographe: "}
                    <span className="font-medium text-white">{isPhotographer ? cosplayerName : photographerName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a]/70 p-2 rounded">
                  <Calendar className="h-4 w-4 text-[#ff7145]" />
                  <span>
                    Date: <span className="font-medium text-white">{formatDate(timeSlot.date)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a]/70 p-2 rounded">
                  <Clock className="h-4 w-4 text-[#ff7145]" />
                  <span>
                    Horaire:{" "}
                    <span className="font-medium text-white">
                      {timeSlot.startTime} - {timeSlot.endTime}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a]/70 p-2 rounded">
                  <Euro className="h-4 w-4 text-[#ff7145]" />
                  <span>
                    Prix: <span className="font-medium text-white">{timeSlot.price} €</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] p-4 rounded-lg border border-[#3a3a3a]/50">
              <h3 className="font-medium mb-3 text-[#ff7145]">Détails du cosplay</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 bg-[#1a1a1a]/70 p-2 rounded">
                  <User className="h-4 w-4 text-[#ff7145]" />
                  <span>
                    Personnage: <span className="font-medium text-white">{request.cosplayCharacter}</span>
                  </span>
                </div>
                {request.cosplayReference && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Référence:</span>
                    </div>
                    <a
                      href={request.cosplayReference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full overflow-hidden rounded-lg border border-[#3a3a3a] hover:border-[#ff7145] transition-colors"
                    >
                      <img
                        src={request.cosplayReference || "/placeholder.svg"}
                        alt="Référence cosplay"
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {request.message && (
              <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] p-4 rounded-lg border border-[#3a3a3a]/50">
                <h3 className="font-medium mb-3 text-[#ff7145]">Message</h3>
                <div className="bg-[#1a1a1a]/70 p-3 rounded border border-[#3a3a3a]/30">
                  <p className="text-sm whitespace-pre-wrap text-gray-300 leading-relaxed">{request.message}</p>
                </div>
              </div>
            )}

            {isPhotographer && request.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="destructive"
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={handleAccept}
                  disabled={isProcessing}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accepter
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
