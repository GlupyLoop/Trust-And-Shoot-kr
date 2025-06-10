"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  UserIcon,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  X,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Star,
  Mail,
} from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db, type CosplayerData } from "@/lib/firebase"
import AnimatedSection from "@/components/ui/animated-section"
import ParallaxSection from "@/components/ui/parallax-section"
import { toast } from "sonner"
import ContactButton from "@/components/contact-button"
import CountryFlag from "@/components/ui/country-flag"
import ReviewListCosplayer from "@/components/reviews/review-list-cosplayer"
import ReviewFormCosplayer from "@/components/reviews/review-form-cosplayer"
import { addFavoritePhotographer, removeFavoritePhotographer, isFavoritePhotographer } from "@/lib/firebase"
// Add import for cosplayer tags at the top of the file
import { COSPLAYER_TAGS } from "@/constants/cosplayer-tags"

export default function CosplayerProfileClient() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [cosplayer, setCosplayer] = useState<CosplayerData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshReviews, setRefreshReviews] = useState(0)
  const [showAllTags, setShowAllTags] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [updatingFavorite, setUpdatingFavorite] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const fetchCosplayer = async () => {
      try {
        setPageLoading(true)
        const docRef = doc(db, "users", id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data() as CosplayerData
          if (data.role === "cosplayer") {
            setCosplayer(data)

            // Check favorite status after setting cosplayer data
            if (user) {
              try {
                const favStatus = await isFavoritePhotographer(user.uid, data.uid)
                setIsFavorite(favStatus)
              } catch (error) {
                console.error("Error checking favorite status:", error)
              }
            }
          } else {
            setError("Cet utilisateur n'est pas un cosplayer")
          }
        } else {
          setError("Cosplayer non trouvé")
        }
      } catch (err) {
        console.error("Error fetching cosplayer:", err)
        setError("Impossible de charger le profil du cosplayer")
      } finally {
        setPageLoading(false)
      }
    }

    if (id && !loading && user) {
      fetchCosplayer()
    }
  }, [id, user, loading, router])

  const toggleFavorite = async () => {
    if (!user || !cosplayer) {
      router.push("/login")
      return
    }

    setUpdatingFavorite(true)
    try {
      if (isFavorite) {
        await removeFavoritePhotographer(user.uid, cosplayer.uid)
        toast.success("Photographer removed from favorites")
      } else {
        await addFavoritePhotographer(user.uid, cosplayer.uid)
        toast.success("Photographer added to favorites")
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorites. Please try again.")
    } finally {
      setUpdatingFavorite(false)
    }
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
    if (selectedImageIndex === null || !cosplayer?.portfolio) return

    const portfolioLength = cosplayer.portfolio.length
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

  if (!cosplayer) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24 bg-[#141414]">
          <div className="bg-[#1a1a1a] p-6 rounded-lg text-center border border-[#2a2a2a]">
            <h2 className="text-xl font-bold mb-2 text-[#fffbea]">Cosplayer non trouvé</h2>
            <p className="text-gray-300">Le cosplayer que vous recherchez n'existe pas ou a été supprimé.</p>
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
      default:
        return ""
    }
  }

  const handleReviewSubmitted = () => {
    // Refresh the reviews
    setRefreshReviews((prev) => prev + 1)

    // Refresh the cosplayer data to update the statistics
    const fetchUpdatedCosplayer = async () => {
      try {
        const docRef = doc(db, "users", id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data() as CosplayerData
          setCosplayer(data)
        }
      } catch (err) {
        console.error("Error refreshing cosplayer data:", err)
      }
    }

    fetchUpdatedCosplayer()
  }

  // Add the getTagInfo function before the return statement (if not already present)
  const getTagInfo = (categoryId: string, tagId: string) => {
    const category = COSPLAYER_TAGS.find((c) => c.id === categoryId)
    const tag = category?.tags.find((t) => t.id === tagId)
    return tag
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#141414] pt-20 pb-12">
        {/* Hero Section with Cosplayer Info */}
        <div className="relative overflow-hidden">
          <ParallaxSection speed={0.1} direction="down" className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#141414] opacity-90"></div>
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-10"></div>
          </ParallaxSection>

          <div className="container mx-auto px-4 max-w-6xl relative z-10 py-8">
            <AnimatedSection>
              <motion.button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 mb-6 text-[#fffbea] font-bold"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
                <span>RETOUR</span>
              </motion.button>
            </AnimatedSection>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 max-w-6xl mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Photo and Details */}
            <div className="lg:col-span-1">
              {/* Profile Photo and Info */}
              <AnimatedSection>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2a] mb-6">
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                      <motion.div
                        className="w-32 h-32 rounded-xl overflow-hidden border-4 border-[#ff7145] shadow-xl mb-4"
                        whileHover={{ scale: 1.05 }}
                      >
                        {cosplayer.photoURL ? (
                          <Image
                            src={cosplayer.photoURL || "/placeholder.svg"}
                            alt={cosplayer.displayName || "Cosplayer"}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                            <UserIcon size={48} className="text-[#ff7145]" />
                          </div>
                        )}
                      </motion.div>

                      <h1 className="text-2xl font-bold text-[#fffbea] mb-2">
                        {cosplayer.displayName || "Cosplayer sans nom"}
                      </h1>

                      {cosplayer.averageRating !== undefined && (
                        <div className="flex items-center gap-3 justify-center mb-3">
                          <div className="flex items-center bg-[#2a2a2a]/80 backdrop-blur-sm px-3 py-1 rounded-full">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={
                                    i < Math.floor(cosplayer.averageRating || 0) ? "text-[#ff7145]" : "text-[#3a3a3a]"
                                  }
                                  fill={i < Math.floor(cosplayer.averageRating || 0) ? "#ff7145" : "none"}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-[#fffbea] ml-2">
                              {(cosplayer.averageRating || 0).toFixed(1)} ({cosplayer.totalReviews || 0})
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 justify-center mb-3">
                        {cosplayer.location && (
                          <div className="flex items-center gap-1 text-[#fffbea]/90">
                            <MapPin size={16} />
                            <span className="flex items-center gap-1">
                              <CountryFlag country={cosplayer.location} width={16} height={12} />
                              {cosplayer.location}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-[#fffbea]/90 mb-4">
                        {cosplayer.bio || "Ce cosplayer n'a pas encore ajouté de bio."}
                      </p>

                      {/* Social Media Icons */}
                      {cosplayer.socialMedia && Object.entries(cosplayer.socialMedia).some(([_, value]) => value) && (
                        <div className="flex flex-wrap gap-3 justify-center mb-4">
                          {cosplayer.socialMedia.instagram && (
                            <motion.a
                              href={getSocialMediaUrl("instagram", cosplayer.socialMedia.instagram)}
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
                          {cosplayer.socialMedia.facebook && (
                            <motion.a
                              href={getSocialMediaUrl("facebook", cosplayer.socialMedia.facebook)}
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
                          {cosplayer.socialMedia.twitter && (
                            <motion.a
                              href={getSocialMediaUrl("twitter", cosplayer.socialMedia.twitter)}
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
                          {cosplayer.website && (
                            <motion.a
                              href={
                                cosplayer.website.startsWith("http")
                                  ? cosplayer.website
                                  : `https://${cosplayer.website}`
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

                      {/* Tags Display */}
                      {cosplayer.tags && Object.entries(cosplayer.tags).some(([_, tagIds]) => tagIds.length > 0) && (
                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                          {Object.entries(cosplayer.tags)
                            .flatMap(([categoryId, tagIds]) =>
                              tagIds
                                .map((tagId) => {
                                  const tagInfo = getTagInfo(categoryId, tagId)
                                  if (!tagInfo) return null
                                  return { categoryId, tagId, tagInfo }
                                })
                                .filter(Boolean),
                            )
                            .slice(0, showAllTags ? undefined : 6)
                            .map(({ categoryId, tagId, tagInfo }) => (
                              <span
                                key={`tag-${categoryId}-${tagId}`}
                                className="bg-[#2a2a2a]/60 text-[#fffbea]/80 text-xs px-2 py-1 rounded-md flex items-center gap-1"
                              >
                                <span dangerouslySetInnerHTML={{ __html: tagInfo.icon }} />
                                {tagInfo.name}
                              </span>
                            ))}

                          {/* Show more/less button for tags */}
                          {Object.values(cosplayer.tags).flat().length > 6 && (
                            <button
                              onClick={() => setShowAllTags(!showAllTags)}
                              className="text-[#ff7145] text-xs px-2 py-1 hover:bg-[#2a2a2a]/30 rounded-md transition-colors"
                            >
                              {showAllTags
                                ? "Voir moins"
                                : `+${Object.values(cosplayer.tags).flat().length - 6} de plus`}
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {cosplayer.preferences?.shootingStyles &&
                          (showAllTags
                            ? cosplayer.preferences.shootingStyles
                            : cosplayer.preferences.shootingStyles.slice(0, 3)
                          ).map((style, index) => (
                            <span
                              key={index}
                              className="bg-[#2a2a2a]/60 text-[#fffbea]/80 text-xs px-2 py-1 rounded-md"
                            >
                              {style}
                            </span>
                          ))}

                        {/* Bouton pour afficher plus/moins */}
                        {(cosplayer.preferences?.shootingStyles?.length || 0) > 3 && (
                          <button
                            onClick={() => setShowAllTags(!showAllTags)}
                            className="text-[#ff7145] text-xs px-2 py-1 hover:bg-[#2a2a2a]/30 rounded-md transition-colors"
                          >
                            {showAllTags
                              ? "Voir moins"
                              : `+${(cosplayer.preferences?.shootingStyles?.length || 0) - 3}`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Consolidated Informations and Actions */}
              <AnimatedSection delay={0.1}>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2a] mb-6">
                  <div className="p-6">
                    {/* INFORMATIONS Section */}
                    <h2 className="text-xl font-bold text-[#fffbea] mb-6 flex items-center">
                      <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                        <Star size={18} />
                      </span>
                      INFORMATIONS
                    </h2>

                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-[#fffbea] mb-4">Résumé des notes</h3>

                      <div className="flex items-center gap-6 mb-4">
                        <div className="text-4xl font-bold text-[#ff7145]">
                          {cosplayer.averageRating ? cosplayer.averageRating.toFixed(1) : "0.0"}
                        </div>

                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = cosplayer.ratingDistribution?.[rating] || 0
                            const total = cosplayer.totalReviews || 1
                            const percentage = (count / total) * 100

                            return (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm text-[#fffbea] w-2">{rating}</span>
                                <div className="flex-1 bg-[#2a2a2a] rounded-full h-2">
                                  <div
                                    className="bg-[#ff7145] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-[#fffbea]/70 w-4">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <p className="text-sm text-[#fffbea]/70">Basé sur {cosplayer.totalReviews || 0} avis</p>
                    </div>

                    {/* Actions Section */}
                    <div className="border-t border-[#2a2a2a] pt-6">
                      <h3 className="text-lg font-semibold text-[#fffbea] mb-4 flex items-center">
                        <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                          <Mail size={16} />
                        </span>
                        Actions
                      </h3>

                      <div className="space-y-3">
                        <ContactButton userId={cosplayer.uid} variant="primary" className="w-full" />

                        <motion.button
                          className="w-full bg-[#2a2a2a] text-[#fffbea] py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#3a3a3a] transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={toggleFavorite}
                          disabled={updatingFavorite}
                        >
                          {updatingFavorite ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <Heart
                              size={18}
                              fill={isFavorite ? "#ff7145" : "none"}
                              className={isFavorite ? "text-[#ff7145]" : ""}
                            />
                          )}
                          <span>{isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
                        </motion.button>

                        <motion.button
                          className="w-full bg-[#2a2a2a] text-[#fffbea] py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#3a3a3a] transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toast.info("Fonctionnalité de partage à venir")}
                        >
                          <Share2 size={18} />
                          <span>Partager</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Detailed Information */}

              {/* End of Detailed Information Section - REMOVED */}
            </div>

            {/* Right Column - Portfolio */}
            <div className="lg:col-span-2">
              {/* Portfolio Section */}
              <AnimatedSection delay={0.2}>
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg mb-6 border border-[#2a2a2a]">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#fffbea] mb-6 flex items-center">
                      <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                        <UserIcon size={18} />
                      </span>
                      PORTFOLIO
                    </h2>

                    <div className="grid grid-cols-4 gap-3">
                      {cosplayer.portfolio && cosplayer.portfolio.length > 0
                        ? cosplayer.portfolio.map((item, index) => (
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
                                {item.photographer && (
                                  <p className="text-[#ff7145] text-xs mt-1">Photo: {item.photographer}</p>
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

                    {(cosplayer.portfolio?.length || 0) > 8 && (
                      <div className="mt-4 text-center">
                        <motion.button
                          className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ff7145] font-medium flex items-center gap-1 mx-auto px-4 py-2 rounded-full transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toast.info("Galerie complète à venir")}
                        >
                          <span>Voir toutes les photos</span>
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

                    <ReviewListCosplayer cosplayerId={cosplayer.uid} refreshTrigger={refreshReviews} />
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

                    <ReviewFormCosplayer cosplayerId={cosplayer.uid} onReviewSubmitted={handleReviewSubmitted} />
                  </div>
                </div>
              </AnimatedSection>

              {/* Costumes Section */}
              {cosplayer.costumes && cosplayer.costumes.length > 0 && (
                <AnimatedSection delay={0.3}>
                  <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg mb-6 border border-[#2a2a2a]">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-[#fffbea] mb-6 flex items-center">
                        <span className="bg-[#ff7145] text-[#fffbea] p-1 rounded mr-2">
                          <UserIcon size={18} />
                        </span>
                        COSTUMES
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cosplayer.costumes.map((costume, index) => (
                          <div
                            key={index}
                            className="bg-[#2a2a2a] rounded-lg p-4 border border-[#3a3a3a] hover:border-[#ff7145]/50 transition-colors"
                          >
                            <h3 className="font-bold text-[#fffbea] mb-1">{costume.character}</h3>
                            <p className="text-sm text-[#ff7145]">{costume.series}</p>
                            {costume.description && <p className="text-sm text-gray-300 mt-2">{costume.description}</p>}
                            {costume.images && costume.images.length > 0 && (
                              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                {costume.images.map((img, imgIndex) => (
                                  <div key={imgIndex} className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                                    <Image
                                      src={img || "/placeholder.svg"}
                                      alt={`${costume.character} costume`}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )}
            </div>
          </div>
        </div>

        {/* Image Modal */}
        <AnimatePresence>
          {isModalOpen && selectedImageIndex !== null && cosplayer.portfolio && (
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
                    src={cosplayer.portfolio[selectedImageIndex].url || "/placeholder.svg"}
                    alt={cosplayer.portfolio[selectedImageIndex].title || "Image du portfolio"}
                    width={1200}
                    height={800}
                    className="max-h-[80vh] w-auto object-contain"
                  />
                </div>

                {/* Image info */}
                {(cosplayer.portfolio[selectedImageIndex].title ||
                  cosplayer.portfolio[selectedImageIndex].description ||
                  cosplayer.portfolio[selectedImageIndex].photographer) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a]/80 p-4 text-white">
                    {cosplayer.portfolio[selectedImageIndex].title && (
                      <h3 className="text-lg font-medium">{cosplayer.portfolio[selectedImageIndex].title}</h3>
                    )}
                    {cosplayer.portfolio[selectedImageIndex].description && (
                      <p className="text-sm text-gray-300 mt-1">
                        {cosplayer.portfolio[selectedImageIndex].description}
                      </p>
                    )}
                    {cosplayer.portfolio[selectedImageIndex].photographer && (
                      <p className="text-sm text-[#ff7145] mt-1">
                        Photo: {cosplayer.portfolio[selectedImageIndex].photographer}
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
