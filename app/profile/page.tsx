"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import PhotographerProfileForm from "@/components/profile/photographer-profile-form"
import CosplayerProfileForm from "@/components/profile/cosplayer-profile-form"
import Header from "@/components/header"
import UsernameUpdateBanner from "@/components/auth/username-update-banner"

export default function ProfilePage() {
  const { user, userData, loading, shouldPromptUsernameUpdate } = useAuth()
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        setPageLoading(false)
      }
    }
  }, [user, loading, router])

  // Show loading state
  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="relative container mx-auto px-4 py-8 pt-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "url(/Design_2.svg)",
            backgroundSize: "800px 800px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            transform: "rotate(-15deg) scale(1.2)",
            transformOrigin: "center",
          }}
        />
        <div className="relative z-10">
          {shouldPromptUsernameUpdate && userData && <UsernameUpdateBanner userRole={userData.role} />}
          {userData?.role === "photographer" ? (
            <PhotographerProfileForm userData={userData} />
          ) : (
            <CosplayerProfileForm userData={userData} />
          )}
        </div>
      </main>
    </>
  )
}
