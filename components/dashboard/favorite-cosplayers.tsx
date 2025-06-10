"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, X, Search, Star, MapPin, ChevronRight, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { type CosplayerData, getFavoriteCosplayers, removeFavoriteCosplayer } from "@/lib/firebase"
import OptimizedImage from "@/components/ui/optimized-image"
import CountryFlag from "@/components/ui/country-flag"
import { toast } from "sonner"

export default function FavoriteCosplayers() {
  const { user } = useAuth()
  const router = useRouter()
  const [favoriteCosplayers, setFavoriteCosplayers] = useState<CosplayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadFavoriteCosplayers = async () => {
      if (!user) return

      try {
        setLoading(true)
        const cosplayers = await getFavoriteCosplayers(user.uid)
        setFavoriteCosplayers(cosplayers)
      } catch (error) {
        console.error("Error loading favorite cosplayers:", error)
        toast.error("Failed to load favorite cosplayers")
      } finally {
        setLoading(false)
      }
    }

    loadFavoriteCosplayers()
  }, [user])

  const handleRemoveFavorite = async (cosplayerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    try {
      await removeFavoriteCosplayer(user.uid, cosplayerId)
      setFavoriteCosplayers((prev) => prev.filter((cosplayer) => cosplayer.uid !== cosplayerId))
      toast.success("Cosplayer removed from favorites")
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error("Failed to remove from favorites")
    }
  }

  const filteredCosplayers = favoriteCosplayers.filter((cosplayer) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      cosplayer.displayName?.toLowerCase().includes(searchLower) ||
      cosplayer.location?.toLowerCase().includes(searchLower) ||
      cosplayer.costumes?.some(
        (costume) =>
          costume.character.toLowerCase().includes(searchLower) || costume.series.toLowerCase().includes(searchLower),
      )
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search cosplayers..."
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7145] focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {favoriteCosplayers.length === 0 ? (
        <div className="bg-[#2a2a2a] rounded-lg p-6 text-center">
          <Heart className="mx-auto mb-2 text-gray-400" size={32} />
          <h3 className="text-lg font-medium mb-1">No favorite cosplayers yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add cosplayers to your favorites to see them here</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#ff7145] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#ff8d69] transition-colors"
          >
            Discover Cosplayers
          </button>
        </div>
      ) : filteredCosplayers.length === 0 ? (
        <div className="bg-[#2a2a2a] rounded-lg p-6 text-center">
          <Search className="mx-auto mb-2 text-gray-400" size={32} />
          <h3 className="text-lg font-medium mb-1">No results found</h3>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCosplayers.map((cosplayer) => (
            <motion.div
              key={cosplayer.uid}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#ff7145]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#ff7145]/10 hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push(`/cosplayer/${cosplayer.uid}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-32 overflow-hidden">
                {cosplayer.photoURL ? (
                  <OptimizedImage
                    src={cosplayer.photoURL}
                    alt={cosplayer.displayName || "Cosplayer"}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* Rating badge */}
                {cosplayer.averageRating ? (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 z-10">
                    <Star size={14} fill="#ff7145" className="text-[#ff7145]" />
                    <span className="text-sm font-medium">{cosplayer.averageRating.toFixed(1)}</span>
                  </div>
                ) : null}

                {/* Remove from favorites button */}
                <button
                  className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-full hover:bg-red-500/80 transition-colors"
                  onClick={(e) => handleRemoveFavorite(cosplayer.uid, e)}
                  aria-label="Remove from favorites"
                >
                  <X size={14} className="text-white" />
                </button>

                {/* Name and location */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white truncate">{cosplayer.displayName || "Unnamed Cosplayer"}</h3>
                  {cosplayer.location && (
                    <p className="text-gray-300 text-sm flex items-center">
                      <MapPin size={12} className="mr-1" aria-hidden="true" />
                      <span className="flex items-center gap-1">
                        <CountryFlag country={cosplayer.location} width={16} height={12} className="mr-1" />
                        {cosplayer.location}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3">
                {/* Costumes */}
                {cosplayer.costumes && cosplayer.costumes.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {cosplayer.costumes.slice(0, 3).map((costume, index) => (
                        <span key={index} className="bg-[#2a2a2a] text-xs px-2 py-0.5 rounded-full">
                          {costume.character}
                        </span>
                      ))}
                      {cosplayer.costumes.length > 3 && (
                        <span className="bg-[#2a2a2a] text-xs px-2 py-0.5 rounded-full">
                          +{cosplayer.costumes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <button
                    className="flex-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-1.5 px-3 rounded text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/cosplayer/${cosplayer.uid}`)
                    }}
                  >
                    View Profile
                    <ChevronRight size={14} />
                  </button>
                  <button
                    className="flex-1 bg-[#ff7145] hover:bg-[#ff8d69] text-white py-1.5 px-3 rounded text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Navigate to messages with this cosplayer
                      router.push(`/messages?userId=${cosplayer.uid}`)
                    }}
                  >
                    <MessageSquare size={14} />
                    Contact
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
