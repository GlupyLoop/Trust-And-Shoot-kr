"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { signOutUser } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"
// Ajouter l'import pour l'icône Calendar
import { Menu, X, LogOut, User, Camera, Bell, MessageSquare, ChevronDown, Globe, Calendar } from "lucide-react"
// Ajouter l'import pour useMessaging
import { useMessaging } from "@/contexts/messaging-context"
import { subscribeToBookingRequests } from "@/lib/bookings"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3) // Exemple de notifications
  const { user, userData } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()

  // Dans la fonction Header, ajouter cette ligne après les autres hooks
  const { unreadCount } = useMessaging()
  const [bookingNotifications, setBookingNotifications] = useState(0)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  // Subscribe to booking requests for photographers
  useEffect(() => {
    if (user && userData?.role === "photographer") {
      const unsubscribe = subscribeToBookingRequests(user.uid, (requests) => {
        // Count pending booking requests
        const pendingRequests = requests.filter((request) => request.status === "pending")
        setBookingNotifications(pendingRequests.length)
      })

      return () => unsubscribe()
    }
  }, [user, userData?.role])

  const handleLogout = async () => {
    try {
      await signOutUser()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navigateToDashboard = () => {
    if (userData?.role === "photographer") {
      router.push("/photographer-dashboard")
    } else if (userData?.role === "cosplayer") {
      router.push("/cosplayer-dashboard")
    }
  }

  const closeMenus = () => {
    setMenuOpen(false)
    setUserMenuOpen(false)
    setLanguageMenuOpen(false)
  }

  const changeLanguage = (lang: "en" | "fr") => {
    setLanguage(lang)
    setLanguageMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-[#141414]/90 backdrop-blur-md shadow-lg py-2"
          : "bg-gradient-to-b from-[#141414] to-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-auto relative">
                <Image src="/logo_svg.svg" alt="Trust & Shoot Logo" width={50} height={40} className="h-full w-auto" />
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <div className="flex items-center gap-4">
                  {/* Ajout du lien vers le calendrier */}
                  <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                    <Link
                      href="/conventions"
                      className={`flex items-center gap-1 transition-colors ${
                        pathname === "/conventions"
                          ? "text-[#ff7145] font-medium"
                          : "text-[#fffbea] hover:text-[#ff7145]"
                      }`}
                    >
                      <Calendar size={18} />
                      <span>Conventions</span>
                      {pathname === "/conventions" && (
                        <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#ff7145] rounded-full"
                          layoutId="activeIndicator"
                        />
                      )}
                    </Link>
                  </motion.div>

                  <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                    <Link
                      href="/messages"
                      className={`flex items-center gap-1 transition-colors ${
                        pathname === "/messages" ? "text-[#ff7145] font-medium" : "text-[#fffbea] hover:text-[#ff7145]"
                      }`}
                    >
                      <MessageSquare size={18} />
                      <span>{t("nav.messages")}</span>
                      {pathname === "/messages" && (
                        <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#ff7145] rounded-full"
                          layoutId="activeIndicator"
                        />
                      )}
                    </Link>
                  </motion.div>

                  <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                    <Link
                      href={
                        userData?.role === "photographer"
                          ? "/photographer-dashboard/bookings"
                          : "/cosplayer-dashboard/bookings"
                      }
                      className={`flex items-center gap-1 transition-colors ${
                        pathname.includes("/bookings")
                          ? "text-[#ff7145] font-medium"
                          : "text-[#fffbea] hover:text-[#ff7145]"
                      }`}
                    >
                      <Calendar size={18} />
                      <span>{t("nav.reservations") || "Reservations"}</span>
                      {pathname.includes("/bookings") && (
                        <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#ff7145] rounded-full"
                          layoutId="activeIndicator"
                        />
                      )}
                    </Link>
                  </motion.div>

                  {/* Language Selector */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                      className="flex items-center gap-1 text-[#fffbea] hover:text-[#ff7145] transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Globe size={18} />
                      <span>{language === "en" ? "EN" : "FR"}</span>
                      <ChevronDown
                        size={14}
                        className={`ml-1 transition-transform ${languageMenuOpen ? "rotate-180" : ""}`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {languageMenuOpen && (
                        <motion.div
                          className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] rounded-lg shadow-lg border border-[#3a3a3a] overflow-hidden z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => changeLanguage("en")}
                              className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${
                                language === "en" ? "bg-[#ff7145]/20 text-[#ff7145]" : "hover:bg-[#2a2a2a]"
                              } transition-colors`}
                            >
                              <span>English</span>
                              {language === "en" && <span className="ml-auto">✓</span>}
                            </button>
                            <button
                              onClick={() => changeLanguage("fr")}
                              className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${
                                language === "fr" ? "bg-[#ff7145]/20 text-[#ff7145]" : "hover:bg-[#2a2a2a]"
                              } transition-colors`}
                            >
                              <span>Français</span>
                              {language === "fr" && <span className="ml-auto">✓</span>}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-l border-[#3a3a3a] pl-4">
                  {/* Notifications */}
                  <motion.div className="relative" whileHover={{ scale: 1.1 }}>
                    <Link href="/messages" className="text-[#fffbea] hover:text-[#ff7145] transition-colors">
                      <Bell size={20} />
                      {unreadCount + bookingNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#ff7145] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount + bookingNotifications > 9 ? "9+" : unreadCount + bookingNotifications}
                        </span>
                      )}
                    </Link>
                  </motion.div>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#ff7145]"
                        whileHover={{ scale: 1.1, boxShadow: "0 0 8px rgba(255, 113, 69, 0.6)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {userData?.photoURL ? (
                          <Image
                            src={userData.photoURL || "/placeholder.svg"}
                            alt="Profile"
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                            <User size={20} className="text-[#ff7145]" />
                          </div>
                        )}
                      </motion.div>
                      <div className="flex items-center">
                        <span className="font-medium text-sm">{userData?.displayName || "User"}</span>
                        <ChevronDown
                          size={16}
                          className={`ml-1 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-lg border border-[#3a3a3a] overflow-hidden z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2 border-b border-[#3a3a3a]">
                            <p className="text-sm font-medium">{userData?.displayName}</p>
                            <p className="text-xs text-[#ff7145]">
                              {userData?.role === "photographer" ? "Photographer" : "Cosplayer"}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#2a2a2a] transition-colors"
                              onClick={closeMenus}
                            >
                              <User size={16} />
                              <span>{t("nav.profile")}</span>
                            </Link>
                            <button
                              onClick={() => {
                                navigateToDashboard()
                                closeMenus()
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#2a2a2a] transition-colors w-full text-left"
                            >
                              {userData?.role === "photographer" ? <Camera size={16} /> : <User size={16} />}
                              <span>{t("nav.dashboard")}</span>
                            </button>
                          </div>
                          <div className="border-t border-[#3a3a3a] py-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors w-full text-left"
                            >
                              <LogOut size={16} />
                              <span>{t("nav.logout")}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Selector Mobile */}
            <motion.button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2"
            >
              <Globe size={20} />
            </motion.button>

            {/* Menu Button */}
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#1a1a1a] border-t border-[#ff7145]/20 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {user && (
                <>
                  <div className="flex items-center gap-3 p-2 bg-[#2a2a2a] rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-[#ff7145]/20 overflow-hidden border-2 border-[#ff7145]">
                      {userData?.photoURL ? (
                        <Image
                          src={userData.photoURL || "/placeholder.svg"}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={24} className="text-[#ff7145]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{userData?.displayName || "User"}</div>
                      <div className="text-sm text-[#ff7145]">
                        {userData?.role === "photographer" ? "Photographer" : "Cosplayer"}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className="relative">
                        <Link href="/messages">
                          <Bell size={20} />
                          {unreadCount + bookingNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#ff7145] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount + bookingNotifications > 9 ? "9+" : unreadCount + bookingNotifications}
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 w-full p-3 hover:bg-[#2a2a2a] rounded-md transition-colors"
                      onClick={closeMenus}
                    >
                      <User size={18} />
                      <span>{t("nav.profile")}</span>
                    </Link>
                    <motion.button
                      onClick={() => {
                        navigateToDashboard()
                        closeMenus()
                      }}
                      className="flex items-center gap-2 w-full p-3 hover:bg-[#2a2a2a] rounded-md transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      {userData?.role === "photographer" ? <Camera size={18} /> : <User size={18} />}
                      <span>{t("nav.dashboard")}</span>
                    </motion.button>

                    {/* Ajout du lien vers le calendrier dans le menu mobile */}
                    <Link
                      href="/conventions"
                      className={`flex items-center gap-2 w-full p-3 rounded-md transition-colors ${
                        pathname === "/conventions"
                          ? "bg-[#ff7145]/20 text-[#ff7145] border-l-2 border-[#ff7145]"
                          : "hover:bg-[#2a2a2a]"
                      }`}
                      onClick={closeMenus}
                    >
                      <Calendar size={18} />
                      <span>Conventions</span>
                    </Link>

                    <Link
                      href={
                        userData?.role === "photographer"
                          ? "/photographer-dashboard/bookings"
                          : "/cosplayer-dashboard/bookings"
                      }
                      className={`flex items-center gap-2 w-full p-3 rounded-md transition-colors ${
                        pathname.includes("/bookings")
                          ? "bg-[#ff7145]/20 text-[#ff7145] border-l-2 border-[#ff7145]"
                          : "hover:bg-[#2a2a2a]"
                      }`}
                      onClick={closeMenus}
                    >
                      <Calendar size={18} />
                      <span>{t("nav.reservations") || "Reservations"}</span>
                    </Link>

                    <Link
                      href="/messages"
                      className={`flex items-center gap-2 w-full p-3 rounded-md transition-colors ${
                        pathname === "/messages"
                          ? "bg-[#ff7145]/20 text-[#ff7145] border-l-2 border-[#ff7145]"
                          : "hover:bg-[#2a2a2a]"
                      }`}
                      onClick={closeMenus}
                    >
                      <MessageSquare size={18} />
                      <span>{t("nav.messages")}</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#3a3a3a] pt-4 space-y-1">
                    {/* Language options */}
                    <div className="mb-2">
                      <div className="text-sm text-gray-400 px-3 mb-1">{t("language.select")}:</div>
                      <div className="flex gap-2 px-3">
                        <button
                          onClick={() => changeLanguage("en")}
                          className={`px-3 py-1 rounded-md ${
                            language === "en" ? "bg-[#ff7145] text-white" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => changeLanguage("fr")}
                          className={`px-3 py-1 rounded-md ${
                            language === "fr" ? "bg-[#ff7145] text-white" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                          }`}
                        >
                          FR
                        </button>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 w-full p-3 hover:bg-[#2a2a2a] rounded-md transition-colors"
                      onClick={closeMenus}
                    >
                      <User size={18} />
                      <span>{t("nav.profile")}</span>
                    </Link>

                    <motion.button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full p-3 hover:bg-[#2a2a2a] rounded-md text-red-400 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut size={18} />
                      <span>{t("nav.logout")}</span>
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
