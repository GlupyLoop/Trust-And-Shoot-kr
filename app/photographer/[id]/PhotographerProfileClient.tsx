"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star,
  ArrowLeft,
  Calendar,
  Camera,
  MapPin,
  Award,
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  Mail,
  X,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Linkedin,
} from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import {
  db,
  type PhotographerData,
  addFavoritePhotographer,
  removeFavoritePhotographer,
  isFavoritePhotographer,
} from "@/lib/firebase"
import AnimatedSection from "@/components/ui/animated-section"
import ParallaxSection from "@/components/ui/parallax-section"
import ReviewList from "@/components/reviews/review-list"
import ReviewForm from "@/components/reviews/review-form"
import RatingSummary from "@/components/reviews/rating-summary"
import { toast } from "sonner"
// Ajouter l'import pour ContactButton
import ContactButton from "@/components/contact-button"
// Ajoutez l'import pour les constantes de tags
import { PHOTOGRAPHER_TAGS } from "@/constants/photographer-tags"
import CountryFlag from "@/components/ui/country-flag"

export default function PhotographerProfileClient({ id }: { id: string }) {
  const router = useRouter()
  const { user, userData, loading } = useAuth()
  const [photographer, setPhotographer] = useState<PhotographerData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshReviews, setRefreshReviews] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const fetchPhotographer = async () => {
      try {
        setPageLoading(true)
        const docRef = doc(db, "users", id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data() as PhotographerData
          if (data.role === "photographer") {
            setPhotographer(data)

            // Vérifier si le photographe est dans les favoris
            if (user && userData?.role === "cosplayer") {
              const isInFavorites = await isFavoritePhotographer(user.uid, id as string)
              setIsFavorite(isInFavorites)
            }
          } else {
            setError("Cet utilisateur n'est pas un photographe")
          }
        } else {
          setError("Photographe non trouvé")
        }
      } catch (err) {
        console.error("Error fetching photographer:", err)
        setError("Impossible de charger le profil du photographe")
      } finally {
        setPageLoading(false)
      }
    }

    if (id && !loading && user) {
      fetchPhotographer()
    }
  }, [id, user, userData, loading, router])

  const handleReviewSubmitted = () => {
    // Rafraîchir les reviews et les données du photographe
    setRefreshReviews((prev) => prev + 1)

    // Rafraîchir les données du photographe pour mettre à jour les statistiques
    const fetchUpdatedPhotographer = async () => {
      try {
        const docRef = doc(db, "users", id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data() as PhotographerData
          setPhotographer(data)
        }
      } catch (err) {
        console.error("Error refreshing photographer data:", err)
      }
    }

    fetchUpdatedPhotographer()
  }

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
    // Empêcher le défilement du body quand la modal est ouverte
    document.body.style.overflow = "hidden"
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    // Réactiver le défilement du body
    document.body.style.overflow = "auto"
  }

  const navigateImage = (direction: "next" | "prev") => {
    if (selectedImageIndex === null || !photographer?.portfolio) return

    const portfolioLength = photographer.portfolio.length
    if (direction === "next") {
      setSelectedImageIndex((selectedImageIndex + 1) % portfolioLength)
    } else {
      setSelectedImageIndex((selectedImageIndex - 1 + portfolioLength) % portfolioLength)
    }
  }

  // Gérer les touches du clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      switch (e.key) {
        case "Escape":
          closeImageModal()
          break
        case "ArrowRight":
          navigateImage("next")
          break
        case "ArrowLeft":
          navigateImage("prev")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, selectedImageIndex])

  // Show loading state
  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24 bg-[#141414]">
          <div className="bg-[#1a1a1a] p-6 rounded-lg text-center border border-[#2a2a2a]">
            <h2 className="text-xl font-bold mb-2 text-[#fffbea]">Erreur</h2>
            <p className="text-gray-300">{error}</p>
            <motion.button
              onClick={() => router.push("/")}
              className="mt-4 bg-[#ff7145] text-white py-2 px-4 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retour à l'accueil
            </motion.button>
          </div>
        </main>
      </>
    )
  }

  if (!photographer) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24 bg-[#141414]">
          <div className="bg-[#1a1a1a] p-6 rounded-lg text-center border border-[#2a2a2a]">
            <h2 className="text-xl font-bold mb-2 text-[#fffbea]">Photographe non trouvé</h2>
            <p className="text-gray-300">Le photographe que vous recherchez n'existe pas ou a été supprimé.</p>
            <motion.button
              onClick={() => router.push("/")}
              className="mt-4 bg-[#ff7145] text-white py-2 px-4 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retour à l'accueil
            </motion.button>
          </div>
        </main>
      </>
    )
  }

  // Dans le composant PhotographerProfile, ajoutez une fonction pour obtenir les informations d'un tag
  // Ajoutez cette fonction avant le return
  const getTagInfo = (categoryId: string, tagId: string) => {
    const category = PHOTOGRAPHER_TAGS.find((c) => c.id === categoryId)
    const tag = category?.tags.find((t) => t.id === tagId)
    return tag
  }

  // Fonction utilitaire pour les URLs des réseaux sociaux
  const getSocialMediaUrl = (type: string, username: string): string => {
    if (!username) return ""

    // Nettoyer le nom d'utilisateur (enlever @ si présent)
    const cleanUsername = username.startsWith("@") ? username.substring(1) : username

    switch (type) {
      case "instagram":
        return `https://instagram.com/${cleanUsername}`
      case "facebook":
        return `https://facebook.com/${cleanUsername}`
      case "twitter":
        return `https://twitter.com/${cleanUsername}`
      case "linkedin":
        return `https://linkedin.com/in/${cleanUsername}`
      default:
        return ""
    }
  }

  const handleFavoriteToggle = async () => {
    if (!user || userData?.role !== "cosplayer") {
      toast.error("Seuls les cosplayers peuvent ajouter des photographes en favoris")
      return
    }

    setFavoriteLoading(true)

    try {
      if (isFavorite) {
        await removeFavoritePhotographer(user.uid, id as string)
        setIsFavorite(false)
        toast.success("Photographe retiré des favoris")
      } else {
        await addFavoritePhotographer(user.uid, id as string)
        setIsFavorite(true)
        toast.success("Photographe ajouté aux favoris")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Une erreur est survenue")
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#141414] pt-20 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <ParallaxSection speed={0.1} direction="down" className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#141414] opacity-90"></div>
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-10"></div>
          </ParallaxSection>

          <div className="container mx-auto px-4 max-w-6xl relative z-10 py-8">
            <motion.button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 mb-6 text-[#fffbea] font-bold"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              <span>RETOUR AUX PHOTOGRAPHES</span>
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 max-w-6xl mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Photographer Profile and Details */}
            <div className="lg:col-span-1">
              {/* Profile Section */}
              <AnimatedSection>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2a] mb-6">
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                      <motion.div
                        className="w-32 h-32 rounded-xl overflow-hidden border-4 border-[#ff7145] shadow-xl mb-4"
                        whileHover={{ scale: 1.05 }}
                      >
                        {photographer?.photoURL ? (
                          <Image
                            src={photographer.photoURL || "/placeholder.svg"}
                            alt={photographer.displayName || "Photographer"}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                            <Camera size={48} className="text-[#ff7145]" />
                          </div>
                        )}
                      </motion.div>

                      <h1 className="text-2xl font-bold text-[#fffbea] mb-2">
                        {photographer?.displayName || "Photographe sans nom"}
                      </h1>

                      <div className="flex items-center gap-3 justify-center mb-3">
                        <div className="flex items-center bg-[#2a2a2a]/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < Math.floor(photographer?.averageRating || 0) ? "text-[#ff7145]" : "text-[#3a3a3a]"
                                }
                                fill={i < Math.floor(photographer?.averageRating || 0) ? "#ff7145" : "none"}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-[#fffbea] ml-2">
                            {(photographer?.averageRating || 0).toFixed(1)} ({photographer?.totalReviews || 0})
                          </span>
                        </div>

                        {photographer?.location && (
                          <div className="flex items-center gap-1 text-[#fffbea]/90">
                            <MapPin size={16} />
                            <span className="flex items-center gap-1">
                              <CountryFlag country={photographer.location} width={16} height={12} className="mr-1" />
                              {photographer.location}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-[#fffbea]/90 mb-4">
                        {photographer?.bio || "Ce photographe n'a pas encore ajouté de bio."}
                      </p>

                      {/* Social Media Icons */}
                      {photographer?.socialMedia &&
                        Object.entries(photographer.socialMedia).some(([_, value]) => value) && (
                          <div className="flex flex-wrap gap-3 justify-center mb-4">
                            {photographer.socialMedia.instagram && (
                              <motion.a
                                href={getSocialMediaUrl("instagram", photographer.socialMedia.instagram)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#2a2a2a]/80 backdrop-blur-sm text-[#fffbea] p-2 rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: "#E1306C" }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Instagram"
                              >
                                <Instagram size={18} />
                              </motion.a>
                            )}
                            {photographer.socialMedia.facebook && (
                              <motion.a
                                href={getSocialMediaUrl("facebook", photographer.socialMedia.facebook)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#2a2a2a]/80 backdrop-blur-sm text-[#fffbea] p-2 rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: "#1877F2" }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Facebook"
                              >
                                <Facebook size={18} />
                              </motion.a>
                            )}
                            {photographer.socialMedia.twitter && (
                              <motion.a
                                href={getSocialMediaUrl("twitter", photographer.socialMedia.twitter)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#2a2a2a]/80 backdrop-blur-sm text-[#fffbea] p-2 rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: "#1DA1F2" }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Twitter"
                              >
                                <Twitter size={18} />
                              </motion.a>
                            )}
                            {photographer.socialMedia.linkedin && (
                              <motion.a
                                href={getSocialMediaUrl("linkedin", photographer.socialMedia.linkedin)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#2a2a2a]/80 backdrop-blur-sm text-[#fffbea] p-2 rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: "#0A66C2" }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="LinkedIn"
                              >
                                <Linkedin size={18} />
                              </motion.a>
                            )}
                            {photographer.website && (
                              <motion.a
                                href={
                                  photographer.website.startsWith("http")
                                    ? photographer.website
                                    : `https://${photographer.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#2a2a2a]/80 backdrop-blur-sm text-[#fffbea] p-2 rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: "#ff7145" }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Website"
                              >
                                <Globe size={18} />
                              </motion.a>
                            )}
                          </div>
                        )}

                      <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {/* Afficher les spécialités */}
                        {photographer?.specialties &&
                          (showAllTags ? photographer.specialties : photographer.specialties.slice(0, 3)).map(
                            (specialty, index) => (
                              <span
                                key={`specialty-${index}`}
                                className="bg-[#2a2a2a]/60 text-[#fffbea]/80 text-xs px-2 py-1 rounded-md"
                              >
                                {specialty}
                              </span>
                            ),
                          )}

                        {/* Afficher les tags */}
                        {photographer?.tags &&
                          Object.entries(photographer.tags)
                            .flatMap(([categoryId, tagIds]) =>
                              tagIds
                                .map((tagId) => {
                                  const tagInfo = getTagInfo(categoryId, tagId)
                                  if (!tagInfo) return null
                                  return { categoryId, tagId, tagInfo }
                                })
                                .filter(Boolean),
                            )
                            .slice(0, showAllTags ? undefined : 3)
                            .map(({ categoryId, tagId, tagInfo }) => (
                              <span
                                key={`tag-${categoryId}-${tagId}`}
                                className="bg-[#2a2a2a]/60 text-[#fffbea]/80 text-xs px-2 py-1 rounded-md"
                              >
                                {tagInfo.name}
                              </span>
                            ))}

                        {/* Bouton pour afficher plus/moins */}
                        {(photographer?.specialties?.length || 0) +
                          (photographer?.tags ? Object.values(photographer.tags).flat().length : 0) >
                          3 && (
                          <button
                            onClick={() => setShowAllTags(!showAllTags)}
                            className="text-[#ff7145] text-xs px-2 py-1 hover:bg-[#2a2a2a]/30 rounded-md transition-colors"
                          >
                            {showAllTags
                              ? "Voir moins"
                              : `+${(photographer?.specialties?.length || 0) + (photographer?.tags ? Object.values(photographer.tags).flat().length : 0) - 3}`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Photographer Information */}
              <AnimatedSection delay={0.1}>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2a]">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#fffbea] mb-6 flex items-center">
                      <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                        <Award size={18} />
                      </span>
                      INFORMATIONS
                    </h2>

                    {/* Rating Summary */}
                    <RatingSummary photographer={photographer} />

                    {/* Action Buttons */}
                    <div className="mb-6">
                      <h3 className="font-medium text-[#fffbea] mb-3 flex items-center">
                        <Mail size={16} className="text-[#ff7145] mr-2" />
                        Actions
                      </h3>
                      <div className="space-y-3">
                        <ContactButton userId={id} variant="primary" className="w-full" />

                        <motion.button
                          className="w-full bg-[#2a2a2a] text-[#fffbea] py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02, backgroundColor: "#3a3a3a" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push(`/photographer/${id}/booking`)}
                        >
                          <Calendar size={18} />
                          <span>Réserver</span>
                        </motion.button>

                        {userData?.role === "cosplayer" && (
                          <motion.button
                            className={`w-full ${
                              isFavorite ? "bg-[#ff7145]" : "bg-[#2a2a2a]"
                            } text-[#fffbea] py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleFavoriteToggle}
                            disabled={favoriteLoading}
                          >
                            <Heart size={18} fill={isFavorite ? "#ffffff" : "none"} />
                            <span>{isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
                          </motion.button>
                        )}

                        <motion.button
                          className="w-full bg-[#2a2a2a] text-[#fffbea] py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02, backgroundColor: "#3a3a3a" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toast.info("Fonctionnalité de partage à venir")}
                        >
                          <Share2 size={18} />
                          <span>Partager</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Equipment */}
                    {photographer?.equipment && photographer.equipment.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-medium text-[#fffbea] mb-2 flex items-center">
                          <Camera size={16} className="text-[#ff7145] mr-2" />
                          Équipement
                        </h3>
                        <ul className="text-gray-300 space-y-1">
                          {photographer.equipment.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex items-center">
                              <ChevronRight size={14} className="text-[#ff7145] mr-1 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {photographer.equipment.length > 4 && (
                            <li className="text-[#ff7145] font-medium">+{photographer.equipment.length - 4} de plus</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Contact Info */}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Right Column - Portfolio and Reviews */}
            <div className="lg:col-span-2">
              {/* Portfolio Section */}
              <AnimatedSection delay={0.2}>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg mb-6 border border-[#2a2a2a]">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#fffbea] mb-6 flex items-center">
                      <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                        <Camera size={18} />
                      </span>
                      PORTFOLIO
                    </h2>

                    <div className="grid grid-cols-4 gap-3">
                      {photographer?.portfolio && photographer.portfolio.length > 0
                        ? photographer.portfolio.slice(0, 8).map((item, index) => (
                            <motion.div
                              key={item.id}
                              className="aspect-square rounded-lg overflow-hidden relative shadow-md cursor-pointer group"
                              whileHover={{ scale: 1.03, zIndex: 10 }}
                              onHoverStart={() => setHoveredImage(item.id)}
                              onHoverEnd={() => setHoveredImage(null)}
                              onClick={() => openImageModal(index)}
                            >
                              <Image
                                src={item.url || "/placeholder.svg"}
                                alt={item.title || "Image du portfolio"}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                {item.title && <h3 className="text-[#fffbea] font-medium text-sm">{item.title}</h3>}
                                {item.description && (
                                  <p className="text-[#fffbea]/80 text-xs line-clamp-2">{item.description}</p>
                                )}
                              </div>
                            </motion.div>
                          ))
                        : // Placeholder images if no portfolio
                          [...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="aspect-square rounded-lg overflow-hidden relative bg-[#2a2a2a] shadow-md"
                              whileHover={{ scale: 1.03, zIndex: 10 }}
                            >
                              <Image
                                src={`/placeholder-ukj10.png?height=200&width=200&text=Image${i + 1}`}
                                alt={`Image du portfolio ${i + 1}`}
                                fill
                                className="object-cover"
                              />
                            </motion.div>
                          ))}
                    </div>

                    {(photographer?.portfolio?.length || 0) > 8 && (
                      <div className="mt-4 text-center">
                        <motion.button
                          className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ff7145] font-medium flex items-center gap-1 mx-auto px-4 py-2 rounded-full transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toast.info("Galerie complète à venir")}
                        >
                          <span>Voir toutes les photos ({(photographer?.portfolio?.length || 0) - 8} de plus)</span>
                          <ChevronRight size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>

              {/* Reviews Section */}
              <AnimatedSection delay={0.3}>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg mb-6 border border-[#2a2a2a]">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#fffbea] mb-6 flex items-center">
                      <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                        <Star size={18} />
                      </span>
                      AVIS
                    </h2>

                    <ReviewList photographerId={id} refreshTrigger={refreshReviews} />
                  </div>
                </div>
              </AnimatedSection>

              {/* Leave a Review Section */}
              <AnimatedSection delay={0.4}>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2a]">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#fffbea] mb-6 flex items-center">
                      <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                        <Star size={18} />
                      </span>
                      LAISSER UN AVIS
                    </h2>

                    <ReviewForm photographerId={id} onReviewSubmitted={handleReviewSubmitted} />
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        <AnimatePresence>
          {isModalOpen && selectedImageIndex !== null && photographer?.portfolio && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeImageModal}
            >
              <motion.div
                className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  className="absolute top-4 right-4 z-10 bg-[#1a1a1a]/80 text-white p-2 rounded-full"
                  onClick={closeImageModal}
                >
                  <X size={24} />
                </button>

                {/* Navigation buttons */}
                <button
                  className="absolute left-4 z-10 bg-[#1a1a1a]/80 text-white p-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage("prev")
                  }}
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  className="absolute right-4 z-10 bg-[#1a1a1a]/80 text-white p-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage("next")
                  }}
                >
                  <ChevronRight size={24} />
                </button>

                {/* Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={photographer.portfolio[selectedImageIndex].url || "/placeholder.svg"}
                    alt={photographer.portfolio[selectedImageIndex].title || "Image du portfolio"}
                    width={1200}
                    height={800}
                    className="max-h-[80vh] w-auto object-contain"
                  />
                </div>

                {/* Image info */}
                {(photographer.portfolio[selectedImageIndex].title ||
                  photographer.portfolio[selectedImageIndex].description) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a]/80 p-4 text-white">
                    {photographer.portfolio[selectedImageIndex].title && (
                      <h3 className="text-lg font-medium">{photographer.portfolio[selectedImageIndex].title}</h3>
                    )}
                    {photographer.portfolio[selectedImageIndex].description && (
                      <p className="text-sm text-gray-300 mt-1">
                        {photographer.portfolio[selectedImageIndex].description}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}
