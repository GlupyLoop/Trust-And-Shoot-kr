"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type TimeSlot, createTimeSlot, getPhotographerTimeSlots, deleteTimeSlot } from "@/lib/conventions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
})

interface ManageTimeSlotsProps {
  photographerId: string
  conventionId: string
  conventionStartDate: Date
  conventionEndDate: Date
}

export function ManageTimeSlots({
  photographerId,
  conventionId,
  conventionStartDate,
  conventionEndDate,
}: ManageTimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      startTime: "",
      endTime: "",
    },
  })

  const fetchTimeSlots = async () => {
    try {
      const slots = await getPhotographerTimeSlots(photographerId, conventionId)
      setTimeSlots(slots)
    } catch (error) {
      console.error("Error fetching time slots:", error)
      toast.error("Failed to load time slots")
    }
  }

  useEffect(() => {
    fetchTimeSlots()
  }, [photographerId, conventionId])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const newSlot = {
        photographerId,
        conventionId,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        status: "available" as const,
      }

      await createTimeSlot(newSlot)
      toast.success("Time slot created successfully")
      form.reset()
      fetchTimeSlots()
    } catch (error) {
      console.error("Error creating time slot:", error)
      toast.error("Failed to create time slot")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    setIsDeleting(slotId)
    try {
      await deleteTimeSlot(slotId)
      toast.success("Time slot deleted successfully")
      fetchTimeSlots()
    } catch (error) {
      console.error("Error deleting time slot:", error)
      toast.error("Failed to delete time slot")
    } finally {
      setIsDeleting(null)
    }
  }

  // Generate time options (30 min intervals)
  const timeOptions = []
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      timeOptions.push(`${formattedHour}:${formattedMinute}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Time Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < conventionStartDate || date > conventionEndDate || date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select start time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={`start-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select end time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions
                            .filter((time) => time > form.getValues("startTime"))
                            .map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Time Slot"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-medium mb-4">Your Time Slots</h3>

        {timeSlots.length === 0 ? (
          <p className="text-muted-foreground">No time slots created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map((slot) => (
              <Card key={slot.id} className="relative">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="font-medium">{format(slot.date, "PPP")}</p>
                    <p className="text-sm text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </p>
                    <p className="text-sm font-medium">
                      Status:{" "}
                      <span className={slot.status === "booked" ? "text-green-600" : "text-blue-600"}>
                        {slot.status === "booked" ? "Booked" : "Available"}
                      </span>
                    </p>
                    {slot.status === "booked" && <p className="text-sm">Booked by: {slot.userName}</p>}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800 hover:bg-red-100"
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={isDeleting === slot.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
