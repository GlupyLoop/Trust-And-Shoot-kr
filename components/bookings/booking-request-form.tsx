"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { TimeSlot } from "@/types/booking"
import { createBookingRequest } from "@/lib/bookings"
import { toast } from "sonner"
import { Calendar, Clock, MapPin, Euro, User, Send, Loader2, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

      toast.success("Demande de réservation envoyée avec succès", {
        description: "Le photographe recevra votre demande et vous répondra bientôt.",
      })
      form.reset()
      onClose()
    } catch (error) {
      console.error("Error creating booking request:", error)
      toast.error("Erreur lors de l'envoi de la demande", {
        description: "Veuillez réessayer dans quelques instants.",
      })
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
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] border border-[#2a2a2a]/50 shadow-2xl backdrop-blur-sm rounded-3xl text-[#fffbea] max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader className="space-y-4 pb-6 border-b border-[#2a2a2a]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#ff7145] to-[#ff8d69] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff7145]/25 relative overflow-hidden">
                      <Sparkles className="absolute top-1 right-1 h-3 w-3 text-white/60" />
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#fffbea] to-[#fffbea]/80 bg-clip-text text-transparent">
                        Demande de réservation
                      </DialogTitle>
                      <DialogDescription className="text-gray-400 mt-1 text-base">
                        Complétez votre demande pour réserver ce créneau
                      </DialogDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-[#fffbea] hover:bg-[#2a2a2a]/50 rounded-xl transition-all"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </DialogHeader>

              {/* Time Slot Summary */}
              <motion.div
                className="bg-gradient-to-r from-[#2a2a2a]/50 via-[#2e2e2e]/50 to-[#2a2a2a]/50 p-6 rounded-2xl mb-6 border border-[#3a3a3a]/30 backdrop-blur-sm relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff7145]/5 to-[#ff8d69]/5 rounded-2xl" />
                <div className="relative">
                  <h3 className="text-lg font-semibold mb-4 text-[#fffbea] flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-full mr-3 animate-pulse"></div>
                    Récapitulatif du créneau
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="flex items-center gap-3 p-4 bg-[#1a1a1a]/60 rounded-xl border border-[#3a3a3a]/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff7145]/20 to-[#ff8d69]/20 rounded-xl flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-[#ff7145]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-medium">Date</p>
                        <p className="font-semibold text-[#fffbea] text-sm">{formatDate(timeSlot.date)}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-[#1a1a1a]/60 rounded-xl border border-[#3a3a3a]/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff7145]/20 to-[#ff8d69]/20 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-[#ff7145]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-medium">Horaire</p>
                        <p className="font-semibold text-[#fffbea] text-sm">
                          {timeSlot.startTime} - {timeSlot.endTime}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-[#1a1a1a]/60 rounded-xl border border-[#3a3a3a]/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff7145]/20 to-[#ff8d69]/20 rounded-xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-[#ff7145]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-medium">Lieu</p>
                        <p className="font-semibold text-[#fffbea] text-sm">{timeSlot.location}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-[#1a1a1a]/60 rounded-xl border border-[#3a3a3a]/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff7145]/20 to-[#ff8d69]/20 rounded-xl flex items-center justify-center">
                        <Euro className="h-5 w-5 text-[#ff7145]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-medium">Prix</p>
                        <p className="font-semibold text-[#fffbea] text-sm">{timeSlot.price}€</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Booking Form */}
              <Form {...form}>
                <motion.form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff7145]/25">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#fffbea]">Informations du cosplay</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="cosplayCharacter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#fffbea] font-medium text-base">Personnage cosplayé *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Nezuko Kamado, Spider-Man, Sailor Moon..."
                              className="bg-[#2a2a2a]/80 border-[#3a3a3a]/50 text-[#fffbea] placeholder:text-gray-500 focus:border-[#ff7145]/50 focus:ring-[#ff7145]/20 rounded-xl h-12 transition-all backdrop-blur-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Indiquez le personnage que vous allez cosplayer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cosplayReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#fffbea] font-medium text-base">
                            Référence visuelle (optionnel)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://exemple.com/image.jpg"
                              className="bg-[#2a2a2a]/80 border-[#3a3a3a]/50 text-[#fffbea] placeholder:text-gray-500 focus:border-[#ff7145]/50 focus:ring-[#ff7145]/20 rounded-xl h-12 transition-all backdrop-blur-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            URL d'une image de référence pour votre cosplay
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#fffbea] font-medium text-base">Message (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Décrivez votre projet, le style souhaité, les accessoires que vous apportez..."
                              className="resize-none bg-[#2a2a2a]/80 border-[#3a3a3a]/50 text-[#fffbea] placeholder:text-gray-500 focus:border-[#ff7145]/50 focus:ring-[#ff7145]/20 rounded-xl transition-all backdrop-blur-sm min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Ajoutez des détails sur votre demande de séance photo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-[#2a2a2a]/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 border-[#3a3a3a]/50 bg-[#2a2a2a]/50 text-[#fffbea] hover:bg-[#3a3a3a]/50 hover:border-[#ff7145]/30 transition-all rounded-xl h-12 backdrop-blur-sm"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] text-white shadow-lg shadow-[#ff7145]/25 transition-all duration-300 rounded-xl h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Envoi en cours...</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          <span>Envoyer la demande</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </motion.form>
              </Form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
