"use client"

import Image from "next/image"
import AnimatedSection from "../ui/animated-section"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

// Modifier la fonction InviteSection pour adapter le style
export default function InviteSection() {
  const { t } = useLanguage()

  return (
    <div className="flex gap-4">
      <AnimatedSection direction="left" className="w-1/3">
        <motion.div
          className="bg-[#2a2a2a] rounded-lg aspect-square relative overflow-hidden"
          whileHover={{ rotate: 5, scale: 1.05 }}
        >
          <Image
            src="/placeholder.svg?height=200&width=200"
            alt="Invite"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatedSection>
      <AnimatedSection direction="right" className="w-2/3">
        <p className="text-sm mb-4">{t("invite.description")}</p>
        <motion.button
          className="bg-[#ff7145] text-white rounded-full px-4 py-1 text-sm flex items-center gap-1"
          whileHover={{ scale: 1.05, backgroundColor: "#ff8d69" }}
          whileTap={{ scale: 0.95 }}
        >
          <Image src="/placeholder.svg?height=16&width=16" alt="Share" width={16} height={16} className="w-4 h-4" />
          {t("invite.shareLink")}
        </motion.button>
      </AnimatedSection>
    </div>
  )
}
