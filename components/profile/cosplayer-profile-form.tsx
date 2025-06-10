"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { updateCosplayerProfile, uploadImage, type CosplayerData } from "@/lib/firebase"
import { UserIcon, Upload, Settings, Instagram, Facebook, Twitter, Globe, Tag } from "lucide-react"
import Image from "next/image"
import AnimatedSection from "../ui/animated-section"
import CountryFlag from "../ui/country-flag"
import { COSPLAYER_TAGS } from "@/constants/cosplayer-tags"
import TagSelector from "./tag-selector"

// Importez useAuth
import { useAuth } from "@/contexts/auth-context"

type CosplayerProfileFormProps = {
  userData: CosplayerData | null
}

export default function CosplayerProfileForm({ userData }: CosplayerProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Vérifier si userData existe avant d'accéder à ses propriétés
  // Form state avec valeurs par défaut sécurisées
  const [displayName, setDisplayName] = useState(userData?.displayName || "")
  const [bio, setBio] = useState(userData?.bio || "")
  const [location, setLocation] = useState(userData?.location || "")
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || "")
  const [website, setWebsite] = useState(userData?.website || "")
  const [instagram, setInstagram] = useState(userData?.socialMedia?.instagram || "")
  const [facebook, setFacebook] = useState(userData?.socialMedia?.facebook || "")
  const [twitter, setTwitter] = useState(userData?.socialMedia?.twitter || "")
  const [tiktok, setTiktok] = useState(userData?.socialMedia?.tiktok || "")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(userData?.photoURL || null)

  // State for tags
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>(() => {
    const initialTags: Record<string, string[]> = {}
    COSPLAYER_TAGS.forEach((category) => {
      initialTags[category.id] = userData?.tags?.[category.id] || []
    })
    return initialTags
  })

  // Dans la fonction CosplayerProfileForm, ajoutez cette ligne après les autres hooks
  const { refreshUserData } = useAuth()

  // Effet pour mettre à jour les états lorsque userData change
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "")
      setBio(userData.bio || "")
      setLocation(userData.location || "")
      setPhoneNumber(userData.phoneNumber || "")
      setWebsite(userData.website || "")
      setInstagram(userData.socialMedia?.instagram || "")
      setFacebook(userData.socialMedia?.facebook || "")
      setTwitter(userData.socialMedia?.twitter || "")
      setTiktok(userData?.socialMedia?.tiktok || "")
      setProfileImagePreview(userData.photoURL || null)

      // Update tags
      const updatedTags: Record<string, string[]> = {}
      COSPLAYER_TAGS.forEach((category) => {
        updatedTags[category.id] = userData.tags?.[category.id] || []
      })
      setSelectedTags(updatedTags)
    }
  }, [userData])

  // Vérifier si userData existe avant de continuer
  if (!userData) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md">
          <p>Erreur: Impossible de charger les données utilisateur. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    )
  }

  // Handle tag selection
  const handleTagChange = (categoryId: string, tagId: string, isSelected: boolean) => {
    setSelectedTags((prev) => {
      const updatedTags = { ...prev }
      const currentTags = [...(updatedTags[categoryId] || [])]

      if (isSelected) {
        // Ajouter le tag s'il n'est pas déjà présent
        if (!currentTags.includes(tagId)) {
          currentTags.push(tagId)
        }
      } else {
        // Retirer le tag
        const index = currentTags.indexOf(tagId)
        if (index !== -1) {
          currentTags.splice(index, 1)
        }
      }

      updatedTags[categoryId] = currentTags
      return updatedTags
    })
  }

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size - 5MB limit
      const maxSizeInBytes = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSizeInBytes) {
        setError("L'image de profil ne doit pas dépasser 5Mo")
        return
      }

      setProfileImage(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  // Modifiez la fonction handleSubmit pour éviter les valeurs undefined
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Créer un objet de base pour les données du profil
      const profileData: Record<string, any> = {}

      // Ajouter les champs de base seulement s'ils ne sont pas undefined
      if (displayName) profileData.displayName = displayName
      if (bio) profileData.bio = bio
      if (location) profileData.location = location
      if (phoneNumber) profileData.phoneNumber = phoneNumber
      if (website) profileData.website = website

      // Add tags
      profileData.tags = selectedTags

      // Gérer l'image de profil
      if (profileImage) {
        const photoURL = await uploadImage(profileImage, `cosplayers/${userData.uid}/profile`)
        profileData.photoURL = photoURL
      } else if (userData.photoURL) {
        // Conserver l'URL de photo existante si elle existe
        profileData.photoURL = userData.photoURL
      }

      // Créer l'objet socialMedia seulement avec les valeurs non-undefined
      const socialMedia: Record<string, string> = {}
      if (instagram) socialMedia.instagram = instagram
      if (facebook) socialMedia.facebook = facebook
      if (twitter) socialMedia.twitter = twitter
      if (tiktok) socialMedia.tiktok = tiktok

      // Ajouter socialMedia seulement s'il contient des données
      if (Object.keys(socialMedia).length > 0) {
        profileData.socialMedia = socialMedia
      }

      // Mettre à jour le profil
      await updateCosplayerProfile(userData.uid, profileData)

      // Rafraîchir les données utilisateur dans le contexte
      await refreshUserData()

      setSuccess(true)

      // Faites défiler la page vers le haut pour montrer le message de succès
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Masquez le message de succès après quelques secondes
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatedSection>
        <h1 className="text-2xl font-bold mb-6">Complete Your Cosplayer Profile</h1>

        {error && (
          <motion.div
            className="bg-red-500/20 border border-red-500 text-white p-3 rounded-md mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="bg-green-500/20 border border-green-500 text-white p-3 rounded-md mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Profile updated successfully! You can continue editing or return to your{" "}
            <button onClick={() => router.push("/cosplayer-dashboard")} className="underline text-[#ff7145]">
              dashboard
            </button>
            .
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-32 h-32 rounded-full bg-[#2a2a2a] overflow-hidden relative cursor-pointer border-2 border-[#ff7145]"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImagePreview ? (
                <Image src={profileImagePreview || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <UserIcon size={40} className="text-[#ff7145]" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfileImageChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-sm text-gray-400 mt-2">Click to upload profile photo (max 5MB)</p>
          </div>

          {/* Basic Information */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#ff7145]/20">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Settings className="mr-2 text-[#ff7145]" /> Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location
                </label>
                <div className="relative">
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 pl-10 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    <option value="Belgium">Belgium</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Netherlands">Netherlands</option>
                  </select>
                  {location && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <CountryFlag country={location} width={18} height={13} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-1">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145] min-h-[100px]"
                  placeholder="Tell us about yourself and your cosplay experience..."
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#ff7145]/20">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Globe className="mr-2 text-[#ff7145]" /> Social Media
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium mb-1 flex items-center">
                  <Instagram size={16} className="mr-2 text-[#ff7145]" /> Instagram
                </label>
                <input
                  id="instagram"
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="@username"
                />
              </div>

              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium mb-1 flex items-center">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-[#ff7145]"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                  TikTok
                </label>
                <input
                  id="tiktok"
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="@username"
                />
              </div>

              <div>
                <label htmlFor="facebook" className="block text-sm font-medium mb-1 flex items-center">
                  <Facebook size={16} className="mr-2 text-[#ff7145]" /> Facebook
                </label>
                <input
                  id="facebook"
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="username or page name"
                />
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium mb-1 flex items-center">
                  <Twitter size={16} className="mr-2 text-[#ff7145]" /> Twitter
                </label>
                <input
                  id="twitter"
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p>
                Ajoutez vos profils de réseaux sociaux pour permettre aux photographes et fans de vous trouver
                facilement.
              </p>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#ff7145]/20">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Tag className="mr-2 text-[#ff7145]" /> Cosplay Tags
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              Sélectionnez les tags qui représentent le mieux votre style et vos services. Ces tags aideront les
              photographes à vous trouver plus facilement.
            </p>

            <TagSelector categories={COSPLAYER_TAGS} selectedTags={selectedTags} onChange={handleTagChange} />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full bg-[#ff7145] text-white py-3 rounded-md font-medium hover:bg-[#ff8d69] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving Profile...
              </span>
            ) : (
              "Save Profile"
            )}
          </motion.button>
        </form>
      </AnimatedSection>
    </div>
  )
}
