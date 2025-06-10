"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type TimeSlot, getPhotographerTimeSlots } from "@/lib/conventions"
import { TimeSlotCard } from "./time-slot-card"
import { toast } from "sonner"

interface AvailableTimeSlotsProps {
  photographerId: string
  conventionId: string
  photographerName: string
}

export function AvailableTimeSlots({ photographerId, conventionId, photographerName }: AvailableTimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const fetchTimeSlots = async () => {
    setIsLoading(true)
    try {
      const slots = await getPhotographerTimeSlots(photographerId, conventionId)
      // Add photographer name to each slot
      const slotsWithName = slots.map((slot) => ({
        ...slot,
        photographerName,
      }))
      setTimeSlots(slotsWithName)

      // Set the first date as selected if there are slots
      if (slotsWithName.length > 0) {
        const dates = [...new Set(slotsWithName.map((slot) => format(slot.date, "yyyy-MM-dd")))]
        setSelectedDate(dates[0])
      }
    } catch (error) {
      console.error("Error fetching time slots:", error)
      toast.error("Failed to load available time slots")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeSlots()
  }, [photographerId, conventionId, photographerName])

  // Group slots by date
  const slotsByDate = timeSlots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    const dateKey = format(slot.date, "yyyy-MM-dd")
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(slot)
    return acc
  }, {})

  // Get unique dates
  const dates = Object.keys(slotsByDate)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No time slots available for this photographer.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Time Slots</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDate || undefined} onValueChange={setSelectedDate}>
          <TabsList className="mb-4 flex flex-wrap">
            {dates.map((date) => (
              <TabsTrigger key={date} value={date}>
                {format(new Date(date), "EEE, MMM d")}
              </TabsTrigger>
            ))}
          </TabsList>

          {dates.map((date) => (
            <TabsContent key={date} value={date}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {slotsByDate[date]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot) => (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      onBook={() => {
                        toast.success("Booking functionality will be available soon!")
                      }}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
