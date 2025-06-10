"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import AnimatedSection from "../ui/animated-section"
import ParallaxSection from "../ui/parallax-section"

export default function HeroSection() {
  return (
    <div className="pt-4 pb-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Banner Image - Left Side */}
        <AnimatedSection
          direction="left"
          className="flex items-center justify-center h-80 overflow-hidden p-2 bg-[#2a2a2a] rounded-lg"
        >
          <ParallaxSection speed={0.1}>
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/80 to-transparent z-10"></div>
              <Image
                src="/placeholder.svg?height=320&width=600&text=Trust+and+Shoot"
                alt="Trust and Shoot"
                width={600}
                height={320}
                className="w-full h-full object-cover"
              />
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-[#fffbea] mb-2">
                  Trust <span className="text-[#ff7145]">&</span> Shoot
                </h1>
                <p className="text-[#fffbea]/80 mb-4 max-w-xs">
                  Connectez-vous avec des photographes professionnels et des cosplayers talentueux
                </p>
                <button className="bg-[#ff7145] hover:bg-[#ff8d69] transition-colors text-white py-2 px-6 rounded-full flex items-center gap-2">
                  Explorer
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </ParallaxSection>
        </AnimatedSection>
      </div>
    </div>
  )
}
