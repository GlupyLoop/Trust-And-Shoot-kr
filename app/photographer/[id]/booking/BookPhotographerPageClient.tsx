"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import { BookingCalendar } from "@/components/bookings/booking-calendar"
import { BookingRequestForm } from "@/components/bookings/booking-request-form"
import type { TimeSlot } from "@/types/booking"
import { getUserById } from "@/lib/firebase"
import { ArrowLeft, Calendar } from "lucide-react"
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
      <main className="min-h-screen bg-[#141414] pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <AnimatedSection>
            <motion.button
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-6 text-[#fffbea] font-bold"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              <span>RETOUR AU PROFIL</span>
            </motion.button>
          </AnimatedSection>

          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl font-bold flex items-center">
                <Calendar className="mr-2 text-[#ff7145]" />
                Réserver avec {photographerName}
              </h1>

              <Button
                onClick={() => router.push(`/photographer/${id}`)}
                className="mt-4 md:mt-0 bg-[#ff7145] text-white hover:bg-[#e55a35] border border-[#ff7145] hover:border-[#e55a35]"
              >
                Voir le profil
              </Button>
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
