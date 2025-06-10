import Image from "next/image"

export default function Slide8UiUxDesign() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          UI/UX <span className="text-orange-500">Design</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Interface claire, colorée et adaptée à la communauté</h3>

              <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
                <Image src="/trust-shoot-interface.png" alt="Interface Trust & Shoot" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-medium">Page d'accueil</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Parcours utilisateur fluide</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="text-orange-500 mr-2 text-xl">1.</span>
                Inscription simplifiée
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2 text-xl">2.</span>
                Création de profil intuitive
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2 text-xl">3.</span>
                Recherche et filtrage efficaces
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2 text-xl">4.</span>
                Réservation en quelques clics
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Composants clés</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">•</span>
                Cartes de profil avec portfolio
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">•</span>
                Système de notation avec étoiles
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">•</span>
                Carte interactive des conventions
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">•</span>
                Messagerie intuitive
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">•</span>
                Calendrier de réservation
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl text-orange-400 font-medium">
            Un prototype Figma a été réalisé pour tester le flow complet
          </p>
        </div>
      </div>
    </div>
  )
}
