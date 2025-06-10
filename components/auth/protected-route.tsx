"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import LoadingSpinner from "@/components/ui/loading-spinner"

type ProtectedRouteProps = {
  children: ReactNode
  requireVerification?: boolean // Si true, l'email doit être vérifié
  fallbackUrl?: string // URL de redirection personnalisée
}

export default function ProtectedRoute({ children, requireVerification = true, fallbackUrl }: ProtectedRouteProps) {
  const { user, isEmailVerified, loading } = useAuth()
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackUrl || "/login")
      } else if (requireVerification && !isEmailVerified) {
        router.push("/verify-email")
      } else {
        setIsCheckingAuth(false)
      }
    }
  }, [user, isEmailVerified, loading, router, requireVerification, fallbackUrl])

  // Afficher un écran de chargement pendant la vérification
  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté ou si l'email n'est pas vérifié (quand requis), ne pas afficher le contenu
  if (!user || (requireVerification && !isEmailVerified)) {
    return null
  }

  // Si l'utilisateur est connecté et que l'email est vérifié (ou non requis), afficher le contenu
  return <>{children}</>
}
