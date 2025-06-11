"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import { BookingCalendar } from "@/components/bookings/booking-calendar"
import { BookingRequestForm } from "@/components/bookings/booking-request-form"
import type { TimeSlot } from "@/types/booking"
import { getUserById } from "@/lib/firebase"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import AnimatedSection from "@/components/ui/animated-section"

export default function BookPhotographerPageClient() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [photographerName, setPhotographerName] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    const fetchPhotographerData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const photographerData = await getUserById(id as string)

        if (photographerData) {
          setPhotographerName(photographerData.displayName || "Photographe")
        }
      } catch (error) {
        console.error("Error fetching photographer data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && !user) {
      router.push("/login")
    } else {
      fetchPhotographerData()
    }
  }, [id, user, authLoading, router])

  const handleBookSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setShowBookingForm(true)
  }

  const handleCloseBookingForm = () => {
    setShowBookingForm(false)
    setSelectedTimeSlot(null)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] pt-20 pb-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff7145]/5 via-transparent to-[#ff7145]/5 pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <AnimatedSection>
            <motion.button
              onClick={() => router.back()}
              className="flex items-center gap-3 mb-8 text-[#fffbea] font-semibold hover:text-[#ff7145] transition-colors group"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-[#2a2a2a] to-[#2e2e2e] rounded-xl flex items-center justify-center border border-[#3a3a3a]/50 group-hover:border-[#ff7145]/50 transition-all">
                <ArrowLeft size={20} />
              </div>
              <span>RETOUR AU PROFIL</span>
            </motion.button>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-gradient-to-r from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] rounded-3xl p-8 mb-8 border border-[#2a2a2a]/50 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#ff7145] to-[#ff8d69] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff7145]/25">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[#fffbea] mb-2">Réserver avec {photographerName}</h1>
                    <p className="text-gray-400">Sélectionnez un créneau disponible pour votre séance photo</p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push(`/photographer/${id}`)}
                  variant="outline"
                  className="border-[#ff7145]/50 bg-[#ff7145]/10 text-[#ff7145] hover:bg-[#ff7145]/20 hover:border-[#ff7145] transition-all"
                >
                  <User className="h-4 w-4 mr-2" />
                  Voir le profil
                </Button>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <BookingCalendar photographerId={id as string} onBookSlot={handleBookSlot} />
          </AnimatedSection>

          <BookingRequestForm
            isOpen={showBookingForm}
            onClose={handleCloseBookingForm}
            timeSlot={selectedTimeSlot}
            cosplayerId={user?.uid || ""}
          />
        </div>
      </main>
    </>
  )
}
