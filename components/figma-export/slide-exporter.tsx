"use client"

import { useState } from "react"
import { Download, FileImage, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SlideExporter() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToSVG = async (slideId: number) => {
    setIsExporting(true)

    // Simuler l'export (vous pouvez implémenter la vraie logique ici)
    setTimeout(() => {
      setIsExporting(false)
      // Créer un lien de téléchargement
      const link = document.createElement("a")
      link.href = `/api/export/slide-${slideId}.svg`
      link.download = `trust-shoot-slide-${slideId}.svg`
      link.click()
    }, 2000)
  }

  const downloadSpecs = () => {
    const specs = {
      designSystem: {
        colors: {
          primary: "#F97316",
          background: "#000000",
          text: "#FFFFFF",
          accent: "#FB923C",
        },
        typography: {
          fontFamily: "Inter",
          sizes: {
            title: "48px",
            subtitle: "32px",
            body: "16px",
          },
        },
      },
    }

    const blob = new Blob([JSON.stringify(specs, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "trust-shoot-design-specs.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadContent = () => {
    // Télécharger le fichier JSON avec tout le contenu
    const link = document.createElement("a")
    link.href = "/exports/slides-content.json"
    link.download = "trust-shoot-slides-content.json"
    link.click()
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Export pour <span className="text-orange-500">Figma</span>
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center mb-4">
              <Palette className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold">Design System</h3>
            </div>
            <p className="text-gray-300 mb-4">Couleurs, typographie, espacements et composants</p>
            <Button onClick={downloadSpecs} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Télécharger les specs
            </Button>
          </div>

          <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center mb-4">
              <FileImage className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold">Contenu structuré</h3>
            </div>
            <p className="text-gray-300 mb-4">Tout le texte et la structure des 11 slides</p>
            <Button onClick={downloadContent} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Télécharger le contenu
            </Button>
          </div>

          <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center mb-4">
              <FileImage className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold">Export SVG</h3>
            </div>
            <p className="text-gray-300 mb-4">Slides individuelles en format vectoriel</p>
            <Button onClick={() => exportToSVG(1)} disabled={isExporting} className="w-full">
              {isExporting ? "Export en cours..." : "Exporter les slides"}
            </Button>
          </div>
        </div>

        <div className="bg-gray-900/60 p-8 rounded-xl border border-gray-800">
          <h3 className="text-2xl font-semibold mb-6">Instructions pour Figma</h3>

          <div className="space-y-4 text-gray-300">
            <div className="flex items-start">
              <span className="text-orange-500 mr-3 font-bold">1.</span>
              <div>
                <p className="font-semibold">Importez le Design System</p>
                <p>
                  Utilisez le fichier JSON des spécifications pour créer vos styles de couleurs et de texte dans Figma
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-orange-500 mr-3 font-bold">2.</span>
              <div>
                <p className="font-semibold">Créez vos frames</p>
                <p>Dimensions recommandées : 1920x1080px (16:9) pour les présentations</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-orange-500 mr-3 font-bold">3.</span>
              <div>
                <p className="font-semibold">Utilisez le contenu structuré</p>
                <p>Le fichier JSON contient tout le texte et la structure de chaque slide</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-orange-500 mr-3 font-bold">4.</span>
              <div>
                <p className="font-semibold">Importez les SVG (optionnel)</p>
                <p>Utilisez les exports SVG comme base pour vos designs Figma</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-orange-900/20 border border-orange-500/30 rounded-xl">
          <h4 className="text-lg font-semibold text-orange-400 mb-2">💡 Conseil</h4>
          <p className="text-gray-300">
            Créez d'abord un composant maître avec votre design system, puis dupliquez-le pour chaque slide. Cela vous
            permettra de maintenir la cohérence visuelle facilement.
          </p>
        </div>
      </div>
    </div>
  )
}
