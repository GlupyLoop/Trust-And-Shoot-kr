"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Trash2, Plus, Clock, MapPin, Euro } from "lucide-react"

// Types
interface Convention {
  id: string
  name: string
  location: string
  startDate: Date
  endDate: Date
  description?: string
}

interface TimeSlot {
  id: string
  conventionId: string
  photographerId: string
  date: Date
  startTime: string
  endTime: string
  price: number
  isBooked: boolean
  location?: string
  notes?: string
}

export default function ManageSlotsClientPage() {
  const { id } = useParams()
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [convention, setConvention] = useState<Convention | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddSlotForm, setShowAddSlotForm] = useState(false)
  const [newSlot, setNewSlot] = useState({
    startTime: "10:00",
    endTime: "11:00",
    price: "50",
    notes: "",
    location: "",
  })
  const [processingSlot, setProcessingSlot] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user && userData?.userType !== "photographer") {
      router.push("/")
      return
    }

    // Simuler le chargement des données
    const loadData = async () => {
      try {
        setLoading(true)
        // Ici vous ajouteriez la logique pour charger la convention et les créneaux
        // Pour l'instant, on simule avec des données factices

        const mockConvention: Convention = {
          id: id as string,
          name: "Japan Expo 2024",
          location: "Paris Nord Villepinte",
          startDate: new Date("2024-07-04"),
          endDate: new Date("2024-07-07"),
          description: "Le plus grand événement de la culture japonaise en Europe",
        }

        setConvention(mockConvention)
        setTimeSlots([])
        setError(null)
      } catch (err) {
        setError("Erreur lors du chargement des données")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user && userData) {
      loadData()
    }
  }, [id, user, userData, authLoading, router])

  const handleAddSlot = async () => {
    if (!selectedDate || !user || !convention) return

    try {
      setProcessingSlot(true)

      const slot: TimeSlot = {
        id: Date.now().toString(),
        conventionId: convention.id,
        photographerId: user.uid,
        date: selectedDate,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        price: Number.parseFloat(newSlot.price),
        isBooked: false,
        location: newSlot.location,
        notes: newSlot.notes,
      }

      setTimeSlots((prev) => [...prev, slot])
      setNewSlot({
        startTime: "10:00",
        endTime: "11:00",
        price: "50",
        notes: "",
        location: "",
      })
      setShowAddSlotForm(false)
      toast.success("Créneau ajouté avec succès")
    } catch (err) {
      toast.error("Erreur lors de l'ajout du créneau")
      console.error(err)
    } finally {
      setProcessingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId))
      toast.success("Créneau supprimé")
    } catch (err) {
      toast.error("Erreur lors de la suppression")
      console.error(err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Retour</Button>
        </div>
      </div>
    )
  }

  if (!convention) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Convention non trouvée</p>
          <Button onClick={() => router.back()}>Retour</Button>
        </div>
      </div>
    )
  }

  const filteredSlots = selectedDate
    ? timeSlots.filter((slot) => slot.date.toDateString() === selectedDate.toDateString())
    : timeSlots

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            ← Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gérer mes créneaux</h1>
          <p className="text-gray-600">
            {convention.name} - {convention.location}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Sélectionner une date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < convention.startDate || date > convention.endDate}
                  className="rounded-md border"
                />
                {selectedDate && (
                  <div className="mt-4">
                    <Button onClick={() => setShowAddSlotForm(true)} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un créneau
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Liste des créneaux */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Créneaux disponibles
                  {selectedDate && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      pour le {selectedDate.toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {selectedDate ? "Aucun créneau pour cette date" : "Sélectionnez une date pour voir vos créneaux"}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSlots.map((slot) => (
                      <div key={slot.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Euro className="w-4 h-4 mr-1" />
                                {slot.price}€
                              </div>
                              {slot.location && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {slot.location}
                                </div>
                              )}
                            </div>
                            {slot.notes && <p className="text-sm text-gray-600 mt-2">{slot.notes}</p>}
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  slot.isBooked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                }`}
                              >
                                {slot.isBooked ? "Réservé" : "Disponible"}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={slot.isBooked}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Formulaire d'ajout de créneau */}
        {showAddSlotForm && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Ajouter un créneau</CardTitle>
                <p className="text-sm text-gray-600">{selectedDate.toLocaleDateString("fr-FR")}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Heure de début</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) =>
                        setNewSlot((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Heure de fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) =>
                        setNewSlot((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Prix (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newSlot.price}
                    onChange={(e) =>
                      setNewSlot((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="location">Lieu (optionnel)</Label>
                  <Input
                    id="location"
                    value={newSlot.location}
                    onChange={(e) =>
                      setNewSlot((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Ex: Stand A12, Salle photo..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={newSlot.notes}
                    onChange={(e) =>
                      setNewSlot((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Informations supplémentaires..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddSlotForm(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={handleAddSlot} disabled={processingSlot} className="flex-1">
                    {processingSlot ? "Ajout..." : "Ajouter"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
