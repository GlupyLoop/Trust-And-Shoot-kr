"use client"

import type React from "react"

import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7145]"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="pt-16">{children}</div>
      <Footer />
    </ProtectedRoute>
  )
}
