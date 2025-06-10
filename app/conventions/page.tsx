"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { getConventions, type Convention } from "@/lib/firebase"
import { Calendar } from "lucide-react"
import AnimatedSection from "@/components/ui/animated-section"
import ErrorMessage from "@/components/ui/error-message"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { ConventionCard } from "@/components/convention-card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Example conventions to display when no real conventions are found
const exampleConventions: Convention[] = [
  {
    id: "example-japan-expo",
    name: "Japan Expo 2025",
    location: "Paris, France",
    startDate: new Date(2025, 6, 15), // 15 juillet 2025
    endDate: new Date(2025, 6, 18), // 18 juillet 2025
    description:
      "Le plus grand salon européen dédié à la culture japonaise et aux mangas. Venez rencontrer des artistes, participer à des concours de cosplay et découvrir les dernières nouveautés.",
    imageUrl: "/placeholder.svg?height=200&width=400&text=Japan+Expo+2025",
  },
  {
    id: "example-comic-con",
    name: "Comic-Con Paris 2025",
    location: "Paris, France",
    startDate: new Date(2025, 9, 25), // 25 octobre 2025
    endDate: new Date(2025, 9, 27), // 27 octobre 2025
    description:
      "Le rendez-vous incontournable des fans de comics, de cinéma et de séries TV. Rencontrez vos acteurs préférés, découvrez les dernières annonces et participez à des panels exclusifs.",
    imageUrl: "/placeholder.svg?height=200&width=400&text=Comic-Con+Paris+2025",
  },
  {
    id: "example-fantasy-basel",
    name: "Fantasy Basel 2025",
    location: "Bâle, Suisse",
    startDate: new Date(2025, 4, 13), // 13 mai 2025
    endDate: new Date(2025, 4, 15), // 15 mai 2025
    description:
      "Le plus grand événement suisse dédié à la pop culture, aux jeux vidéo, aux comics et au cosplay. Une expérience immersive pour tous les fans de fantasy et de science-fiction.",
    imageUrl: "/placeholder.svg?height=200&width=400&text=Fantasy+Basel+2025",
  },
]

export default function ConventionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conventions, setConventions] = useState<Convention[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)

  // Formater la date pour l'affichage
  const formatDateRange = (startDate: Date, endDate: Date) => {
    // Si même jour
    if (startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, "dd MMMM yyyy", { locale: fr })
    }

    // Si même mois
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${format(startDate, "dd")} - ${format(endDate, "dd MMMM yyyy", { locale: fr })}`
    }

    // Différents mois
    return `${format(startDate, "dd MMM")} - ${format(endDate, "dd MMM yyyy", { locale: fr })}`
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    const fetchConventions = async () => {
      try {
        setLoading(true)
        const data = await getConventions(20)
        setConventions(data)
        setShowExamples(data.length === 0) // Show examples if no conventions found
      } catch (err) {
        console.error("Error fetching conventions:", err)
        setError("Impossible de charger les conventions. Veuillez réessayer plus tard.")
        setShowExamples(true) // Show examples on error
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchConventions()
    }
  }, [user, authLoading, router])

  const displayedConventions = showExamples ? exampleConventions : conventions

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#141414] pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl font-bold flex items-center">
                <Calendar className="mr-2 text-[#ff7145]" />
                Calendrier des Conventions
              </h1>

              {showExamples && (
                <div className="mt-2 md:mt-0 px-3 py-1 bg-amber-600/20 text-amber-400 rounded-md text-sm flex items-center">
                  <span>Exemples de conventions affichés</span>
                </div>
              )}
            </div>
          </AnimatedSection>

          {error && (
            <ErrorMessage
              message="Impossible de charger les conventions. Veuillez réessayer."
              onRetry={() => {
                setLoading(true)
                setError(null)
                getConventions(20)
                  .then((data) => {
                    setConventions(data)
                    setShowExamples(data.length === 0)
                  })
                  .catch((err) => {
                    console.error("Error refetching conventions:", err)
                    setError("Impossible de charger les conventions. Veuillez réessayer plus tard.")
                    setShowExamples(true)
                  })
                  .finally(() => setLoading(false))
              }}
              className="mb-6"
            />
          )}

          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : displayedConventions && displayedConventions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedConventions.map((convention) => (
                <ConventionCard key={convention.id} convention={convention} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucune convention à venir n'a été trouvée.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
