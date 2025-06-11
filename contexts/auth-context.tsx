"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { auth, getUserData, type UserData, sendVerificationEmail } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Modifiez le type AuthContextType pour inclure les nouvelles fonctions
type AuthContextType = {
  user: User | null
  userData: UserData | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  isEmailVerified: boolean
  resendVerificationEmail: () => Promise<void>
  shouldPromptUsernameUpdate: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  refreshUserData: async () => {},
  isEmailVerified: false,
  resendVerificationEmail: async () => {},
  shouldPromptUsernameUpdate: false,
})

export const useAuth = () => useContext(AuthContext)

// Liste des chemins accessibles sans vérification d'email
const PUBLIC_PATHS = ["/login", "/register", "/verify-email"]

// Dans le AuthProvider, ajoutez l'état et les fonctions pour la vérification d'email
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [shouldPromptUsernameUpdate, setShouldPromptUsernameUpdate] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = async () => {
    if (user) {
      try {
        // Rafraîchir l'objet utilisateur pour obtenir le statut de vérification d'email à jour
        await user.reload()
        const refreshedUser = auth.currentUser

        if (refreshedUser) {
          setUser(refreshedUser)
          setIsEmailVerified(refreshedUser.emailVerified || false)

          const userDataFromFirestore = await getUserData(refreshedUser.uid)
          setUserData(userDataFromFirestore)

          // Vérifier si l'utilisateur doit être invité à mettre à jour son nom d'utilisateur
          if (userDataFromFirestore) {
            // Vérifier si l'utilisateur s'est connecté via Google et n'a pas encore personnalisé son profil
            const isGoogleUser = refreshedUser.providerData.some((provider) => provider.providerId === "google.com")
            const hasDefaultUsername = userDataFromFirestore.displayName === refreshedUser.displayName

            // Définir si nous devons inviter l'utilisateur à mettre à jour son nom d'utilisateur
            setShouldPromptUsernameUpdate(isGoogleUser && hasDefaultUsername && !userDataFromFirestore.profileComplete)
          }

          // Mettre à jour le statut de vérification dans Firestore si nécessaire
          if (refreshedUser.emailVerified && userDataFromFirestore && !userDataFromFirestore.emailVerified) {
            await updateDoc(doc(db, "users", refreshedUser.uid), {
              emailVerified: true,
            })
          }
        }
      } catch (err) {
        console.error("Error refreshing user data:", err)
      }
    }
  }

  // Fonction pour renvoyer l'email de vérification avec gestion d'erreur améliorée
  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      try {
        console.log("Attempting to resend verification email for user:", user.email)

        // Recharger l'utilisateur pour obtenir les dernières informations
        await user.reload()
        const refreshedUser = auth.currentUser

        if (!refreshedUser) {
          throw new Error("Utilisateur non trouvé après rechargement")
        }

        if (refreshedUser.emailVerified) {
          console.log("Email already verified after reload")
          setIsEmailVerified(true)
          return true
        }

        await sendVerificationEmail(refreshedUser)
        console.log("Verification email resent successfully")
        return true
      } catch (err: any) {
        console.error("Error resending verification email:", {
          code: err.code,
          message: err.message,
          name: err.name,
        })

        // Relancer l'erreur avec le message amélioré
        throw new Error(err.message || "Erreur lors de l'envoi de l'email. Veuillez réessayer.")
      }
    } else {
      throw new Error("Aucun utilisateur connecté ou email déjà vérifié")
    }
  }

  useEffect(() => {
    setLoading(true)

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser)

          // Vérifier si l'email est vérifié
          setIsEmailVerified(currentUser.emailVerified)

          // Get additional user data from Firestore
          const userDataFromFirestore = await getUserData(currentUser.uid)
          setUserData(userDataFromFirestore)

          // Vérifier si l'utilisateur doit être invité à mettre à jour son nom d'utilisateur
          if (userDataFromFirestore) {
            // Vérifier si l'utilisateur s'est connecté via Google et n'a pas encore personnalisé son profil
            const isGoogleUser = currentUser.providerData.some((provider) => provider.providerId === "google.com")
            const hasDefaultUsername = userDataFromFirestore.displayName === currentUser.displayName

            // Définir si nous devons inviter l'utilisateur à mettre à jour son nom d'utilisateur
            setShouldPromptUsernameUpdate(isGoogleUser && hasDefaultUsername && !userDataFromFirestore.profileComplete)
          }

          // Mettre à jour le statut de vérification dans Firestore si nécessaire
          if (currentUser.emailVerified && userDataFromFirestore && !userDataFromFirestore.emailVerified) {
            await updateDoc(doc(db, "users", currentUser.uid), {
              emailVerified: true,
            })
          }
        } else {
          setUser(null)
          setUserData(null)
          setIsEmailVerified(false)
          setShouldPromptUsernameUpdate(false)
        }
      } catch (err) {
        console.error("Auth state change error:", err)
        setError("Failed to authenticate")
      } finally {
        setLoading(false)
      }
    })

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      unsubscribe()
    }
  }, [])

  // Effet pour rediriger l'utilisateur si son email n'est pas vérifié
  useEffect(() => {
    if (!loading && user && !isEmailVerified && !PUBLIC_PATHS.includes(pathname || "")) {
      router.push("/verify-email")
    }
  }, [user, isEmailVerified, loading, pathname, router])

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        refreshUserData,
        isEmailVerified,
        resendVerificationEmail,
        shouldPromptUsernameUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
