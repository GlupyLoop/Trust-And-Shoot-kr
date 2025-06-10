"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import Slide1Title from "@/components/slides/slide-1-title"
import Slide2Introduction from "@/components/slides/slide-2-introduction"
import Slide3Problematique from "@/components/slides/slide-3-problematique"
import Slide4Concept from "@/components/slides/slide-4-concept"
import Slide5Fonctionnalites from "@/components/slides/slide-5-fonctionnalites"
import Slide6PublicCible from "@/components/slides/slide-6-public-cible"
import Slide7StackTechnique from "@/components/slides/slide-7-stack-technique"
import Slide8UiUxDesign from "@/components/slides/slide-8-ui-ux-design"
import Slide9Differenciateurs from "@/components/slides/slide-9-differenciateurs"
import Slide10Roadmap from "@/components/slides/slide-10-roadmap"
import Slide11Conclusion from "@/components/slides/slide-11-conclusion"

const slides = [
  { id: 1, component: Slide1Title, title: "Titre" },
  { id: 2, component: Slide2Introduction, title: "Introduction & Contexte" },
  { id: 3, component: Slide3Problematique, title: "Problématique" },
  { id: 4, component: Slide4Concept, title: "Concept de l'application" },
  { id: 5, component: Slide5Fonctionnalites, title: "Fonctionnalités principales" },
  { id: 6, component: Slide6PublicCible, title: "Public cible" },
  { id: 7, component: Slide7StackTechnique, title: "Stack technique" },
  { id: 8, component: Slide8UiUxDesign, title: "UI/UX Design" },
  { id: 9, component: Slide9Differenciateurs, title: "Différenciateurs clés" },
  { id: 10, component: Slide10Roadmap, title: "Roadmap & perspectives" },
  { id: 11, component: Slide11Conclusion, title: "Conclusion" },
]

export default function SlidesPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const CurrentSlideComponent = slides[currentSlide].component

  return (
    <div className="relative bg-black min-h-screen">
      {/* Slide actuel */}
      <CurrentSlideComponent />

      {/* Navigation principale */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/90 backdrop-blur-sm p-4 rounded-full border border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-white text-sm font-medium px-4 min-w-[80px] text-center">
          {currentSlide + 1} / {slides.length}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-2" />

        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>

      {/* Indicateurs de slides */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2 flex-wrap justify-center max-w-md">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? "bg-orange-500 scale-125" : "bg-gray-600 hover:bg-gray-500"
            }`}
            title={slides[index].title}
          />
        ))}
      </div>

      {/* Titre de la slide actuelle */}
      <div className="fixed top-8 left-8 bg-black/90 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
        <p className="text-white text-sm font-medium">{slides[currentSlide].title}</p>
      </div>

      {/* Raccourcis clavier */}
      <div className="fixed top-8 right-8 bg-black/90 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
        <div className="text-white text-xs space-y-1">
          <div>← → : Navigation</div>
          <div>F11 : Plein écran</div>
          <div>Esc : Quitter</div>
        </div>
      </div>

      {/* Navigation par clavier */}
      <div className="sr-only">
        <button
          onClick={prevSlide}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") prevSlide()
            if (e.key === "ArrowRight") nextSlide()
            if (e.key === "F11") {
              e.preventDefault()
              toggleFullscreen()
            }
          }}
          autoFocus
        />
      </div>
    </div>
  )
}
