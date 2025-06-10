"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { signOutUser } from "@/lib/firebase"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const { user, isEmailVerified, resendVerificationEmail, refreshUserData } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [checking, setChecking] = useState(false)
  const router = useRouter()
  const [resendLoading, setResendLoading] = useState(false)

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (isEmailVerified) {
      router.push("/")
    }
  }, [user, isEmailVerified, router])

  // Gérer le compte à rebours pour le renvoi d'email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Fonction pour renvoyer l'email de vérification
  const handleResendEmail = async () => {
    if (countdown > 0) return

    setResendLoading(true)
    try {
      await resendVerificationEmail()
      toast.success("Email de vérification envoyé avec succès!")
      setCountdown(60) // Set 60 second cooldown
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast.error("Erreur lors de l'envoi de l'email. Veuillez réessayer.")
    } finally {
      setResendLoading(false)
    }
  }

  // Fonction pour vérifier si l'email a été vérifié
  const checkVerification = async () => {
    if (!user) return

    try {
      setChecking(true)
      await refreshUserData()
      if (isEmailVerified) {
        router.push("/")
      }
    } catch (err) {
      console.error("Error checking verification:", err)
    } finally {
      setChecking(false)
    }
  }

  // Fonction pour se déconnecter
  const handleSignOut = async () => {
    try {
      await signOutUser()
      router.push("/login")
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg shadow-lg p-8 border border-[#2a2a2a]">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-[#ff7145]/10 rounded-full flex items-center justify-center mb-4">
            <Mail size={40} className="text-[#ff7145]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Vérifiez votre adresse email</h1>
          <p className="text-gray-400">
            Un email de vérification a été envoyé à <span className="text-white font-medium">{user.email}</span>
          </p>
        </div>

        <div className="bg-[#2a2a2a] p-4 rounded-md mb-6">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Vous devez vérifier votre adresse email avant de pouvoir accéder à Trust & Shoot. Veuillez vérifier votre
              boîte de réception et cliquer sur le lien de vérification.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.button
            onClick={checkVerification}
            className="w-full bg-[#ff7145] text-white py-3 rounded-md font-medium flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={checking}
          >
            {checking ? (
              <RefreshCw size={20} className="animate-spin mr-2" />
            ) : (
              <CheckCircle size={20} className="mr-2" />
            )}
            J'ai vérifié mon email
          </motion.button>

          <motion.button
            onClick={handleResendEmail}
            className={`w-full border border-[#ff7145] text-[#ff7145] py-3 rounded-md font-medium flex items-center justify-center ${
              countdown > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            whileHover={countdown > 0 ? {} : { scale: 1.02 }}
            whileTap={countdown > 0 ? {} : { scale: 0.98 }}
            disabled={countdown > 0 || sending}
          >
            {sending ? <RefreshCw size={20} className="animate-spin mr-2" /> : <Mail size={20} className="mr-2" />}
            {countdown > 0 ? `Renvoyer l'email (${countdown}s)` : "Renvoyer l'email de vérification"}
          </motion.button>

          {sent && !error && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-3 rounded-md text-sm">
              Email de vérification envoyé avec succès !
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-md text-sm">{error}</div>
          )}

          <div className="pt-4 border-t border-[#2a2a2a] mt-4">
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white text-sm flex items-center justify-center w-full"
            >
              Se déconnecter et utiliser une autre adresse email
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Image src="/logo.png" alt="Trust & Shoot" width={120} height={40} />
      </div>
    </div>
  )
}
