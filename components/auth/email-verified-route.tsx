"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import EmailVerificationBanner from "./email-verification-banner"

type EmailVerifiedRouteProps = {
  children: ReactNode
  requireVerification?: boolean // Si false, la bannière sera affichée mais l'accès sera autorisé
}

export default function EmailVerifiedRoute({ children, requireVerification = true }: EmailVerifiedRouteProps) {
  const { user, isEmailVerified, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si l'utilisateur n'est pas en cours de chargement et soit n'est pas connecté, soit n'a pas vérifié son email
    if (!loading && requireVerification) {
      if (!user) {
        router.push("/login")
      } else if (!isEmailVerified) {
        router.push("/verify-email")
      }
    }
  }, [user, isEmailVerified, loading, router, requireVerification])

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  // Si la vérification est requise et que l'email n'est pas vérifié, ne pas afficher le contenu
  if (requireVerification && (!user || !isEmailVerified)) {
    return null
  }

  // Si la vérification n'est pas requise ou si l'email est vérifié, afficher le contenu
  return (
    <>
      {user && !isEmailVerified && <EmailVerificationBanner />}
      {children}
    </>
  )
}
