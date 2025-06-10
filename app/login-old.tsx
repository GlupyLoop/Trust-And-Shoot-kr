"use client"

import AuthForm from "@/components/auth/auth-form"
import { motion } from "framer-motion"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#141414]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#ff7145]/10 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[#141414] to-transparent"></div>
      </motion.div>

      <AuthForm mode="login" />

      <motion.div
        className="mt-8 text-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>Trust & Shoot - Connect with photographers and cosplayers</p>
      </motion.div>
    </div>
  )
}
