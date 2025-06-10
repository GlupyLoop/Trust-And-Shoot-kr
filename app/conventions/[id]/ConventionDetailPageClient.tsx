"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import {
  getConventionById,
  getPhotographersByConvention,
  addPhotographerToConvention,
  removePhotographerFromConvention,
  type Convention,
  type PhotographerData,
} from "@/lib/firebase"
import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, ArrowLeft, Globe, Camera, Star, Check, Loader, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import AnimatedSection from "@/components/ui/animated-section"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

// Données statiques pour les conventions d'exemple
const exampleConventions = {
  "example-convention": {
    id: "example-convention",
    name: "Japan Expo 2025",
    location: "Paris, France",
    startDate: new Date(2025, 6, 15), // 15 juillet 2025
    endDate: new Date(2025, 6, 18), // 18 juillet 2025
    description:
      "Le plus grand salon européen dédié à la culture japonaise et aux mangas. Venez rencontrer des artistes, participer à des concours de cosplay et découvrir les dernières nouveautés. Japan Expo est l'événement incontournable pour tous les fans de culture japonaise, avec plus de 250 000 visiteurs chaque année. Au programme : des invités prestigieux, des concerts, des démonstrations d'arts martiaux, des ateliers de cuisine japonaise, et bien sûr, le célèbre concours de cosplay European Cosplay Gathering.",
    category: "Manga",
    imageUrl: "/placeholder.svg?height=400&width=1200&text=Japan+Expo+2025",
    website: "https://www.japan-expo-paris.com",
  },
  "comic-con-brussels": {
    id: "comic-con-brussels",
    name: "Comic Con Brussels",
    location: "Bruxelles, Belgique",
    startDate: new Date(2025, 2, 12), // 12 mars 2025
    endDate: new Date(2025, 2, 13), // 13 mars 2025
    description:
      "Le Comic Con de Bruxelles est l'événement incontournable pour les fans de comics, de cinéma et de séries TV. Rencontrez vos acteurs préférés et découvrez les dernières nouveautés. Cet événement rassemble des milliers de passionnés de pop culture, avec des séances de dédicaces, des panels de discussion, des expositions exclusives et des avant-premières. Ne manquez pas l'occasion de rencontrer des artistes de renom et de participer à des activités interactives tout au long du week-end.",
    category: "Comics",
    imageUrl: "/placeholder.svg?height=400&width=1200&text=Comic+Con+Brussels",
    website: "https://www.comicconbrussels.com",
  },
  "made-in-asia": {
    id: "made-in-asia",
    name: "Made In Asia",
    location: "Bruxelles, Belgique",
    startDate: new Date(2025, 8, 5), // 5 septembre 2025
    endDate: new Date(2025, 8, 7), // 7 septembre 2025
    description:
      "Made In Asia est le plus grand salon belge dédié à la culture asiatique. Découvrez des animations, des concours de cosplay, des concerts et bien plus encore. Avec plus de 150 exposants et des dizaines d'activités, Made In Asia vous plonge dans l'univers fascinant de la culture asiatique. Au programme : des démonstrations de cuisine, des ateliers de calligraphie, des tournois de jeux vidéo, des projections d'anime et des performances de K-pop qui raviront tous les fans.",
    category: "Anime",
    imageUrl: "/placeholder.svg?height=400&width=1200&text=Made+In+Asia",
    website: "https://www.madeinasia.be",
  },
}

// Tableau vide pour les photographes d'exemple
const examplePhotographers: PhotographerData[] = []

