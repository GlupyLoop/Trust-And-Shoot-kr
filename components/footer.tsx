"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#1a1a1a] border-t border-[#2a2a2a] relative z-[var(--z-index-footer)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Trust & Shoot</h3>
            <p className="text-gray-400 mb-4">
              La plateforme qui connecte photographes et cosplayers pour des séances photo exceptionnelles.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff7145] transition-colors"
                aria-label="Suivez-nous sur Instagram"
              >
                <Instagram size={20} aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff7145] transition-colors"
                aria-label="Suivez-nous sur Facebook"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff7145] transition-colors"
                aria-label="Suivez-nous sur Twitter"
              >
                <Twitter size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#hero" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/conventions" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Conventions
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Mon profil
                </Link>
              </li>
              <li>
                <Link href="/messages" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Trouver un photographe
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Trouver un cosplayer
                </Link>
              </li>
              <li>
                <Link href="/conventions" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Réserver un créneau
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  Laisser un avis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-[#ff7145] mr-2 mt-1 flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-400">Place de l'Ecole des Cadets 4, 5000 Namur</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-[#ff7145] mr-2 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+32495335203" className="text-gray-400 hover:text-[#ff7145] transition-colors">
                  +32 495 33 52 03
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-[#ff7145] mr-2 flex-shrink-0" aria-hidden="true" />
                <a
                  href="mailto:contact@trustandshoot.com"
                  className="text-gray-400 hover:text-[#ff7145] transition-colors"
                >
                  contact@trustandshoot.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Trust & Shoot. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
