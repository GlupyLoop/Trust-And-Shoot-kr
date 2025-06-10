import { Rocket } from "lucide-react"

export default function Slide11Conclusion() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          <span className="text-orange-500">Conclusion</span>
        </h2>

        <div className="mt-8 bg-gradient-to-b from-gray-900/60 to-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
          <p className="text-xl md:text-2xl leading-relaxed text-center">
            Trust & Shoot est bien plus qu'un projet scolaire ou personnel : c'est une
            <span className="text-orange-400 font-medium"> réponse concrète à un vrai besoin</span>, ancrée dans une
            communauté vivante et créative.
          </p>

          <p className="text-xl md:text-2xl leading-relaxed mt-6 text-center">
            Je crois profondément qu'en combinant design, technologie et compréhension de terrain, on peut créer un
            outil <span className="text-orange-400 font-medium">utile, fiable, et porteur de lien</span>.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <p className="text-2xl font-medium mb-6">Merci de votre attention</p>

          <div className="flex items-center justify-center bg-orange-500/20 p-4 rounded-xl border border-orange-500/30 mt-4">
            <Rocket className="w-6 h-6 text-orange-500 mr-3" />
            <p className="text-lg">
              Si vous êtes photographe, cosplayer, investisseur ou simplement curieux,
              <span className="font-bold text-orange-400"> rejoignez l'aventure !</span>
            </p>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-orange-500 font-bold">T&S</span>
            </div>
            <h3 className="text-2xl font-bold">
              Trust <span className="text-orange-500">&</span> Shoot
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