export default function ConventionDetailPageClient() {
  const { id } = useParams()
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [convention, setConvention] = useState<Convention | null>(null)
  const [photographers, setPhotographers] = useState<PhotographerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAttending, setIsAttending] = useState(false)
  const [processingAttendance, setProcessingAttendance] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    const fetchConventionData = async () => {
      try {
        setLoading(true)

        // Vérifier si c'est une convention d'exemple
        if (typeof id === "string" && exampleConventions[id as keyof typeof exampleConventions]) {
          const exampleConvention = exampleConventions[id as keyof typeof exampleConventions]
          setConvention(exampleConvention as Convention)

          // Pas de photographes d'exemple
          setPhotographers([])

          // Vérifier si l'utilisateur actuel (s'il est photographe) participe à cette convention
          if (userData?.role === "photographer" && userData.conventions) {
            setIsAttending(userData.conventions.includes(id as string))
          }

          setLoading(false)
          return
        }

        // Si ce n'est pas une convention d'exemple, essayer de la récupérer depuis Firebase
        const conventionData = await getConventionById(id as string)
        if (!conventionData) {
          setError("Convention non trouvée")
          return
        }

        setConvention(conventionData)

        // Récupérer les photographes qui participent à cette convention
        const photographersData = await getPhotographersByConvention(id as string)
        setPhotographers(photographersData)

        // Vérifier si l'utilisateur actuel (s'il est photographe) participe à cette convention
        if (userData?.role === "photographer" && userData.conventions) {
          setIsAttending(userData.conventions.includes(id as string))
        }
      } catch (err) {
        console.error("Error fetching convention data:", err)
        setError("Impossible de charger les données de la convention. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      fetchConventionData()
    }
  }, [id, user, userData, authLoading, router])

  // Gérer la participation à la convention (pour les photographes)
  const handleAttendanceToggle = async () => {
    if (!user || userData?.role !== "photographer") {
      toast.error("Seuls les photographes peuvent s'inscrire aux conventions")
      return
    }

    try {
      setProcessingAttendance(true)

      if (isAttending) {
        // Se désinscrire de la convention
        await removePhotographerFromConvention(user.uid, id as string)
        toast.success("Vous n'êtes plus inscrit à cette convention")
        setIsAttending(false)

        // Mettre à jour la liste des photographes
        setPhotographers(photographers.filter((p) => p.uid !== user.uid))
      } else {
        // S'inscrire à la convention
        await addPhotographerToConvention(user.uid, id as string)
        toast.success("Vous êtes maintenant inscrit à cette convention")
        setIsAttending(true)

        // Ajouter le photographe à la liste
        if (userData) {
          setPhotographers([...photographers, userData as PhotographerData])
        }
      }
    } catch (err) {
      console.error("Error toggling attendance:", err)
      toast.error("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setProcessingAttendance(false)
    }
  }

  // Formater la date pour l'affichage
  const formatDateRange = (startDate: Date | any, endDate: Date | any) => {
    if (!startDate || !endDate) return "Dates non disponibles"

    const start = startDate instanceof Date ? startDate : new Date(startDate)
    const end = endDate instanceof Date ? endDate : new Date(endDate)

    // Si même jour
    if (start.toDateString() === end.toDateString()) {
      return format(start, "dd MMMM yyyy", { locale: fr })
    }

    // Si même mois
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, "dd")} - ${format(end, "dd MMMM yyyy", { locale: fr })}`
    }

    // Différents mois
    return `${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy", { locale: fr })}`
  }

  // Afficher le chargement si l'authentification est en cours
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  // Afficher l'erreur
  if (error || !convention) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#141414] pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-red-500/10 border border-red-500/30 text-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Erreur</h2>
              <p>{error || "Convention non trouvée"}</p>
              <motion.button
                onClick={() => router.push("/conventions")}
                className="mt-4 bg-[#ff7145] text-white py-2 px-4 rounded-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retour aux conventions
              </motion.button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#141414] pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <AnimatedSection>
            <motion.button
              onClick={() => router.push("/conventions")}
              className="flex items-center gap-2 mb-6 text-[#fffbea] font-bold"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              <span>RETOUR AUX CONVENTIONS</span>
            </motion.button>
          </AnimatedSection>

          {/* En-tête de la convention */}
          <AnimatedSection>
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] mb-6">
              <div className="relative h-64 md:h-80">
                <Image
                  src={convention.imageUrl || "/placeholder.svg?height=400&width=1200&text=Convention"}
                  alt={convention.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>

                {convention.category && (
                  <div className="absolute top-4 right-4 bg-[#ff7145] text-white px-3 py-1 rounded-full">
                    {convention.category}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{convention.name}</h1>

                  <div className="flex flex-wrap gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <MapPin size={18} className="text-[#ff7145]" />
                      <span>{convention.location}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock size={18} className="text-[#ff7145]" />
                      <span>{formatDateRange(convention.startDate, convention.endDate)}</span>
                    </div>

                    {convention.website && (
                      <Link
                        href={
                          convention.website.startsWith("http") ? convention.website : `https://${convention.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#ff7145] transition-colors"
                      >
                        <Globe size={18} className="text-[#ff7145]" />
                        <span>Site web</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-3">À propos de cet événement</h2>
                    <p className="text-gray-300">{convention.description}</p>
                  </div>

                  <div className="md:w-64 flex flex-col gap-3">
                    {userData?.role === "photographer" && (
                      <motion.button
                        onClick={handleAttendanceToggle}
                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium ${
                          isAttending
                            ? "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
                            : "bg-[#ff7145] text-white hover:bg-[#ff8d69]"
                        } transition-colors`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={processingAttendance}
                      >
                        {processingAttendance ? (
                          <Loader size={18} className="animate-spin" />
                        ) : isAttending ? (
                          <>
                            <Check size={18} />
                            <span>Je participe</span>
                          </>
                        ) : (
                          <>
                            <Calendar size={18} />
                            <span>Je veux participer</span>
                          </>
                        )}
                      </motion.button>
                    )}

                    {isAttending && userData?.role === "photographer" && (
                      <Link href={`/conventions/${id}/manage-slots`}>
                        <motion.button
                          className="w-full flex items-center justify-center gap-2 bg-[#ff7145] text-white py-2 px-4 rounded-md font-medium hover:bg-[#ff8d69] transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Clock size={18} />
                          <span>Gérer mes créneaux</span>
                        </motion.button>
                      </Link>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <Users size={18} className="text-[#ff7145]" />
                      <span>{photographers.length} photographes présents</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Liste des photographes */}
          <AnimatedSection delay={0.1}>
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Camera className="mr-2 text-[#ff7145]" />
                Photographes présents
              </h2>

              {photographers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucun photographe n'a encore confirmé sa présence à cette convention.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photographers.map((photographer, index) => (
                    <AnimatedSection key={photographer.uid} delay={0.1 + index * 0.05} direction="up">
                      <motion.div
                        className="bg-[#2a2a2a] rounded-lg p-4 border border-[#3a3a3a]"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 10px 30px -15px rgba(255, 113, 69, 0.3)",
                          borderColor: "rgba(255, 113, 69, 0.5)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#3a3a3a] border-2 border-[#ff7145]">
                            {photographer.photoURL ? (
                              <Image
                                src={photographer.photoURL || "/placeholder.svg"}
                                alt={photographer.displayName || "Photographer"}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera size={24} className="text-[#ff7145]" />
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold">{photographer.displayName || "Photographer"}</h3>

                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={
                                    i < Math.floor(photographer.averageRating || 0)
                                      ? "text-[#ff7145]"
                                      : "text-[#3a3a3a]"
                                  }
                                  fill={i < Math.floor(photographer.averageRating || 0) ? "#ff7145" : "none"}
                                />
                              ))}
                              <span className="text-xs text-gray-400 ml-1">({photographer.totalReviews || 0})</span>
                            </div>

                            {photographer.location && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin size={10} />
                                <span>{photographer.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {photographer.specialties?.slice(0, 3).map((specialty, i) => (
                            <span key={i} className="bg-[#3a3a3a] text-xs px-2 py-0.5 rounded-full">
                              {specialty}
                            </span>
                          ))}
                          {(photographer.specialties?.length || 0) > 3 && (
                            <span className="text-xs text-gray-400">
                              +{(photographer.specialties?.length || 0) - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <Link href={`/photographer/${photographer.uid}`}>
                            <motion.button
                              className="text-[#ff7145] text-sm font-medium flex items-center gap-1"
                              whileHover={{ x: 5 }}
                            >
                              <span>Voir le profil</span>
                              <ArrowLeft size={14} className="rotate-180" />
                            </motion.button>
                          </Link>

                          <Link href={`/conventions/${id}/photographer/${photographer.uid}`}>
                            <motion.button
                              className="bg-[#ff7145] text-white text-sm py-1 px-3 rounded-md"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Réserver
                            </motion.button>
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatedSection>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </main>
    </>
  )
}
