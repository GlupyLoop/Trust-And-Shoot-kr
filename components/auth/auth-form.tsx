"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  registerUser,
  signInUser,
  signInWithGoogle,
  signInWithFacebook,
  sendPasswordResetEmailToUser,
  type UserRole,
  type GoogleAuthResult,
} from "@/lib/firebase"
import { Eye, EyeOff, Camera, UserIcon, AlertCircle, Check } from "lucide-react"
import AnimatedSection from "../ui/animated-section"

type AuthFormProps = {
  mode: "login" | "register"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<UserRole | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetEmailLoading, setResetEmailLoading] = useState(false)
  const router = useRouter()
  const { refreshUserData } = useAuth()

  // Dans la fonction handleSubmit, modifiez la partie register pour rediriger vers la page de vérification d'email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setShowForgotPassword(false)

    try {
      if (mode === "register") {
        // Validation
        if (!email || !password || !confirmPassword || !role) {
          throw new Error("Please fill in all fields")
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters")
        }

        // Register user
        await registerUser(email, password, role, displayName || undefined)
        // Rafraîchir les données utilisateur avant la redirection
        await refreshUserData()
        // Rediriger vers la page de vérification d'email au lieu de la page d'accueil
        router.push("/verify-email")
      } else {
        // Login
        if (!email || !password) {
          throw new Error("Please enter email and password")
        }

        await signInUser(email, password)
        // Rafraîchir les données utilisateur avant la redirection
        await refreshUserData()
        router.push("/")
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      setError(err.message || "Authentication failed")

      // Si c'est une erreur de mot de passe incorrect, afficher l'option de mot de passe oublié
      if (
        mode === "login" &&
        (err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/user-not-found")
      ) {
        setShowForgotPassword(true)
      }
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour gérer la demande de réinitialisation de mot de passe
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setResetEmailLoading(true)
    setError(null)

    try {
      await sendPasswordResetEmailToUser(email)
      setResetEmailSent(true)
      setTimeout(() => {
        setResetEmailSent(false)
      }, 5000) // Masquer le message après 5 secondes
    } catch (err: any) {
      console.error("Error sending password reset email:", err)
      setError(err.message || "Failed to send password reset email")
    } finally {
      setResetEmailLoading(false)
    }
  }

  // Nouvelle implémentation de l'authentification Google
  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    setShowForgotPassword(false)

    try {
      // Si nous sommes en mode inscription, nous devons d'abord vérifier si un rôle est sélectionné
      if (mode === "register") {
        if (!role) {
          setError("Please select a role (Photographer or Cosplayer) before continuing with Google")
          setLoading(false)
          return
        }

        // Appeler signInWithGoogle avec le rôle sélectionné
        const result: GoogleAuthResult = await signInWithGoogle(role)

        if (result.user) {
          // Rafraîchir les données utilisateur avant la redirection
          await refreshUserData()
          // Rediriger directement vers la page d'accueil pour les utilisateurs Google
          router.push("/")
        } else if (result.emailExists) {
          setError(
            result.error ||
              "Un compte existe déjà avec cette adresse email. Veuillez vous connecter avec votre mot de passe.",
          )
        } else {
          setError(result.error || "Erreur lors de l'authentification Google")
        }
      } else {
        // Mode connexion - pas besoin de rôle
        const result: GoogleAuthResult = await signInWithGoogle()

        if (result.user) {
          // Rafraîchir les données utilisateur avant la redirection
          await refreshUserData()
          router.push("/")
        } else if (result.emailExists) {
          setError(
            result.error ||
              "Un compte existe déjà avec cette adresse email. Veuillez vous connecter avec votre mot de passe.",
          )
        } else {
          setError(result.error || "Erreur lors de l'authentification Google")
        }
      }
    } catch (err: any) {
      console.error("Google auth error:", err)
      setError(err.message || "Google authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setError(null)
    setLoading(true)
    setShowForgotPassword(false)

    try {
      // Si nous sommes en mode inscription, nous devons d'abord vérifier si un rôle est sélectionné
      if (mode === "register") {
        if (!role) {
          setError("Please select a role (Photographer or Cosplayer) before continuing with Facebook")
          setLoading(false)
          return
        }

        // Appeler signInWithFacebook avec le rôle sélectionné
        const result: GoogleAuthResult = await signInWithFacebook(role)

        if (result.user) {
          // Rafraîchir les données utilisateur avant la redirection
          await refreshUserData()
          // Rediriger directement vers la page d'accueil pour les utilisateurs Facebook
          router.push("/")
        } else if (result.emailExists) {
          setError(
            result.error ||
              "Un compte existe déjà avec cette adresse email. Veuillez vous connecter avec votre mot de passe.",
          )
        } else {
          setError(result.error || "Erreur lors de l'authentification Facebook")
        }
      } else {
        // Mode connexion - pas besoin de rôle
        const result: GoogleAuthResult = await signInWithFacebook()

        if (result.user) {
          // Rafraîchir les données utilisateur avant la redirection
          await refreshUserData()
          router.push("/")
        } else if (result.emailExists) {
          setError(
            result.error ||
              "Un compte existe déjà avec cette adresse email. Veuillez vous connecter avec votre mot de passe.",
          )
        } else {
          setError(result.error || "Erreur lors de l'authentification Facebook")
        }
      }
    } catch (err: any) {
      console.error("Facebook auth error:", err)
      setError(err.message || "Facebook authentication failed")
    } finally {
      setLoading(false)
    }
  }

  // Regular login/register form
  return (
    <div className="w-full">
      <AnimatedSection>
        <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-xl border border-[#ff7145]/20">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>

          {error && (
            <motion.div
              className="bg-red-500/20 border border-red-500 text-white p-3 rounded-md mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {resetEmailSent && (
            <motion.div
              className="bg-green-500/20 border border-green-500 text-white p-3 rounded-md mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Password reset email sent! Please check your inbox.</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">I am a:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 ${
                        role === "photographer"
                          ? "border-[#ff7145] bg-[#ff7145]/20"
                          : "border-[#3a3a3a] hover:border-[#ff7145]/50"
                      }`}
                      onClick={() => setRole("photographer")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Camera size={24} className={role === "photographer" ? "text-[#ff7145]" : ""} />
                      <span>Photographer</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 ${
                        role === "cosplayer"
                          ? "border-[#ff7145] bg-[#ff7145]/20"
                          : "border-[#3a3a3a] hover:border-[#ff7145]/50"
                      }`}
                      onClick={() => setRole("cosplayer")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <UserIcon size={24} className={role === "cosplayer" ? "text-[#ff7145]" : ""} />
                      <span>Cosplayer</span>
                    </motion.button>
                  </div>
                </div>

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
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145] pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 bg-[#2a2a2a] rounded-md border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ff7145]"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Afficher l'option de mot de passe oublié si nécessaire */}
            {mode === "login" && showForgotPassword && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[#ff7145] hover:text-[#ff8d69] text-sm font-medium focus:outline-none"
                  disabled={resetEmailLoading}
                >
                  {resetEmailLoading ? "Sending..." : "Forgot your password?"}
                </button>
              </div>
            )}

            <motion.button
              type="submit"
              className="w-full bg-[#ff7145] text-white py-2 rounded-md font-medium mt-4 hover:bg-[#ff8d69] transition-colors"
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </motion.button>

            <div className="relative my-6 flex items-center">
              <div className="flex-grow border-t border-[#3a3a3a]"></div>
              <span className="mx-4 flex-shrink text-xs text-gray-400">OR</span>
              <div className="flex-grow border-t border-[#3a3a3a]"></div>
            </div>

            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#171717] py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleFacebookSignIn}
                className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2 rounded-md font-medium hover:bg-[#166FE5] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {mode === "login" ? "Sign in with Facebook" : "Sign up with Facebook"}
              </motion.button>
            </div>
          </form>
        </div>
      </AnimatedSection>
    </div>
  )
}
