import { Heart, Users, Star, Calendar, Camera } from "lucide-react"

export default function Slide4Concept() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Concept de <span className="text-orange-500">l'application</span>
          </h2>
          <div className="bg-orange-900/20 border border-orange-500/30 p-6 rounded-xl max-w-3xl mx-auto">
            <p className="text-xl text-gray-300">
              Trust & Shoot, c'est une web-app pensée comme un
              <span className="text-orange-400 font-semibold"> Tinder sécurisé </span>
              pour photographes et cosplayers.
            </p>
          </div>
        </div>

        {/* Fonctionnalités principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800/50 border border-gray-600 p-6 rounded-xl text-center">
            <div className="bg-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Profil vérifié</h3>
            <p className="text-gray-400 text-sm">avec portfolio</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-600 p-6 rounded-xl text-center">
            <div className="bg-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Matching</h3>
            <p className="text-gray-400 text-sm">styles, localisation, disponibilités</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-600 p-6 rounded-xl text-center">
            <div className="bg-green-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Réservation</h3>
            <p className="text-gray-400 text-sm">créneaux pour shootings</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-600 p-6 rounded-xl text-center">
            <div className="bg-yellow-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Réputation</h3>
            <p className="text-gray-400 text-sm">avis et visibilité</p>
          </div>
        </div>

        {/* Message de conclusion */}
        <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 p-8 rounded-2xl text-center">
          <Camera className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Une application pensée <span className="text-orange-400">par et pour la communauté</span>
          </h3>
          <p className="text-xl text-gray-300">avec des outils vraiment utiles.</p>
        </div>
      </div>
    </div>
  )
}
