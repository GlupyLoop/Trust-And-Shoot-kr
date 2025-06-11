"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedSection from "@/components/ui/animated-section"
import { Search, MapPin, Star, Calendar, Camera, ChevronDown, Filter, Grid, List, Clock, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getUsersByRole } from "@/lib/firebase"
import CountryFlag from "@/components/ui/country-flag"

export default function BookingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [photographers, setPhotographers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [locations, setLocations] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating")

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else {
        fetchPhotographers()
      }
    }
  }, [user, authLoading, router])

  const fetchPhotographers = async () => {
    try {
      setLoading(true)
      const photographersData = await getUsersByRole("photographer")

      // Extract unique locations
      const uniqueLocations = Array.from(new Set(photographersData.filter((p) => p.location).map((p) => p.location)))

      setLocations(uniqueLocations as string[])
      setPhotographers(photographersData)
    } catch (error) {
      console.error("Error fetching photographers:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get all tags from photographer tags object
  const getAllTags = (photographer: any): string[] => {
    if (!photographer.tags || typeof photographer.tags !== "object") {
      return []
    }

    const allTags: string[] = []
    Object.values(photographer.tags).forEach((tagArray: any) => {
      if (Array.isArray(tagArray)) {
        allTags.push(...tagArray)
      }
    })

    return allTags
  }

  const filteredAndSortedPhotographers = photographers
    .filter((photographer) => {
      const allTags = getAllTags(photographer)

      const matchesSearch =
        photographer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photographer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allTags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLocation = !selectedLocation || photographer.location === selectedLocation

      return matchesSearch && matchesLocation
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0)
        case "price":
          return (a.pricing?.hourlyRate || 50) - (b.pricing?.hourlyRate || 50)
        case "name":
          return (a.displayName || "").localeCompare(b.displayName || "")
        default:
          return 0
      }
    })

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a]">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#ff7145]/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#ff7145] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">Chargement des photographes...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] pt-20 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff7145]/10 via-transparent to-[#ff7145]/5"></div>
          <div className="container mx-auto px-4 max-w-6xl relative">
            <AnimatedSection>
              <div className="flex flex-col items-center text-center py-16">
                <motion.div
                  className="inline-flex items-center bg-gradient-to-r from-[#ff7145]/20 to-[#ff8d69]/20 rounded-full px-6 py-2 mb-6 border border-[#ff7145]/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Camera size={16} className="mr-2 text-[#ff7145]" />
                  <span className="text-sm font-medium text-[#ff7145]">Réservation en ligne</span>
                </motion.div>
                <motion.h1
                  className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Réservez votre
                  <br />
                  <span className="bg-gradient-to-r from-[#ff7145] to-[#ff8d69] bg-clip-text text-transparent">
                    séance photo
                  </span>
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-300 max-w-2xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Trouvez le photographe parfait pour votre prochain shooting cosplay et réservez directement en
                  fonction de ses disponibilités.
                </motion.p>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Search and Filters */}
          <AnimatedSection delay={0.1}>
            <motion.div
              className="bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] rounded-3xl p-8 mb-12 border border-[#2a2a2a]/50 shadow-2xl backdrop-blur-sm"
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(255, 113, 69, 0.15)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#fffbea] mb-2">Trouvez votre photographe idéal</h2>
                  <p className="text-gray-400">Filtrez par localisation, style et disponibilité</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <div className="relative group">
                      <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff7145] transition-colors"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Rechercher par nom, style ou spécialité..."
                        className="w-full bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff7145]/50 focus:bg-[#2e2e2e] transition-all text-[#fffbea] placeholder-gray-400 border border-[#3a3a3a]/50 focus:border-[#ff7145]/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="relative group">
                    <MapPin
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff7145] transition-colors"
                      size={20}
                    />
                    <select
                      className="w-full bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl pl-12 pr-10 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#ff7145]/50 text-[#fffbea] border border-[#3a3a3a]/50 focus:border-[#ff7145]/50 cursor-pointer"
                      value={selectedLocation || ""}
                      onChange={(e) => setSelectedLocation(e.target.value || null)}
                    >
                      <option value="">Toutes les villes</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[#2a2a2a]/50">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <Filter
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff7145] transition-colors"
                        size={16}
                      />
                      <select
                        className="bg-[#2a2a2a]/60 rounded-xl pl-10 pr-8 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#ff7145]/50 text-[#fffbea] text-sm border border-[#3a3a3a]/30 cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "rating" | "price" | "name")}
                      >
                        <option value="rating">Mieux notés</option>
                        <option value="price">Prix croissant</option>
                        <option value="name">Nom A-Z</option>
                      </select>
                      <ChevronDown
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={14}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 mr-2">Affichage:</span>
                    <div className="flex bg-[#2a2a2a]/60 rounded-xl p-1 border border-[#3a3a3a]/30">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === "grid"
                            ? "bg-gradient-to-r from-[#ff7145] to-[#ff8d69] text-white shadow-lg"
                            : "text-gray-400 hover:text-[#fffbea] hover:bg-[#3a3a3a]/50"
                        }`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === "list"
                            ? "bg-gradient-to-r from-[#ff7145] to-[#ff8d69] text-white shadow-lg"
                            : "text-gray-400 hover:text-[#fffbea] hover:bg-[#3a3a3a]/50"
                        }`}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Results Header */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Photographes disponibles</h2>
                <p className="text-gray-400">
                  {filteredAndSortedPhotographers.length} photographe
                  {filteredAndSortedPhotographers.length > 1 ? "s" : ""} trouvé
                  {filteredAndSortedPhotographers.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-[#2a2a2a]">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === "grid"
                        ? "bg-[#ff7145] text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === "list"
                        ? "bg-[#ff7145] text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div> */}
              </div>
            </div>
          </AnimatedSection>

          {/* Results */}
          <AnimatedSection delay={0.3}>
            <AnimatePresence mode="wait">
              {filteredAndSortedPhotographers.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] rounded-2xl p-12 text-center border border-[#2a2a2a]"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-[#ff7145]/20 to-[#ff8d69]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera size={40} className="text-[#ff7145]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Aucun photographe trouvé</h3>
                  <p className="text-gray-400 text-lg">
                    Essayez de modifier vos critères de recherche ou revenez plus tard.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-6"}
                >
                  {filteredAndSortedPhotographers.map((photographer, index) => {
                    const allTags = getAllTags(photographer)

                    return (
                      <motion.div
                        key={photographer.uid}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={
                          viewMode === "grid"
                            ? "group"
                            : "flex flex-col sm:flex-row bg-gradient-to-r from-[#1a1a1a] to-[#1e1e1e] rounded-2xl overflow-hidden border border-[#2a2a2a] hover:border-[#ff7145]/50 transition-all duration-300"
                        }
                      >
                        {viewMode === "grid" ? (
                          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] rounded-2xl overflow-hidden border border-[#2a2a2a] hover:border-[#ff7145]/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-[#ff7145]/10 group-hover:-translate-y-2">
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                              {photographer.photoURL ? (
                                <Image
                                  src={photographer.photoURL || "/placeholder.svg"}
                                  alt={photographer.displayName || "Photographer"}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] flex items-center justify-center">
                                  <Camera size={48} className="text-[#4a4a4a]" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                              {/* Location Badge */}
                              {photographer.location && (
                                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm flex items-center">
                                  <CountryFlag
                                    country={photographer.location}
                                    width={16}
                                    height={12}
                                    className="mr-2"
                                  />
                                  {photographer.location}
                                </div>
                              )}

                              {/* Rating Badge */}
                              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center">
                                <Star size={14} className="text-[#ff7145] fill-[#ff7145] mr-1" />
                                <span className="text-sm font-medium">
                                  {(photographer.averageRating || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              <div className="mb-4">
                                <h3 className="font-bold text-xl mb-2 group-hover:text-[#ff7145] transition-colors">
                                  {photographer.displayName || "Photographe"}
                                </h3>
                                <div className="flex items-center text-sm text-gray-400">
                                  <Award size={14} className="mr-1" />
                                  <span>{photographer.totalReviews || 0} avis</span>
                                  <span className="mx-2">•</span>
                                  <Clock size={14} className="mr-1" />
                                  <span>Disponible</span>
                                </div>
                              </div>

                              <p className="text-gray-300 text-sm line-clamp-2 mb-4 leading-relaxed">
                                {photographer.bio || "Photographe professionnel spécialisé en cosplay."}
                              </p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-6">
                                {allTags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                  <span
                                    key={tagIndex}
                                    className="bg-[#2a2a2a] hover:bg-[#ff7145]/20 text-xs rounded-full px-3 py-1 transition-colors"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {allTags.length > 3 && (
                                  <span className="bg-[#2a2a2a] text-xs rounded-full px-3 py-1">
                                    +{allTags.length - 3}
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3">
                                <Link
                                  href={`/photographer/${photographer.uid}`}
                                  className="flex-1 text-center py-3 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all text-sm font-medium"
                                >
                                  Voir profil
                                </Link>
                                <Link
                                  href={`/photographer/${photographer.uid}/booking`}
                                  className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] transition-all text-sm font-medium flex items-center justify-center shadow-lg shadow-[#ff7145]/25"
                                >
                                  <Calendar size={16} className="mr-2" />
                                  Réserver
                                </Link>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* List View */}
                            <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
                              {photographer.photoURL ? (
                                <Image
                                  src={photographer.photoURL || "/placeholder.svg"}
                                  alt={photographer.displayName || "Photographer"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] flex items-center justify-center">
                                  <Camera size={48} className="text-[#4a4a4a]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-6">
                              <div className="mb-3">
                                <h3 className="font-bold text-xl mb-1">{photographer.displayName || "Photographe"}</h3>
                                <div className="flex items-center text-sm text-gray-400 mb-2">
                                  {photographer.location && (
                                    <>
                                      <CountryFlag
                                        country={photographer.location}
                                        width={16}
                                        height={12}
                                        className="mr-2"
                                      />
                                      {photographer.location}
                                      <span className="mx-2">•</span>
                                    </>
                                  )}
                                  <Star size={14} className="text-[#ff7145] fill-[#ff7145] mr-1" />
                                  <span>{(photographer.averageRating || 0).toFixed(1)}</span>
                                  <span className="mx-2">•</span>
                                  <span>{photographer.totalReviews || 0} avis</span>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                {photographer.bio || "Photographe professionnel spécialisé en cosplay."}
                              </p>
                              <div className="flex justify-between items-center">
                                <div className="flex flex-wrap gap-2">
                                  {allTags.slice(0, 2).map((tag: string, tagIndex: number) => (
                                    <span key={tagIndex} className="bg-[#2a2a2a] text-xs rounded-full px-3 py-1">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-3">
                                  <Link
                                    href={`/photographer/${photographer.uid}`}
                                    className="px-4 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all text-sm"
                                  >
                                    Profil
                                  </Link>
                                  <Link
                                    href={`/photographer/${photographer.uid}/booking`}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff7145] to-[#ff8d69] hover:from-[#ff8d69] hover:to-[#ff7145] transition-all text-sm flex items-center"
                                  >
                                    <Calendar size={14} className="mr-1" />
                                    Réserver
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatedSection>
        </div>
      </main>
    </>
  )
}
