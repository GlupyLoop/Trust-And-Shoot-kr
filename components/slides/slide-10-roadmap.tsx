export default function Slide10Roadmap() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Roadmap & <span className="text-orange-500">perspectives</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4 mx-auto">
              <span className="text-orange-500 font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-center">État actuel</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Développement du MVP en cours</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Design finalisé</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Authentification & base de données fonctionnelles</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Fonctionnalités de base implémentées</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4 mx-auto">
              <span className="text-orange-500 font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-center">Prochaines étapes</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Tests utilisateurs en conditions réelles</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Version bêta à tester lors de conventions cosplay</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Déploiement d'une version mobile</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Amélioration du système de matching</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4 mx-auto">
              <span className="text-orange-500 font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-center">Vision long terme</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Intégration d'un système de matching intelligent (IA)</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Partenariats avec conventions et marques geek</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Déploiement en Europe, puis à l'international</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">▸</span>
                <span>Marketplace pour services photo complémentaires</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full"
              style={{ width: "35%" }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Développement</span>
            <span>Bêta</span>
            <span>Lancement</span>
            <span>Expansion</span>
          </div>
        </div>
      </div>
    </div>
  )
}
