import { Camera, Users, Shield } from "lucide-react"

export default function Slide1Title() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
      <div className="text-center max-w-4xl">
        {/* Logo et titre principal */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-orange-500 p-4 rounded-2xl">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-white">
            Trust & <span className="text-orange-500">Shoot</span>
          </h1>
        </div>

        {/* Sous-titre */}
        <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
          L'application de mise en relation entre photographes et cosplayers,
          <br />
          <span className="text-orange-400 font-semibold">en toute confiance.</span>
        </p>

        {/* Icônes décoratives */}
        <div className="flex justify-center gap-8 opacity-60">
          <div className="bg-gray-800 p-4 rounded-full">
            <Camera className="w-8 h-8 text-orange-400" />
          </div>
          <div className="bg-gray-800 p-4 rounded-full">
            <Users className="w-8 h-8 text-orange-400" />
          </div>
          <div className="bg-gray-800 p-4 rounded-full">
            <Shield className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
