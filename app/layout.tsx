import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { MessagingProvider } from "@/contexts/messaging-context"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/footer"
import HelpPopup from "@/components/help-popup"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trust & Shoot",
  description: "Connectez-vous avec des photographes et cosplayers pour des séances photo exceptionnelles",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-[#141414] text-[#fffbea]`}>
        <AuthProvider>
          <LanguageProvider>
            <MessagingProvider>
              <div className="flex flex-col min-h-screen">
                {children}
                <Footer />
              </div>
              <HelpPopup />
              <Toaster position="top-center" />
            </MessagingProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
