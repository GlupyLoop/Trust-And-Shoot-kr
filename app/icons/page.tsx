"use client"

import { useState } from "react"
import Image from "next/image"

export default function IconsPage() {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)

  const icons = [
    { name: "Camera", path: "/icons/camera-icon.png", description: "Représente les photographes et la photographie" },
    { name: "Mask", path: "/icons/mask-icon.png", description: "Représente les cosplayers et le cosplay" },
    { name: "Calendar", path: "/icons/calendar-icon.png", description: "Représente le système de réservation" },
    { name: "Star", path: "/icons/star-icon.png", description: "Représente les évaluations et avis" },
    { name: "Message", path: "/icons/message-icon.png", description: "Représente la messagerie" },
    { name: "Convention", path: "/icons/convention-icon.png", description: "Représente les conventions et événements" },
    { name: "Profile", path: "/icons/profile-icon.png", description: "Représente les profils utilisateurs" },
    { name: "Search", path: "/icons/search-icon.png", description: "Représente la recherche et découverte" },
    { name: "Handshake", path: "/icons/handshake-icon.png", description: "Représente les collaborations" },
    { name: "Heart", path: "/icons/heart-icon.png", description: "Représente les favoris" },
  ]

  const downloadIcon = (path: string, name: string) => {
    const link = document.createElement("a")
    link.href = path
    link.download = `${name.toLowerCase()}-icon.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="text-[#ff7145]">Trust & Shoot</span> - Pictogrammes
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {icons.map((icon) => (
            <div
              key={icon.name}
              className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-[#252525] transition-colors border border-[#2a2a2a] hover:border-[#ff7145]/50"
              onClick={() => setSelectedIcon(icon.path)}
            >
              <div className="w-24 h-24 relative mb-4">
                <Image
                  src={icon.path || "/placeholder.svg"}
                  alt={icon.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-medium mb-1">{icon.name}</h3>
              <p className="text-sm text-gray-400 text-center">{icon.description}</p>
              <button
                className="mt-4 px-4 py-2 bg-[#ff7145] text-white rounded-lg hover:bg-[#ff8d69] transition-colors text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  downloadIcon(icon.path, icon.name)
                }}
              >
                Télécharger
              </button>
            </div>
          ))}
        </div>

        {selectedIcon && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Aperçu du pictogramme</h2>
                <button className="text-gray-400 hover:text-white" onClick={() => setSelectedIcon(null)}>
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-64 h-64 relative mb-8">
                  <Image
                    src={selectedIcon || "/placeholder.svg"}
                    alt="Selected icon"
                    width={256}
                    height={256}
                    className="object-contain"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    className="px-6 py-3 bg-[#ff7145] text-white rounded-lg hover:bg-[#ff8d69] transition-colors"
                    onClick={() => {
                      const iconName = icons.find((icon) => icon.path === selectedIcon)?.name || "icon"
                      downloadIcon(selectedIcon, iconName)
                    }}
                  >
                    Télécharger SVG
                  </button>
                  <button
                    className="px-6 py-3 border border-[#ff7145] text-[#ff7145] rounded-lg hover:bg-[#ff7145]/10 transition-colors"
                    onClick={() => setSelectedIcon(null)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
