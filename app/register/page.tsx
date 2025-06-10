"use client"

import AuthForm from "@/components/auth/auth-form"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  const { user, isEmailVerified } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Si l'utilisateur est connecté mais n'a pas vérifié son email, rediriger vers la page de vérification
      if (!isEmailVerified) {
        router.push("/verify-email")
      } else {
        // Sinon, rediriger vers la page d'accueil
        router.push("/")
      }
    }
  }, [user, isEmailVerified, router])

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#141414]">
      {/* Left side - Concept explanation */}
      <motion.div
        className="md:w-1/2 bg-gradient-to-br from-[#1a1a1a] to-[#141414] p-8 md:p-12 flex flex-col justify-center"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-auto relative">
              <Image src="/logo.png" alt="Trust & Shoot Logo" width={60} height={48} className="h-full w-auto" />
            </div>
            <h1 className="font-bold text-3xl">
              TRUST <span className="text-[#ff7145]">&</span> SHOOT
            </h1>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#fffbea]">
            Rejoignez la communauté <span className="text-[#ff7145]">Trust & Shoot</span>
          </h2>

          <p className="text-gray-300 mb-8">
            Créez votre compte et commencez à collaborer avec des talents créatifs. Que vous soyez photographe ou
            cosplayer, notre plateforme vous offre les outils pour développer votre passion.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-xl">📝</div>
              <div>
                <h3 className="font-bold text-[#fffbea]">Créez votre profil professionnel</h3>
                <p className="text-sm text-gray-400">
                  Présentez votre travail et vos compétences avec un portfolio personnalisé
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-xl">🤝</div>
              <div>
                <h3 className="font-bold text-[#fffbea]">Connectez-vous avec des talents</h3>
                <p className="text-sm text-gray-400">
                  Trouvez des partenaires créatifs qui correspondent à votre style et à vos projets
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-xl">📅</div>
              <div>
                <h3 className="font-bold text-[#fffbea]">Gérez vos réservations</h3>
                <p className="text-sm text-gray-400">
                  Organisez facilement vos séances photo et suivez votre calendrier
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-xl">⭐</div>
              <div>
                <h3 className="font-bold text-[#fffbea]">Développez votre réputation</h3>
                <p className="text-sm text-gray-400">
                  Recevez des avis et construisez votre crédibilité dans la communauté
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Photographes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Cosplayers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Évaluations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Messagerie</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Registration form */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          <AuthForm mode="register" />
          <p className="text-sm text-gray-400 text-center mt-4">
            Déjà membre ?{" "}
            <Link href="/login" className="text-[#ff7145] hover:underline">
              Connectez-vous
            </Link>{" "}
            à votre compte.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
