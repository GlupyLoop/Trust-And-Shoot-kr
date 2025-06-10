"use client"

import AuthForm from "@/components/auth/auth-form"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, User, Star, Calendar, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
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
            Connectez <span className="text-[#ff7145]">photographes</span> et{" "}
            <span className="text-[#ff7145]">cosplayers</span> pour des séances photo exceptionnelles
          </h2>

          <p className="text-gray-300 mb-8">
            Trust & Shoot est une plateforme qui met en relation les photographes professionnels et les cosplayers
            passionnés. Trouvez le partenaire idéal pour vos projets créatifs, partagez vos portfolios et développez
            votre réseau.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#ff7145]/20 p-2 rounded-full">
                  <Camera size={20} className="text-[#ff7145]" />
                </div>
                <h3 className="font-bold text-[#ff7145]">Photographes</h3>
              </div>
              <p className="text-sm text-gray-400">
                Présentez votre portfolio, trouvez des modèles et développez votre clientèle
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#ff7145]/20 p-2 rounded-full">
                  <User size={20} className="text-[#ff7145]" />
                </div>
                <h3 className="font-bold text-[#ff7145]">Cosplayers</h3>
              </div>
              <p className="text-sm text-gray-400">Mettez en valeur vos créations avec des photos professionnelles</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-[#ff7145]" />
              <span className="text-sm text-gray-300">Évaluations vérifiées</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#ff7145]" />
              <span className="text-sm text-gray-300">Réservations simplifiées</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#ff7145]" />
              <span className="text-sm text-gray-300">Messagerie sécurisée</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Login form */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          <AuthForm mode="login" />
          <p className="text-sm text-gray-400 text-center mt-4">
            Pas encore inscrit ?{" "}
            <Link href="/register" className="text-[#ff7145] hover:underline">
              Créez un compte
            </Link>{" "}
            et rejoignez notre communauté créative.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
