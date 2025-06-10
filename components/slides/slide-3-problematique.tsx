import { AlertTriangle, Search, Shield, Calendar, MessageSquare } from "lucide-react"

export default function Slide3Problematique() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="text-red-500">Problématique</span>
          </h2>
          <p className="text-xl text-gray-400">Aujourd'hui, dans l'univers du cosplay :</p>
        </div>

        {/* Grille des problèmes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <Search className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-semibold text-red-400">Difficulté de recherche</h3>
            </div>
            <p className="text-gray-300">Il est difficile de trouver un photographe ou un cosplayer de confiance</p>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-semibold text-red-400">Absence de plateforme</h3>
            </div>
            <p className="text-gray-300">
              Il n'existe pas de plateforme dédiée pour organiser efficacement un shooting
            </p>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <MessageSquare className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-semibold text-red-400">Rencontres à l'aveugle</h3>
            </div>
            <p className="text-gray-300">Les rencontres se font à l'aveugle, souvent via les réseaux sociaux</p>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-semibold text-red-400">Manque d'outils</h3>
            </div>
            <p className="text-gray-300">Les conventions manquent d'outils numériques pour coordonner les séances</p>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-gray-800/50 border border-gray-600 p-8 rounded-2xl text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Conséquence</h3>
          <p className="text-xl text-gray-300 leading-relaxed">
            Ce manque d'organisation et de confiance{" "}
            <span className="text-red-400 font-semibold">freine la création artistique</span>
            <br />
            et <span className="text-red-400 font-semibold">décourage les collaborations</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
