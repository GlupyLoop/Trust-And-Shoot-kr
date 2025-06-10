import { User, Heart, Code, Camera } from "lucide-react"

export default function Slide2Introduction() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Introduction & <span className="text-orange-500">Contexte</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Profil créateur */}
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-orange-500 p-3 rounded-full">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Glupyloop</h3>
                <p className="text-orange-400">Créateur & Photographe</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">Photographe cosplay spécialisé</span>
              </div>
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">Designer web passionné</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">Actif dans la communauté geek</span>
              </div>
            </div>
          </div>

          {/* Problématique */}
          <div className="space-y-6">
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
              <h4 className="text-xl font-semibold text-red-400 mb-3">Le Constat</h4>
              <p className="text-gray-300 leading-relaxed">
                Organiser un shooting de qualité entre un photographe et un cosplayer est souvent un{" "}
                <span className="text-red-400 font-semibold">vrai parcours du combattant</span>.
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/30 p-6 rounded-xl">
              <h4 className="text-xl font-semibold text-orange-400 mb-3">Les Freins</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• Absence de visibilité</li>
                <li>• Manque de confiance</li>
                <li>• Annulations de dernière minute</li>
              </ul>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl">
              <h4 className="text-xl font-semibold text-green-400 mb-3">La Solution</h4>
              <p className="text-gray-300 leading-relaxed">
                <span className="text-green-400 font-semibold">Trust & Shoot</span> : une réponse créative et digitale
                qui facilite, sécurise et enrichit les collaborations cosplay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
