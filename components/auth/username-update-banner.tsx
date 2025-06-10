"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { X } from "lucide-react"

type UsernameUpdateBannerProps = {
  userRole: "photographer" | "cosplayer"
}

export default function UsernameUpdateBanner({ userRole }: UsernameUpdateBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  if (dismissed) {
    return null
  }

  return (
    <motion.div
      className="bg-[#ff7145]/20 border border-[#ff7145] text-white p-3 rounded-md mb-4 relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
      <p className="pr-6">
        <strong>Bienvenue !</strong> Nous avons utilisé votre nom Google pour créer votre profil. Vous pouvez le
        personnaliser à tout moment en visitant votre page de profil.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => router.push("/profile")}
          className="bg-[#ff7145] hover:bg-[#ff8d69] text-white px-4 py-1 rounded-md text-sm transition-colors"
        >
          Personnaliser maintenant
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-1 rounded-md text-sm transition-colors"
        >
          Plus tard
        </button>
      </div>
    </motion.div>
  )
}
