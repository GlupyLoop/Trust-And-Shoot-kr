"use client"

import { useState, useEffect } from "react"
import { Camera, Users, Star, Heart, Zap, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { getUsersByRole } from "@/lib/firebase"

export default function MainHeroSection() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [photographerCount, setPhotographerCount] = useState(0)
  const [cosplayerCount, setCosplayerCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [photographers, cosplayers] = await Promise.all([
          getUsersByRole("photographer"),
          getUsersByRole("cosplayer"),
        ])

        setPhotographerCount(photographers.length)
        setCosplayerCount(cosplayers.length)
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Keep default values on error
        setPhotographerCount(500)
        setCosplayerCount(1000)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const scrollToBrowse = () => {
    const browseSection = document.getElementById("browse-section")
    if (browseSection) {
      browseSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleExplorePhotographers = () => {
    scrollToBrowse()
  }

  const handleViewExamples = () => {
    // Scroll to featured photographers section
    const featuredSection = document.getElementById("featured-section")
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating icons */}
        <div className="absolute top-32 left-10 animate-float-slow">
          <div className="bg-[#ff7145]/10 p-4 rounded-2xl backdrop-blur-sm border border-[#ff7145]/20">
            <Camera className="w-8 h-8 text-[#ff7145]" />
          </div>
        </div>

        <div className="absolute top-32 right-20 animate-float-delayed">
          <div className="bg-[#ff7145]/10 p-3 rounded-xl backdrop-blur-sm border border-[#ff7145]/20">
            <Users className="w-6 h-6 text-[#ff7145]" />
          </div>
        </div>

        <div className="absolute bottom-32 left-20 animate-float">
          <div className="bg-[#ff7145]/10 p-3 rounded-xl backdrop-blur-sm border border-[#ff7145]/20">
            <Star className="w-6 h-6 text-[#ff7145]" />
          </div>
        </div>

        <div className="absolute top-1/2 right-10 animate-float-slow">
          <div className="bg-[#ff7145]/10 p-4 rounded-2xl backdrop-blur-sm border border-[#ff7145]/20">
            <Heart className="w-8 h-8 text-[#ff7145]" />
          </div>
        </div>

        <div className="absolute bottom-20 right-32 animate-float-delayed">
          <div className="bg-[#ff7145]/10 p-3 rounded-xl backdrop-blur-sm border border-[#ff7145]/20">
            <Zap className="w-6 h-6 text-[#ff7145]" />
          </div>
        </div>

        <div className="absolute top-60 left-16 animate-float">
          <div className="bg-[#ff7145]/10 p-3 rounded-xl backdrop-blur-sm border border-[#ff7145]/20">
            <Sparkles className="w-6 h-6 text-[#ff7145]" />
          </div>
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ff7145]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff7145]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#ff7145]/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-26 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Connectez Votre</span>
            <br />
            <span className="text-white">Passion avec </span>
            <span className="bg-gradient-to-r from-[#ff7145] via-[#ff8d69] to-[#ffb399] bg-clip-text text-transparent">
              Trust & Shoot
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Découvrez des photographes professionnels et des cosplayers talentueux. Créez des collaborations uniques et
            donnez vie à vos projets créatifs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleExplorePhotographers}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#ff7145] to-[#ff8d69] text-white font-semibold rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#ff7145]/25 min-w-[200px]"
            >
              <span className="relative z-10 flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                Explorer
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff8d69] to-[#ffb399] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={handleViewExamples}
              className="group px-8 py-4 bg-transparent border-2 border-[#ff7145] text-[#ff7145] font-semibold rounded-full text-lg transition-all duration-300 hover:bg-[#ff7145] hover:text-white hover:scale-105 hover:shadow-xl min-w-[200px]"
            >
              <span className="flex items-center justify-center">
                <Star className="w-5 h-5 mr-2" />
                Voir Exemples
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ff7145] mb-2">{loading ? "..." : `${photographerCount}+`}</div>
              <div className="text-gray-400">Photographes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ff7145] mb-2">{loading ? "..." : `${cosplayerCount}+`}</div>
              <div className="text-gray-400">Cosplayers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ff7145] mb-2">
                {loading ? "..." : `${photographerCount + cosplayerCount * 2}+`}
              </div>
              <div className="text-gray-400">Collaborations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141414] to-transparent"></div>
    </div>
  )
}
