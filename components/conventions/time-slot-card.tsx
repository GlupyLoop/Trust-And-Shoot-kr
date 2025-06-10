"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, User } from "lucide-react"
import { type TimeSlot, bookTimeSlot, cancelBooking } from "@/lib/conventions"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface TimeSlotCardProps {
  slot: TimeSlot
  onBookingChange?: () => void
  showPhotographerName?: boolean
}

export function TimeSlotCard({ slot, onBookingChange, showPhotographerName = false }: TimeSlotCardProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const isBooked = slot.status === "booked"
  const isOwnBooking = isBooked && slot.userId === user?.uid

  const handleBooking = async () => {
    if (!user) {
      toast.error("You must be logged in to book a time slot")
      return
    }

    setIsLoading(true)
    try {
      await bookTimeSlot(slot.id, user.uid, `${user.displayName || "User"}`)
      toast.success("Time slot booked successfully")
      if (onBookingChange) onBookingChange()
    } catch (error) {
      console.error("Error booking time slot:", error)
      toast.error("Failed to book time slot")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    setIsLoading(true)
    try {
      await cancelBooking(slot.id)
      toast.success("Booking cancelled successfully")
      if (onBookingChange) onBookingChange()
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{formatDate(slot.date)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {slot.startTime} - {slot.endTime}
            </span>
          </div>

          {showPhotographerName && slot.photographerName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{slot.photographerName}</span>
            </div>
          )}

          {isBooked && (
            <div className="mt-2 text-sm font-medium">
              {isOwnBooking ? (
                <span className="text-green-600">You have booked this slot</span>
              ) : (
                <span className="text-red-600">Already booked</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!isBooked ? (
          <Button onClick={handleBooking} disabled={isLoading || !user} className="w-full">
            {isLoading ? "Booking..." : "Book Slot"}
          </Button>
        ) : isOwnBooking ? (
          <Button onClick={handleCancelBooking} variant="destructive" disabled={isLoading} className="w-full">
            {isLoading ? "Cancelling..." : "Cancel Booking"}
          </Button>
        ) : (
          <Button disabled className="w-full">
            Not Available
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
