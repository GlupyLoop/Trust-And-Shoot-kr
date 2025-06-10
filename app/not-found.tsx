"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, ArrowLeft } from "lucide-react"
import AnimatedSection from "@/components/ui/animated-section"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <AnimatedSection>
        <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#2a2a2a] max-w-md w-full text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ff7145]/20 text-[#ff7145]">
              <span className="text-5xl font-bold">404</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Page non trouvée</h1>
          <p className="text-gray-400 mb-6">La page que vous recherchez n'existe pas ou a été déplacée.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-md transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Retour</span>
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#ff7145] hover:bg-[#ff8d69] text-white rounded-md transition-colors"
            >
              <Home size={16} />
              <span>Accueil</span>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
