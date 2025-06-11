"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTimeSlot } from "@/lib/bookings"
import { Calendar, Clock, MapPin, Euro, Plus, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface TimeSlotFormProps {
  photographerId: string
  onSuccess?: () => void
}

export function TimeSlotForm({ photographerId, onSuccess }: TimeSlotFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    price: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.location || !formData.price) {
      return
    }

    try {
      setLoading(true)
      await createTimeSlot({
        photographerId,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        price: Number.parseFloat(formData.price),
        description: formData.description,
        status: "available",
      })

      // Reset form
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        price: "",
        description: "",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating time slot:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Time Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#fffbea]">Date et horaires</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[#fffbea] font-medium">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="bg-[#2a2a2a] border-[#3a3a3a] text-[#fffbea] focus:border-[#ff7145] focus:ring-[#ff7145]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-[#fffbea] font-medium">
                Heure de début
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="bg-[#2a2a2a] border-[#3a3a3a] text-[#fffbea] focus:border-[#ff7145] focus:ring-[#ff7145]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-[#fffbea] font-medium">
                Heure de fin
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="bg-[#2a2a2a] border-[#3a3a3a] text-[#fffbea] focus:border-[#ff7145] focus:ring-[#ff7145]/20"
              />
            </div>
          </div>
        </div>

        {/* Location and Price Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#fffbea]">Lieu et tarif</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[#fffbea] font-medium">
                Lieu de la séance
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Paris, Studio photo..."
                required
                className="bg-[#2a2a2a] border-[#3a3a3a] text-[#fffbea] focus:border-[#ff7145] focus:ring-[#ff7145]/20 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-[#fffbea] font-medium">
                Prix (€)
              </Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#ff7145]" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="50.00"
                  required
                  className="pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-[#fffbea] focus:border-[#ff7145] focus:ring-[#ff7145]/20 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#fffbea]">Description (optionnel)</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#fffbea] font-medium">
              Détails de la séance
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez le type de séance, le matériel disponible, les conditions particulières..."
              rows={4}
              className="bg-[#2a2a2a] border-[#3a3a3a] text-[#fffbea] focus:border-[#ff7145] focus:ring-[#ff7145]/20 placeholder:text-gray-500 resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#2a2a2a]">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#ff7145]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Création en cours...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Créer le créneau</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
