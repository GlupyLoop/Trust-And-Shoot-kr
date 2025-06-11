"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Clock, MapPin, Euro, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createTimeSlot } from "@/lib/bookings"
import { toast } from "sonner"

const formSchema = z.object({
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  timeSlots: z
    .array(
      z.object({
        startTime: z.string().min(1, "Veuillez sélectionner une heure de début"),
        endTime: z.string().min(1, "Veuillez sélectionner une heure de fin"),
        price: z.coerce.number().min(0, "Le prix ne peut pas être négatif"),
        location: z.string().min(1, "Veuillez indiquer un lieu"),
        description: z.string().optional(),
      }),
    )
    .min(1, "Au moins un créneau est requis"),
})

type FormValues = z.infer<typeof formSchema>

interface TimeSlotFormProps {
  photographerId: string
  onSuccess?: () => void
  defaultValues?: Partial<FormValues>
}

export function TimeSlotForm({ photographerId, onSuccess, defaultValues }: TimeSlotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      timeSlots: [
        {
          startTime: "10:00",
          endTime: "11:00",
          price: 50,
          location: "À déterminer",
          description: "",
        },
      ],
      ...defaultValues,
    },
  })

  const [timeSlots, setTimeSlots] = useState([
    {
      startTime: "10:00",
      endTime: "11:00",
      price: 50,
      location: "À déterminer",
      description: "",
    },
  ])

  const addTimeSlot = () => {
    const newTimeSlot = {
      startTime: "10:00",
      endTime: "11:00",
      price: 50,
      location: "À déterminer",
      description: "",
    }
    setTimeSlots([...timeSlots, newTimeSlot])
    const currentTimeSlots = form.getValues("timeSlots")
    form.setValue("timeSlots", [...currentTimeSlots, newTimeSlot])
  }

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      const newTimeSlots = timeSlots.filter((_, i) => i !== index)
      setTimeSlots(newTimeSlots)
      form.setValue("timeSlots", newTimeSlots)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!photographerId) {
      toast.error("ID du photographe manquant")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting form with values:", values)

      // Vérifier chaque créneau horaire
      for (let i = 0; i < values.timeSlots.length; i++) {
        const slot = values.timeSlots[i]

        if (slot.startTime >= slot.endTime) {
          form.setError(`timeSlots.${i}.endTime`, {
            type: "manual",
            message: "L'heure de fin doit être après l'heure de début",
          })
          return
        }
      }

      // Vérifier que la date n'est pas dans le passé
      const selectedDate = new Date(values.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        form.setError("date", {
          type: "manual",
          message: "La date ne peut pas être dans le passé",
        })
        return
      }

      // Créer tous les créneaux horaires
      const promises = values.timeSlots.map((slot) =>
        createTimeSlot({
          photographerId,
          date: values.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: "available",
          price: slot.price,
          location: slot.location,
          description: slot.description || "",
        }),
      )

      await Promise.all(promises)
      console.log("Created all time slots successfully")
      toast.success(`${values.timeSlots.length} créneau(x) horaire(s) créé(s) avec succès`)

      // Reset form
      const defaultTimeSlot = {
        startTime: "10:00",
        endTime: "11:00",
        price: 50,
        location: "À déterminer",
        description: "",
      }

      form.reset({
        date: new Date(),
        timeSlots: [defaultTimeSlot],
      })
      setTimeSlots([defaultTimeSlot])

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating time slots:", error)
      toast.error("Erreur lors de la création des créneaux horaires")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Générer les options d'heures (par tranches de 30 minutes)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()
  const startTime = form.watch("startTime")

  // Fonction pour formater la date pour l'input date
  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  // Fonction pour parser la date depuis l'input
  const parseDateFromInput = (dateString: string) => {
    return new Date(dateString + "T00:00:00")
  }

  // Date minimale (aujourd'hui)
  const minDate = formatDateForInput(new Date())

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-white">Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  min={minDate}
                  value={field.value ? formatDateForInput(field.value) : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      field.onChange(parseDateFromInput(e.target.value))
                    }
                  }}
                  className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </FormControl>
              <FormDescription className="text-gray-400">Sélectionnez la date de la séance photo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Créneaux horaires</h3>
            <Button
              type="button"
              onClick={addTimeSlot}
              size="sm"
              className="bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] text-white font-medium border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un créneau
            </Button>
          </div>

          {timeSlots.map((_, index) => (
            <div key={index} className="border border-[#3a3a3a] rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-white">Créneau {index + 1}</h4>
                {timeSlots.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`timeSlots.${index}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Heure de début</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <select
                          {...field}
                          className="w-full pl-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7145] bg-[#2a2a2a] border-[#3a3a3a] text-white appearance-none cursor-pointer"
                        >
                          {timeOptions.map((time) => (
                            <option key={`start-${index}-${time}`} value={time} className="bg-[#2a2a2a] text-white">
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`timeSlots.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Heure de fin</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <select
                          {...field}
                          className="w-full pl-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7145] bg-[#2a2a2a] border-[#3a3a3a] text-white appearance-none cursor-pointer"
                        >
                          {timeOptions
                            .filter((time) => time > form.watch(`timeSlots.${index}.startTime`))
                            .map((time) => (
                              <option key={`end-${index}-${time}`} value={time} className="bg-[#2a2a2a] text-white">
                                {time}
                              </option>
                            ))}
                        </select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`timeSlots.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Prix (€)</FormLabel>
                      <div className="relative">
                        <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
                            className="pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`timeSlots.${index}.location`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Lieu</FormLabel>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <FormControl>
                          <Input
                            placeholder="Paris, France"
                            className="pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`timeSlots.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informations supplémentaires sur la séance..."
                        className="resize-none bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] text-white font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Création en cours..."
            : `Créer ${timeSlots.length} créneau${timeSlots.length > 1 ? "x" : ""}`}
        </Button>
      </form>
    </Form>
  )
}
