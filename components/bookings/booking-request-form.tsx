"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { TimeSlot } from "@/types/booking"
import { createBookingRequest } from "@/lib/bookings"
import { toast } from "sonner"
import { Calendar, Clock, MapPin, Euro } from "lucide-react"

const formSchema = z.object({
  message: z.string().optional(),
  cosplayCharacter: z.string().min(1, "Veuillez indiquer le personnage cosplayé"),
  cosplayReference: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface BookingRequestFormProps {
  isOpen: boolean
  onClose: () => void
  timeSlot: TimeSlot | null
  cosplayerId: string
}

export function BookingRequestForm({ isOpen, onClose, timeSlot, cosplayerId }: BookingRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      cosplayCharacter: "",
      cosplayReference: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (!timeSlot) return

    try {
      setIsSubmitting(true)

      await createBookingRequest({
        timeSlotId: timeSlot.id,
        photographerId: timeSlot.photographerId,
        cosplayerId,
        message: values.message,
        cosplayCharacter: values.cosplayCharacter,
        cosplayReference: values.cosplayReference || undefined,
        status: "pending",
      })

      toast.success("Demande de réservation envoyée avec succès")
      form.reset()
      onClose()
    } catch (error) {
      console.error("Error creating booking request:", error)
      toast.error("Erreur lors de l'envoi de la demande de réservation")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!timeSlot) return null

  const formatDate = (date: Date | string) => {
    if (typeof date === "string") {
      date = new Date(date)
    }
    return format(date, "EEEE d MMMM yyyy", { locale: fr })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle>Réserver un créneau</DialogTitle>
          <DialogDescription>Complétez le formulaire pour réserver ce créneau</DialogDescription>
        </DialogHeader>

        <div className="bg-[#2a2a2a] p-4 rounded-md mb-4">
          <h3 className="font-medium mb-2">Détails du créneau</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#ff7145]" />
              <span>{formatDate(timeSlot.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#ff7145]" />
              <span>
                {timeSlot.startTime} - {timeSlot.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#ff7145]" />
              <span>{timeSlot.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-[#ff7145]" />
              <span>{timeSlot.price} €</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cosplayCharacter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personnage cosplayé *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom du personnage"
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400 focus:border-[#ff7145] focus:ring-[#ff7145]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Indiquez le personnage que vous allez cosplayer</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cosplayReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence visuelle (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemple.com/image.jpg"
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400 focus:border-[#ff7145] focus:ring-[#ff7145]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>URL d'une image de référence pour votre cosplay</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations supplémentaires pour le photographe..."
                      className="resize-none bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400 focus:border-[#ff7145] focus:ring-[#ff7145]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Ajoutez des détails sur votre demande</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#ff7145] hover:bg-[#ff8d69]" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
