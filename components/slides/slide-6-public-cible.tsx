import { Users, UserRound, CalendarDays, Megaphone } from "lucide-react"

export default function Slide6PublicCible() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Public <span className="text-orange-500">cible</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105 hover:border-orange-500/50">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <UserRound className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Cosplayers</h3>
            </div>
            <p className="text-gray-300">
              Débutants ou expérimentés, qui cherchent des shootings qualitatifs pour mettre en valeur leurs créations
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105 hover:border-orange-500/50">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Photographes</h3>
            </div>
            <p className="text-gray-300">
              Professionnels ou amateurs passionnés spécialisés dans le cosplay et la pop culture
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105 hover:border-orange-500/50">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <CalendarDays className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Organisateurs de conventions</h3>
            </div>
            <p className="text-gray-300">
              Qui peuvent s'appuyer sur l'app pour gérer les séances photo et améliorer l'expérience des participants
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transform transition-all hover:scale-105 hover:border-orange-500/50">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Megaphone className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Créateurs de contenu</h3>
            </div>
            <p className="text-gray-300">
              Influenceurs issus de la pop culture cherchant à collaborer avec des professionnels de l'image
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl text-orange-400 font-medium">Une communauté passionnée et créative</p>
        </div>
      </div>
    </div>
  )
}
