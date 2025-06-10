"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import MainHeroSection from "@/components/sections/main-hero-section"
import PhotographerList from "@/components/sections/photographer-list"
import FilterSection from "@/components/sections/filter-section"
import CosplayerFilterSection from "@/components/sections/cosplayer-filter-section"
import FAQSection from "@/components/sections/faq-section"
import AnimatedSection from "@/components/ui/animated-section"
import { Filter, Camera, User } from "lucide-react"
import { PHOTOGRAPHER_TAGS } from "@/constants/photographer-tags"
import { getPhotographers, type PhotographerData, getCosplayers, type CosplayerData } from "@/lib/firebase"
import { toast } from "sonner"
import CosplayerCard from "@/components/cosplayer-card"
import { COSPLAYER_TAGS } from "@/constants/cosplayer-tags"

export default function Home() {
  const { user, userData, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [photographers, setPhotographers] = useState<PhotographerData[]>([])
  const [filteredPhotographers, setFilteredPhotographers] = useState<PhotographerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRole, setShowRole] = useState<"photographer" | "cosplayer">("photographer")
  const [cosplayers, setCosplayers] = useState<CosplayerData[]>([])
  const [filteredCosplayers, setFilteredCosplayers] = useState<CosplayerData[]>([])
  const [characterFilters, setCharacterFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")

  // État pour les filtres
  const [filters, setFilters] = useState({
    countries: {
      belgium: false,
      france: false,
      switzerland: false,
      germany: false,
      netherlands: false,
    },
    minRating: 0,
    sortBy: "rating" as "rating" | "name" | "newest",
    sortOrder: "desc" as "asc" | "desc",
  })

  // État pour les filtres de tags
  const [tagFilters, setTagFilters] = useState<Record<string, string[]>>(() => {
    const initialTagFilters: Record<string, string[]> = {}
    PHOTOGRAPHER_TAGS.forEach((category) => {
      initialTagFilters[category.id] = []
    })
    return initialTagFilters
  })

  // État pour les filtres de tags cosplayer
  const [cosplayerTagFilters, setCosplayerTagFilters] = useState<Record<string, string[]>>(() => {
    const initialTagFilters: Record<string, string[]> = {}
    // Initialize from cosplayer tags constants
    COSPLAYER_TAGS.forEach((category) => {
      initialTagFilters[category.id] = []
    })
    return initialTagFilters
  })

  // Récupérer les photographes
  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setIsLoading(true)
        const data = await getPhotographers(50) // Récupérer jusqu'à 50 photographes
        setPhotographers(data)
        setFilteredPhotographers(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des photographes:", error)
        toast.error("Impossible de charger les photographes. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCosplayers = async () => {
      try {
        setIsLoading(true)
        const data = await getCosplayers(50) // Récupérer jusqu'à 50 cosplayers
        setCosplayers(data)
        setFilteredCosplayers(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des cosplayers:", error)
        toast.error("Impossible de charger les cosplayers. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchPhotographers()
      fetchCosplayers()
    }
  }, [user])

  // Définir le rôle par défaut en fonction du type d'utilisateur
  useEffect(() => {
    if (userData?.role === "photographer") {
      setShowRole("cosplayer")
    } else if (userData?.role === "cosplayer") {
      setShowRole("photographer")
    }
  }, [userData])

  // Appliquer les filtres et le tri
  useEffect(() => {
    if (showRole === "photographer") {
      if (photographers.length === 0) return

      let result = [...photographers]

      // Filtrer par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        result = result.filter(
          (p) =>
            p.displayName?.toLowerCase().includes(query) ||
            p.location?.toLowerCase().includes(query) ||
            p.specialties?.some((s) => s.toLowerCase().includes(query)),
        )
      }

      // Filtrer par pays
      const selectedCountries = Object.entries(filters.countries)
        .filter(([_, isSelected]) => isSelected)
        .map(([country]) => country)

      if (selectedCountries.length > 0) {
        result = result.filter((p) => {
          if (!p.location) return false
          return selectedCountries.some((country) => p.location?.toLowerCase().includes(country.toLowerCase()))
        })
      }

      // Filtrer par note minimale
      if (filters.minRating > 0) {
        result = result.filter((p) => (p.averageRating || 0) >= filters.minRating)
      }

      // Filtrer par tags
      const selectedTags = Object.entries(tagFilters).flatMap(([categoryId, tagIds]) =>
        tagIds.map((tagId) => ({ categoryId, tagId })),
      )

      if (selectedTags.length > 0) {
        result = result.filter((p) => {
          if (!p.tags) return false

          return selectedTags.some(({ categoryId, tagId }) => {
            const photographerTagsForCategory = p.tags?.[categoryId] || []
            return photographerTagsForCategory.includes(tagId)
          })
        })
      }

      // Trier les résultats
      result.sort((a, b) => {
        if (filters.sortBy === "rating") {
          const ratingA = a.averageRating || 0
          const ratingB = b.averageRating || 0
          return filters.sortOrder === "desc" ? ratingB - ratingA : ratingA - ratingB
        } else if (filters.sortBy === "name") {
          const nameA = a.displayName || ""
          const nameB = b.displayName || ""
          return filters.sortOrder === "desc" ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB)
        } else {
          // newest
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return filters.sortOrder === "desc" ? dateB - dateA : dateA - dateB
        }
      })

      setFilteredPhotographers(result)
    } else {
      // Logique pour les cosplayers
      if (cosplayers.length === 0) return

      let result = [...cosplayers]

      // Filtrer par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        result = result.filter(
          (c) => c.displayName?.toLowerCase().includes(query) || c.location?.toLowerCase().includes(query),
        )
      }

      // Filtrer par pays
      const selectedCountries = Object.entries(filters.countries)
        .filter(([_, isSelected]) => isSelected)
        .map(([country]) => country)

      if (selectedCountries.length > 0) {
        result = result.filter((c) => {
          if (!c.location) return false
          return selectedCountries.some((country) => c.location?.toLowerCase().includes(country.toLowerCase()))
        })
      }

      // Filtrer par note minimale
      if (filters.minRating > 0) {
        result = result.filter((c) => (c.averageRating || 0) >= filters.minRating)
      }

      // Filtrer par personnages/séries (specific to cosplayers)
      if (characterFilters.length > 0) {
        result = result.filter((c) => {
          if (!c.costumes) return false
          return c.costumes.some((costume) =>
            characterFilters.some(
              (filter) =>
                costume.character?.toLowerCase().includes(filter.toLowerCase()) ||
                costume.series?.toLowerCase().includes(filter.toLowerCase()),
            ),
          )
        })
      }

      // Filtrer par tags cosplayer
      const selectedCosplayerTags = Object.entries(cosplayerTagFilters).flatMap(([categoryId, tagIds]) =>
        tagIds.map((tagId) => ({ categoryId, tagId })),
      )

      if (selectedCosplayerTags.length > 0) {
        result = result.filter((c) => {
          if (!c.tags) return false

          return selectedCosplayerTags.some(({ categoryId, tagId }) => {
            const cosplayerTagsForCategory = c.tags?.[categoryId] || []
            return cosplayerTagsForCategory.includes(tagId)
          })
        })
      }

      // Trier les résultats
      result.sort((a, b) => {
        if (filters.sortBy === "rating") {
          const ratingA = a.averageRating || 0
          const ratingB = b.averageRating || 0
          return filters.sortOrder === "desc" ? ratingB - ratingA : ratingA - ratingB
        } else if (filters.sortBy === "name") {
          const nameA = a.displayName || ""
          const nameB = b.displayName || ""
          return filters.sortOrder === "desc" ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB)
        } else {
          // newest
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return filters.sortOrder === "desc" ? dateB - dateA : dateA - dateB
        }
      })

      setFilteredCosplayers(result)
    }
  }, [photographers, cosplayers, searchQuery, filters, tagFilters, cosplayerTagFilters, showRole, characterFilters])

  useEffect(() => {
    if (showRole === "cosplayer") {
      if (cosplayers.length === 0) return

      let result = [...cosplayers]

      // Filtrer par personnages/séries
      if (characterFilters.length > 0) {
        result = result.filter((c) => {
          if (!c.costumes) return false
          return c.costumes.some((costume) =>
            characterFilters.some(
              (filter) =>
                costume.character?.toLowerCase().includes(filter.toLowerCase()) ||
                costume.series?.toLowerCase().includes(filter.toLowerCase()),
            ),
          )
        })
      }

      setFilteredCosplayers(result)
    }
  }, [cosplayers, characterFilters, showRole])

  // Gérer les changements de filtres de pays
  const handleCountryChange = (country: string) => {
    setFilters((prev) => ({
      ...prev,
      countries: {
        ...prev.countries,
        [country]: !prev.countries[country as keyof typeof prev.countries],
      },
    }))
  }

  // Gérer les changements de filtres de tags
  const handleTagFilterChange = (categoryId: string, tagId: string) => {
    setTagFilters((prev) => {
      const updatedFilters = { ...prev }
      const currentTags = [...(updatedFilters[categoryId] || [])]

      if (currentTags.includes(tagId)) {
        // Retirer le tag s'il est déjà présent
        const index = currentTags.indexOf(tagId)
        if (index !== -1) {
          currentTags.splice(index, 1)
        }
      } else {
        // Ajouter le tag
        currentTags.push(tagId)
      }

      updatedFilters[categoryId] = currentTags
      return updatedFilters
    })
  }

  // Gérer les changements de filtres de tags cosplayer
  const handleCosplayerTagFilterChange = (categoryId: string, tagId: string) => {
    setCosplayerTagFilters((prev) => {
      const updatedFilters = { ...prev }
      const currentTags = [...(updatedFilters[categoryId] || [])]

      if (currentTags.includes(tagId)) {
        // Retirer le tag s'il est déjà présent
        const index = currentTags.indexOf(tagId)
        if (index !== -1) {
          currentTags.splice(index, 1)
        }
      } else {
        // Ajouter le tag
        currentTags.push(tagId)
      }

      updatedFilters[categoryId] = currentTags
      return updatedFilters
    })
  }

  // Gérer le changement de note minimale
  const handleRatingChange = (value: number) => {
    setFilters((prev) => ({
      ...prev,
      minRating: value,
    }))
  }

  // Gérer le changement de tri
  const handleSortChange = (sortBy: "rating" | "name" | "newest") => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      // Inverser l'ordre si on clique sur le même critère de tri
      sortOrder: prev.sortBy === sortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "desc",
    }))
  }

  // Gérer les changements de filtres de personnages
  const handleCharacterFilterChange = (character: string) => {
    setCharacterFilters((prev) => {
      if (prev.includes(character)) {
        return prev.filter((c) => c !== character)
      } else {
        return [...prev, character]
      }
    })
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Afficher l'état de chargement
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-[#141414]">
        {/* Main Hero Section */}
        <MainHeroSection />

        {/* Content Container */}
        <div className="container mx-auto px-4 py-8">
          {/* Photographer List and Filter Section */}
          <div className="mb-12" id="browse-section">
            <AnimatedSection>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="text-[#ff7145] mr-2">{t("section.browse")}</span>
                  {showRole === "photographer" ? t("section.photographers") : "Cosplayers"}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({showRole === "photographer" ? filteredPhotographers.length : filteredCosplayers.length}{" "}
                    {showRole === "photographer"
                      ? filteredPhotographers.length === 1
                        ? "photographer"
                        : "photographers"
                      : filteredCosplayers.length === 1
                        ? "cosplayer"
                        : "cosplayers"}
                    )
                  </span>
                </h2>

                <div className="flex items-center bg-[#2a2a2a] rounded-full p-1">
                  <button
                    onClick={() => setShowRole("photographer")}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      showRole === "photographer" ? "bg-[#ff7145] text-white" : "text-gray-300 hover:text-white"
                    }`}
                    aria-pressed={showRole === "photographer"}
                  >
                    <Camera size={16} className="inline mr-2" aria-hidden="true" />
                    Photographes
                  </button>
                  <button
                    onClick={() => setShowRole("cosplayer")}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      showRole === "cosplayer" ? "bg-[#ff7145] text-white" : "text-gray-300 hover:text-white"
                    }`}
                    aria-pressed={showRole === "cosplayer"}
                  >
                    <User size={16} className="inline mr-2" aria-hidden="true" />
                    Cosplayers
                  </button>
                </div>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <AnimatedSection delay={0.1} className="lg:col-span-1">
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#ff7145]/20 sticky top-24">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Filter size={18} className="mr-2 text-[#ff7145]" aria-hidden="true" />
                    {t("filters.allFilters")}
                  </h3>
                  {showRole === "photographer" ? (
                    <FilterSection
                      countryFilters={filters.countries}
                      tagFilters={tagFilters}
                      handleCountryChange={handleCountryChange}
                      handleTagChange={handleTagFilterChange}
                      minRating={filters.minRating}
                      handleRatingChange={handleRatingChange}
                      sortBy={filters.sortBy}
                      sortOrder={filters.sortOrder}
                      handleSortChange={handleSortChange}
                    />
                  ) : (
                    <CosplayerFilterSection
                      countryFilters={filters.countries}
                      handleCountryChange={handleCountryChange}
                      minRating={filters.minRating}
                      handleRatingChange={handleRatingChange}
                      sortBy={filters.sortBy}
                      sortOrder={filters.sortOrder}
                      handleSortChange={handleSortChange}
                      characterFilters={characterFilters}
                      handleCharacterFilterChange={handleCharacterFilterChange}
                      tagFilters={cosplayerTagFilters}
                      handleTagFilterChange={handleCosplayerTagFilterChange}
                    />
                  )}
                </div>
              </AnimatedSection>

              {/* Photographer/Cosplayer Grid */}
              <AnimatedSection delay={0.2} className="lg:col-span-3">
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#ff7145]/20">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
                    </div>
                  ) : showRole === "photographer" ? (
                    <PhotographerList photographers={filteredPhotographers} />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCosplayers.map((cosplayer) => (
                        <CosplayerCard key={cosplayer.uid} cosplayer={cosplayer} />
                      ))}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* FAQ Section */}
          <AnimatedSection className="mb-12">
            <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#ff7145]/20 shadow-lg relative overflow-hidden">
              {/* En-tête de la section centré avec barres */}
              <div className="relative z-10 mb-8 flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-6">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ff7145]/40 to-transparent flex-grow max-w-xs"></div>
                  <div className="mx-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#ff7145] mr-3"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <h2 className="text-3xl font-bold text-white">FAQ</h2>
                  </div>
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ff7145]/40 to-transparent flex-grow max-w-xs"></div>
                </div>
                <p className="text-gray-300 text-center max-w-2xl mb-6">
                  Découvrez tout ce que vous devez savoir sur Trust & Shoot, notre plateforme et comment elle fonctionne
                  pour les photographes et cosplayers.
                </p>
              </div>

              {/* Contenu FAQ avec style amélioré */}
              <div className="relative z-10 bg-[#1a1a1a]/50 rounded-lg p-4">
                <FAQSection />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  )
}
