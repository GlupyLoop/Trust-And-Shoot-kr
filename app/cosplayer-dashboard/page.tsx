"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import AnimatedSection from "@/components/ui/animated-section"
import { motion } from "framer-motion"
import {
  UserIcon,
  Star,
  Camera,
  Calendar,
  ImageIcon,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  Upload,
  Users,
  LayoutGrid,
  Settings,
} from "lucide-react"
import Image from "next/image"
import ImageUpload from "@/components/ui/image-upload"
import ImageDetailsModal from "@/components/ui/image-details-modal"
import {
  addPortfolioItem,
  deletePortfolioItem,
  updatePortfolioItemDetails,
  getFavoritePhotographers,
  type PhotographerData,
  getFavoriteCosplayers,
  type CosplayerData,
  getUserData,
} from "@/lib/firebase"
import RecentMessages from "@/components/dashboard/recent-messages"
import UsernameUpdateBanner from "@/components/auth/username-update-banner"
import { Button } from "@/components/ui/button"
import { getCosplayerBookings, getPhotographerTimeSlots } from "@/lib/bookings"
import type { BookingRequest, TimeSlot } from "@/types/booking"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function CosplayerDashboard() {
  const { user, userData, loading, shouldPromptUsernameUpdate, refreshUserData } = useAuth()
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [favoritePhotographers, setFavoritePhotographers] = useState<PhotographerData[]>([])
  const [favoriteCosplayers, setFavoriteCosplayers] = useState<CosplayerData[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)
  const [activeView, setActiveView] = useState<"overview" | "portfolio">("overview")
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [photographers, setPhotographers] = useState<{ [key: string]: PhotographerData }>({})

  // Stats for the dashboard
  const stats = {
    portfolioImages: portfolioItems.length,
    favoritePhotographers: favoritePhotographers.length,
    upcomingShots: bookings.filter(
      (booking) =>
        booking.status === "accepted" && timeSlots.find((slot) => slot.id === booking.timeSlotId)?.date > new Date(),
    ).length,
    completedShots: bookings.filter(
      (booking) =>
        booking.status === "accepted" && timeSlots.find((slot) => slot.id === booking.timeSlotId)?.date <= new Date(),
    ).length,
  }

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (userData?.role !== "cosplayer") {
        router.push("/")
      } else {
        if (userData && userData.portfolio) {
          setPortfolioItems(userData.portfolio)
        }
        loadFavoritePhotographers()
        loadFavoriteCosplayers()
        loadCosplayerBookings()
        setPageLoading(false)
      }
    }
  }, [user, userData, loading, router])

  const loadFavoritePhotographers = async () => {
    if (!user) return
    try {
      setLoadingFavorites(true)
      const photographers = await getFavoritePhotographers(user.uid)
      setFavoritePhotographers(photographers)
    } catch (error) {
      console.error("Error loading favorite photographers:", error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  const loadFavoriteCosplayers = async () => {
    if (!user) return
    try {
      setLoadingFavorites(true)
      const cosplayers = await getFavoriteCosplayers(user.uid)
      setFavoriteCosplayers(cosplayers)
    } catch (error) {
      console.error("Error loading favorite cosplayers:", error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  const loadCosplayerBookings = async () => {
    if (!user) return
    try {
      setLoadingBookings(true)
      const userBookings = await getCosplayerBookings(user.uid)
      setBookings(userBookings)

      // Load time slots and photographer data for each booking
      const allTimeSlots: TimeSlot[] = []
      const photographerData: { [key: string]: PhotographerData } = {}

      for (const booking of userBookings) {
        try {
          const photographerSlots = await getPhotographerTimeSlots(booking.photographerId)
          const matchingSlot = photographerSlots.find((slot) => slot.id === booking.timeSlotId)
          if (matchingSlot) {
            allTimeSlots.push(matchingSlot)
          }

          // Load photographer data if not already loaded
          if (!photographerData[booking.photographerId]) {
            const photographerInfo = (await getUserData(booking.photographerId)) as PhotographerData
            if (photographerInfo) {
              photographerData[booking.photographerId] = photographerInfo
            }
          }
        } catch (error) {
          console.error("Error loading time slot or photographer:", error)
        }
      }
      setTimeSlots(allTimeSlots)
      setPhotographers(photographerData)
    } catch (error) {
      console.error("Error loading cosplayer bookings:", error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleImageSelect = (file: File) => {
    const maxSizeInBytes = 5 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      alert("Le fichier est trop volumineux. Veuillez sélectionner une image de moins de 5 Mo.")
      return
    }
    setSelectedImage(file)
    setModalOpen(true)
  }

  const handleSaveDetails = async (details: { title: string; description: string; photographer: string }) => {
    if (!user || !selectedImage) return
    try {
      setUploadingImage(true)
      await addPortfolioItem(user.uid, "cosplayer", selectedImage, details)
      await refreshUserData()
      setModalOpen(false)
      setSelectedImage(null)
    } catch (error) {
      console.error("Error saving portfolio item:", error)
      alert("Failed to save image. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditItem = (itemId: string) => {
    const item = portfolioItems.find((item) => item.id === itemId)
    if (item) {
      setEditingItem(itemId)
      setModalOpen(true)
    }
  }

  const handleUpdateDetails = async (details: { title: string; description: string; photographer: string }) => {
    if (!user || !editingItem) return
    try {
      setUploadingImage(true)
      await updatePortfolioItemDetails(user.uid, editingItem, details)
      await refreshUserData()
      setModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Error updating portfolio item:", error)
      alert("Failed to update image details. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        await deletePortfolioItem(user.uid, itemId)
        await refreshUserData()
      } catch (error) {
        console.error("Error deleting portfolio item:", error)
        alert("Failed to delete image. Please try again.")
      }
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  const portfolio = userData?.portfolio || []
  const canAddMore = portfolio.length < 8

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Portfolio Images</p>
              <p className="text-2xl font-bold text-white">{stats.portfolioImages}/8</p>
            </div>
            <div className="bg-[#ff7145]/20 p-3 rounded-lg">
              <ImageIcon className="w-6 h-6 text-[#ff7145]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Note générale</p>
              <p className="text-2xl font-bold text-white">
                {userData?.averageRating ? `${userData.averageRating.toFixed(1)}/5` : "N/A"}
              </p>
            </div>
            <div className="bg-[#ff7145]/20 p-3 rounded-lg">
              <Star className="w-6 h-6 text-[#ff7145]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Séances à venir</p>
              <p className="text-2xl font-bold text-white">{stats.upcomingShots}</p>
            </div>
            <div className="bg-[#ff7145]/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-[#ff7145]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Séances terminées</p>
              <p className="text-2xl font-bold text-white">{stats.completedShots}</p>
            </div>
            <div className="bg-[#ff7145]/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-[#ff7145]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20">
        <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => setActiveView("portfolio")}
            className="bg-[#ff7145] hover:bg-[#ff8d69] text-white h-auto py-3 flex-col gap-2"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm">Upload Photo</span>
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="text-[#ff7145] hover:bg-[#ff7145]/10 h-auto py-3 flex-col gap-2"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Find Photographers</span>
          </Button>
          <Button
            onClick={() => router.push("/profile")}
            variant="outline"
            className="text-[#ff7145] hover:bg-[#ff7145]/10 h-auto py-3 flex-col gap-2"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-[#ff7145]" />
            Upcoming Shoots
          </h3>
          <div className="space-y-3">
            {loadingBookings ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#ff7145]"></div>
              </div>
            ) : bookings.filter((booking) => booking.status === "accepted").length > 0 ? (
              bookings
                .filter((booking) => booking.status === "accepted")
                .slice(0, 3)
                .map((booking) => {
                  const timeSlot = timeSlots.find((slot) => slot.id === booking.timeSlotId)
                  if (!timeSlot) return null

                  return (
                    <motion.div
                      key={booking.id}
                      className="p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]"
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-white">{booking.cosplayCharacter}</h4>
                          <p className="text-sm text-gray-400">
                            {format(new Date(timeSlot.date), "EEEE d MMMM yyyy", { locale: fr })} • {timeSlot.startTime}
                          </p>
                          <p className="text-xs text-[#ff7145] mt-1">
                            avec {photographers[booking.photographerId]?.displayName || "Photographe"}
                          </p>
                        </div>
                        <span className="bg-[#ff7145]/20 text-[#ff7145] text-xs px-2 py-1 rounded">Confirmed</span>
                      </div>
                    </motion.div>
                  )
                })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No upcoming shoots</p>
                <p className="text-sm mt-2">Book a photographer to see your shoots here</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-[#ff7145]" />
            Recent Messages
          </h3>
          <RecentMessages />
        </div>
      </div>

      {/* Favorite Photographers */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20">
        <h3 className="text-xl font-bold mb-4 text-white flex items-center">
          <Star className="mr-2 text-[#ff7145]" />
          Favorite Photographers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loadingFavorites ? (
            <div className="flex justify-center py-4 col-span-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff7145]"></div>
            </div>
          ) : favoritePhotographers.length > 0 ? (
            favoritePhotographers.map((photographer) => (
              <motion.div
                key={photographer.uid}
                className="p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] flex items-center gap-3 cursor-pointer"
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => router.push(`/photographer/${photographer.uid}`)}
              >
                <div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center overflow-hidden">
                  {photographer.photoURL ? (
                    <Image
                      src={photographer.photoURL || "/placeholder.svg"}
                      alt={photographer.displayName || ""}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <Camera size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{photographer.displayName}</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className={j < (photographer.averageRating || 0) ? "text-[#ff7145]" : "text-gray-500"}
                        fill={j < (photographer.averageRating || 0) ? "#ff7145" : "none"}
                      />
                    ))}
                  </div>
                </div>
                <Eye className="w-4 h-4 text-gray-400" />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 col-span-2">
              <Star className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>No favorite photographers yet</p>
              <p className="text-sm mt-2">Explore photographers and add them to your favorites</p>
              <Button onClick={() => router.push("/")} className="mt-4 bg-[#ff7145] hover:bg-[#ff8d69] text-white">
                Find Photographers
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#ff7145]/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <UserIcon className="mr-2 text-[#ff7145]" />
              Your Cosplay Portfolio
            </h3>
            <p className="text-sm text-gray-400 mt-1">{portfolio.length}/8 images • Images must be less than 5MB</p>
          </div>
          {canAddMore && (
            <Button onClick={() => handleImageSelect} className="bg-[#ff7145] hover:bg-[#ff8d69] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {portfolio.map((item: any) => (
            <div key={item.id} className="relative group">
              <ImageUpload
                previewUrl={item.url}
                title={item.title}
                description={item.description}
                onImageSelect={() => {}}
                className="aspect-square"
              />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  onClick={() => handleEditItem(item.id)}
                  className="bg-blue-500 rounded-full p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-500 rounded-full p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          ))}

          {canAddMore && <ImageUpload onImageSelect={handleImageSelect} className="aspect-square" />}

          {Array.from({ length: Math.max(0, 8 - portfolio.length - (canAddMore ? 1 : 0)) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square bg-[#2a2a2a] rounded-lg border border-dashed border-[#3a3a3a] flex items-center justify-center opacity-30"
            >
              <ImageIcon className="w-8 h-8 text-[#3a3a3a]" />
            </div>
          ))}
        </div>

        {!canAddMore && (
          <p className="mt-4 text-sm text-yellow-500">
            You've reached the maximum of 8 images. Delete some to add more.
          </p>
        )}
      </div>
    </div>
  )

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        {shouldPromptUsernameUpdate && userData && <UsernameUpdateBanner userRole={userData.role} />}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Cosplayer Dashboard
              <span className="text-[#ff7145] ml-2">{userData?.displayName || "Cosplayer"}</span>
            </h1>
            <p className="text-gray-400 mt-2">Manage your cosplay portfolio and bookings</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-[#2a2a2a]">
              <Button
                variant={activeView === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("overview")}
                className={activeView === "overview" ? "bg-[#ff7145] text-white" : "text-gray-400 hover:text-white"}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeView === "portfolio" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("portfolio")}
                className={activeView === "portfolio" ? "bg-[#ff7145] text-white" : "text-gray-400 hover:text-white"}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Portfolio
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatedSection>
          {activeView === "overview" && renderOverview()}
          {activeView === "portfolio" && renderPortfolio()}
        </AnimatedSection>

        {/* Image Details Modal */}
        <ImageDetailsModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedImage(null)
            setEditingItem(null)
          }}
          onSave={editingItem ? handleUpdateDetails : handleSaveDetails}
          initialData={editingItem ? portfolioItems.find((item) => item.id === editingItem) || {} : {}}
          showPhotographerField={true}
        />
      </div>
    </>
  )
}
