"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, User, Instagram, Facebook, Twitter, Globe, ChevronRight, MessageSquare, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { CosplayerData } from "@/lib/firebase"
import OptimizedImage from "@/components/ui/optimized-image"
import CountryFlag from "./ui/country-flag"
import { COSPLAYER_TAGS } from "@/constants/cosplayer-tags"
import { useMessaging } from "@/contexts/messaging-context"

type CosplayerCardProps = {
  cosplayer: CosplayerData
}

const getSocialMediaUrl = (type: string, username: string): string => {
  if (!username) return ""
  const cleanUsername = username.startsWith("@") ? username.substring(1) : username

  switch (type) {
    case "instagram":
      return `https://instagram.com/${cleanUsername}`
    case "facebook":
      return `https://facebook.com/${cleanUsername}`
    case "twitter":
      return `https://twitter.com/${cleanUsername}`
    case "tiktok":
      return `https://tiktok.com/@${cleanUsername}`
    default:
      return ""
  }
}

const getTagInfo = (categoryId: string, tagId: string) => {
  const category = COSPLAYER_TAGS.find((c) => c.id === categoryId)
  const tag = category?.tags.find((t) => t.id === tagId)
  return tag
}

export default function CosplayerCard({ cosplayer }: CosplayerCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0)
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(false)
  const { createConversation } = useMessaging()

  // Calculate average rating or use default
  const rating = cosplayer.averageRating || 0
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  // Portfolio images
  const portfolioImages = cosplayer.portfolio || []

  // Auto-rotate portfolio images when hovered
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isHovered && portfolioImages.length > 1) {
      interval = setInterval(() => {
        setActivePortfolioIndex((prev) => (prev + 1) % portfolioImages.length)
      }, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isHovered, portfolioImages.length])

  return (
    <motion.div
      className="bg-gradient-to-b from-[#1a1a1a] to-[#232323] rounded-xl overflow-hidden border border-[#2a2a2a] hover:border-[#ff7145]/50 transition-all shadow-lg"
      whileHover={{
        y: -5,
        boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.5), 0 5px 15px -5px rgba(255, 113, 69, 0.25)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => {
        setIsHovered(true)
        setShowPortfolioPreview(true)
      }}
      onHoverEnd={() => {
        setIsHovered(false)
        setShowPortfolioPreview(false)
      }}
      onClick={() => router.push(`/cosplayer/${cosplayer.uid}`)}
    >
      {/* Header with profile image and portfolio preview */}
      <div className="relative">
        {/* Main profile image or portfolio carousel */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <AnimatePresence>
            {showPortfolioPreview && portfolioImages.length > 0 ? (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {portfolioImages.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === activePortfolioIndex ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={item.url || "/placeholder.svg"}
                      alt={item.title || `Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </motion.div>
                ))}

                {/* Portfolio navigation dots */}
                {portfolioImages.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                    {portfolioImages.map((_, index) => (
                      <button
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === activePortfolioIndex ? "bg-white scale-125" : "bg-white/50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActivePortfolioIndex(index)
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Portfolio count badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                  <User size={12} className="text-[#ff7145]" />
                  <span>{portfolioImages.length} photos</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <div className="aspect-square relative overflow-hidden">
                  <OptimizedImage
                    src={cosplayer.photoURL || "/placeholder.svg?height=300&width=300"}
                    alt={cosplayer.displayName || "Cosplayer"}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-60" />

          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <Star size={14} fill="#ff7145" className="text-[#ff7145]" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>

          {/* Cosplayer name and location overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="font-bold text-lg text-white truncate">{cosplayer.displayName || "Unnamed Cosplayer"}</h3>
            {cosplayer.location && (
              <p className="text-gray-400 text-sm flex items-center mt-1">
                <MapPin size={14} className="mr-1" aria-hidden="true" />
                <span className="flex items-center gap-1">
                  <CountryFlag country={cosplayer.location} width={16} height={12} className="mr-1" />
                  {cosplayer.location}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Social Media Icons */}
        {cosplayer.socialMedia && Object.entries(cosplayer.socialMedia).some(([_, value]) => value) && (
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {cosplayer.socialMedia.instagram && (
              <motion.a
                href={getSocialMediaUrl("instagram", cosplayer.socialMedia.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2a2a2a] hover:bg-[#E1306C] text-[#fffbea] p-2.5 rounded-full transition-colors"
                whileHover={{ scale: 1.15, backgroundColor: "#E1306C" }}
                whileTap={{ scale: 0.9 }}
                aria-label="Instagram"
                onClick={(e) => e.stopPropagation()}
              >
                <Instagram size={18} />
              </motion.a>
            )}
            {cosplayer.socialMedia.facebook && (
              <motion.a
                href={getSocialMediaUrl("facebook", cosplayer.socialMedia.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2a2a2a] hover:bg-[#1877F2] text-[#fffbea] p-2.5 rounded-full transition-colors"
                whileHover={{ scale: 1.15, backgroundColor: "#1877F2" }}
                whileTap={{ scale: 0.9 }}
                aria-label="Facebook"
                onClick={(e) => e.stopPropagation()}
              >
                <Facebook size={18} />
              </motion.a>
            )}
            {cosplayer.socialMedia.twitter && (
              <motion.a
                href={getSocialMediaUrl("twitter", cosplayer.socialMedia.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2a2a2a] hover:bg-[#1DA1F2] text-[#fffbea] p-2.5 rounded-full transition-colors"
                whileHover={{ scale: 1.15, backgroundColor: "#1DA1F2" }}
                whileTap={{ scale: 0.9 }}
                aria-label="Twitter"
                onClick={(e) => e.stopPropagation()}
              >
                <Twitter size={18} />
              </motion.a>
            )}
            {cosplayer.socialMedia.tiktok && (
              <motion.a
                href={getSocialMediaUrl("tiktok", cosplayer.socialMedia.tiktok)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2a2a2a] hover:bg-[#000000] text-[#fffbea] p-2.5 rounded-full transition-colors"
                whileHover={{ scale: 1.15, backgroundColor: "#000000" }}
                whileTap={{ scale: 0.9 }}
                aria-label="TikTok"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
              </motion.a>
            )}
            {cosplayer.website && (
              <motion.a
                href={cosplayer.website.startsWith("http") ? cosplayer.website : `https://${cosplayer.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2a2a2a] hover:bg-[#ff7145] text-[#fffbea] p-2.5 rounded-full transition-colors"
                whileHover={{ scale: 1.15, backgroundColor: "#ff7145" }}
                whileTap={{ scale: 0.9 }}
                aria-label="Website"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe size={18} />
              </motion.a>
            )}
          </div>
        )}

        {/* Costumes/Characters and Tags */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5 mb-2 opacity-80">
            {/* Display costumes */}
            {cosplayer.costumes &&
              cosplayer.costumes.slice(0, 2).map((costume, index) => (
                <span
                  key={`costume-${index}`}
                  className="bg-[#2a2a2a] text-xs px-2 py-0.5 rounded-full hover:bg-[#3a3a3a] transition-colors"
                >
                  {costume.character}
                </span>
              ))}

            {/* Display tags */}
            {cosplayer.tags &&
              Object.entries(cosplayer.tags)
                .flatMap(([categoryId, tagIds]) => tagIds.map((tagId) => ({ categoryId, tagId })))
                .slice(0, 3 - (cosplayer.costumes?.slice(0, 2).length || 0))
                .map(({ categoryId, tagId }, index) => {
                  const tagInfo = getTagInfo(categoryId, tagId)
                  if (!tagInfo) return null

                  return (
                    <span
                      key={`tag-${index}`}
                      className="bg-[#2a2a2a] text-xs px-2 py-0.5 rounded-full flex items-center hover:bg-[#3a3a3a] transition-colors"
                    >
                      <span dangerouslySetInnerHTML={{ __html: tagInfo.icon }} className="mr-1" />
                      {tagInfo.name}
                    </span>
                  )
                })}

            {/* Show "more" indicator if needed */}
            {((cosplayer.costumes?.length || 0) > 2 ||
              (cosplayer.tags &&
                Object.values(cosplayer.tags).flat().length > 3 - (cosplayer.costumes?.slice(0, 2).length || 0))) && (
              <span className="bg-[#2a2a2a] text-xs px-2 py-0.5 rounded-full hover:bg-[#3a3a3a] transition-colors">
                +
                {(cosplayer.costumes?.length || 0) -
                  2 +
                  (cosplayer.tags
                    ? Object.values(cosplayer.tags).flat().length - (3 - (cosplayer.costumes?.slice(0, 2).length || 0))
                    : 0)}{" "}
                more
              </span>
            )}
          </div>
        </div>

        {/* Rating section - matching photographer card design */}
        <div className="mb-4">
          <div className="bg-[#2a2a2a]/50 rounded-lg p-2.5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < fullStars ? "text-[#ff7145]" : "text-[#3a3a3a]"}
                  fill={i < fullStars ? "#ff7145" : i === fullStars && hasHalfStar ? "url(#halfStar)" : "none"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{cosplayer.totalReviews || 0} reviews</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            className="flex-1 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] text-white py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1 shadow-lg shadow-[#ff7145]/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/cosplayer/${cosplayer.uid}`)
            }}
          >
            View Profile
            <ChevronRight size={16} />
          </motion.button>
          <motion.button
            className="flex-1 border border-[#ff7145] text-[#ff7145] py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 113, 69, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={async (e) => {
              e.stopPropagation()
              if (!user) {
                router.push("/login")
                return
              }

              try {
                const conversationId = await createConversation(cosplayer.uid)
                localStorage.setItem("openConversationId", conversationId)
                router.push("/messages")
              } catch (error) {
                console.error("Error creating conversation:", error)
              }
            }}
          >
            <MessageSquare size={16} />
            Contact
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
