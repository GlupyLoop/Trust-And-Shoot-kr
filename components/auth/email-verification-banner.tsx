"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export default function EmailVerificationBanner() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si l'utilisateur n'est pas connecté ou si l'email est déjà vérifié, ne pas afficher la bannière
  if (!user || isEmailVerified) {
    return null
  }

  const handleResendEmail = async () => {
    try {
      setSending(true)
      setError(null)
      await resendVerificationEmail()
      setSent(true)
      setTimeout(() => setSent(false), 5000) // Réinitialiser après 5 secondes
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi de l'email")
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      className="bg-amber-500/20 border border-amber-500 rounded-md p-4 mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-amber-500">
          <AlertCircle size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-500">Vérification d'email requise</h3>
          <p className="text-sm text-gray-200 mt-1">
            Veuillez vérifier votre adresse email ({user.email}) en cliquant sur le lien dans l'email que nous vous
            avons envoyé.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              disabled={sending || sent}
              className="flex items-center gap-1 text-sm bg-amber-500 hover:bg-amber-600 text-black px-3 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : sent ? (
                <>
                  <CheckCircle size={14} />
                  Email envoyé !
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Renvoyer l'email
                </>
              )}
            </button>

            <button onClick={() => window.location.reload()} className="text-sm text-gray-300 hover:text-white">
              J'ai déjà vérifié
            </button>
          </div>

          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    </motion.div>
  )
}
