import { Lightbulb, Shield, Settings, Sprout } from "lucide-react"

export default function Slide9Differenciateurs() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Différenciateurs <span className="text-orange-500">clés</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Lightbulb className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Spécialisation cosplay</h3>
            </div>
            <p className="text-gray-300">
              Notre outil parle le langage de la communauté et répond à ses besoins spécifiques
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Sécurité et confiance</h3>
            </div>
            <p className="text-gray-300">
              Mise en avant de la sécurité, de la transparence et de la réputation des utilisateurs
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Settings className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Fonctionnalités utiles</h3>
            </div>
            <p className="text-gray-300">
              Matching intelligent, réservation de créneaux et intégration des conventions
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Sprout className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Projet évolutif</h3>
            </div>
            <p className="text-gray-300">
              Vision claire : marketplace, IA, calendrier partagé et expansion internationale
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-orange-600/20 to-orange-500/10 rounded-xl border border-orange-500/30">
          <p className="text-xl text-center">
            Trust & Shoot n'est pas juste une application, c'est une{" "}
            <span className="text-orange-400 font-medium">solution complète</span> pour la communauté cosplay
          </p>
        </div>
      </div>
    </div>
  )
}
