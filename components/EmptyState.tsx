"use client"

import { MessageSquare } from "lucide-react"

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-[#ff7145]" />
      </div>
      <h3 className="text-xl font-medium mb-2">Vos messages</h3>
      <p className="text-gray-400 text-center max-w-md">
        Sélectionnez une conversation pour commencer à discuter ou contactez un photographe depuis son profil.
      </p>
    </div>
  )
}

export default EmptyState
