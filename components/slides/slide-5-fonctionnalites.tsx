import { Shield, Calendar, MapPin, Star, Filter, MessageCircle } from "lucide-react"

export default function Slide5Fonctionnalites() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Fonctionnalités <span className="text-orange-500">principales</span>
          </h2>
        </div>

        {/* Grille des fonctionnalités */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">✔️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Profils vérifiés</h3>
            <p className="text-gray-300">avec portfolio complet et authentification sécurisée</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🗓️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Réservation de créneaux</h3>
            <p className="text-gray-300">et agenda partagé pour une organisation optimale</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-500 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🧭</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Carte des conventions</h3>
            <p className="text-gray-300">et présence utilisateur en temps réel</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-yellow-500 p-3 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Système d'évaluations</h3>
            <p className="text-gray-300">et de commentaires pour bâtir la confiance</p>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-500 p-3 rounded-full">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Filtres avancés</h3>
            <p className="text-gray-300">par style, localisation, expérience et plus</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-500 p-3 rounded-full">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Messagerie intégrée</h3>
            <p className="text-gray-300">communication sécurisée et historique des échanges</p>
          </div>
        </div>

        {/* Message de conclusion */}
        <div className="mt-12 bg-gray-800/50 border border-gray-600 p-8 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Tout ce dont vous avez besoin pour des <span className="text-orange-400">collaborations réussies</span>
          </h3>
        </div>
      </div>
    </div>
  )
}
