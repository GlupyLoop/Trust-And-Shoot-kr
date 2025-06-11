"use client"
import { useLanguage } from "@/contexts/language-context"
import { Instagram, Facebook, Twitter } from "lucide-react"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#1a1a1a] border-t border-[#2a2a2a] relative z-[var(--z-index-footer)]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
          {/* Left side - Contact buttons */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:guillaume.laplume99@gmail.com"
              className="text-[#ff7145] hover:text-[#ff8d69] transition-colors font-medium"
            >
              Email Us
            </a>
            <a
              href="javascript:void(0)"
              onClick={() => window.open("tel:+32495335203", "_self")}
              className="text-white hover:text-gray-300 transition-colors font-medium cursor-pointer"
            >
              Free Call
            </a>
          </div>

          {/* Center-left - Brand attribution */}
          <div className="flex-1 text-center lg:text-left">
            <span className="text-gray-400 text-sm">
              Carefully Crafted by our Team <span className="text-[#ff7145] underline font-medium">TRUST & SHOOT</span>
            </span>
          </div>

          {/* Center-right - Legal links */}
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm underline">
              Terms & Conditions
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm underline">
              Privacy Policy
            </a>
          </div>

          {/* Right side - Social icons and copyright */}
          <div className="flex items-center gap-6">
            {/* Social media icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff7145] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff7145] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff7145] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-sm whitespace-nowrap">
              Namur, BE © {new Date().getFullYear()} Trust & Shoot™
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
