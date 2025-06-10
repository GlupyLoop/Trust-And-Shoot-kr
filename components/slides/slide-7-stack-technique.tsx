import { Code, Database, Palette, Lock } from "lucide-react"

export default function Slide7StackTechnique() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Stack <span className="text-orange-500">technique</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Code className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Front-end</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Next.js 14
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Tailwind CSS
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                shadcn/ui
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                TypeScript
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Database className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Back-end</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Supabase
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                API REST temps réel
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Firebase Storage
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Serverless Functions
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Palette className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Design</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Flat design moderne
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                UI inspirée de tonemaki.com
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Design System cohérent
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Responsive design
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                <Lock className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Authentification</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Google
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Facebook
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Email avec vérification
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">▸</span>
                Gestion des rôles utilisateurs
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl text-orange-400 font-medium">Une expérience fluide, rapide et responsive</p>
        </div>
      </div>
    </div>
  )
}
