"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types de langues disponibles
export type Language = "en" | "fr"

// Structure du contexte
type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Création du contexte
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Traductions
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "nav.home": "Home",
    "nav.messages": "Messages",
    "nav.search": "Search",
    "nav.profile": "Profile",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Logout",
    "nav.reservations": "Reservations",

    // Hero section
    "hero.title": "Find Your Perfect Photographer",
    "hero.subtitle": "Connect with talented photographers specialized in cosplay photography",
    "hero.search.placeholder": "Search by name, location, or specialty...",

    // Quick filters
    "filters.portrait": "Portrait",
    "filters.cosplay": "Cosplay",
    "filters.nearMe": "Near Me",
    "filters.allFilters": "All Filters",

    // Section titles
    "section.featured": "Featured",
    "section.photographers": "Photographers",
    "section.browse": "Browse",
    "section.faq": "Frequently",
    "section.questions": "Asked Questions",
    "section.invite": "Invite",
    "section.others": "Others",

    // Photographer card
    "card.viewProfile": "View Profile",
    "card.contact": "Contact",

    // Footer
    "footer.about":
      "Connect with talented photographers and cosplayers. Create amazing photoshoots and build your portfolio.",
    "footer.quickLinks": "Quick Links",
    "footer.services": "Our Services",
    "footer.contactUs": "Contact Us",
    "footer.copyright": "© 2025 TRUST&SHOOT. All rights reserved.",
    "footer.terms": "Terms & Conditions",
    "footer.privacy": "Privacy Policy",
    "footer.cookies": "Cookie Policy",
    "footer.madeWith": "Made with",
    "footer.by": "by Trust & Shoot Team",

    // Links
    "links.home": "Home",
    "links.findPhotographers": "Find Photographers",
    "links.findCosplayers": "Find Cosplayers",
    "links.events": "Upcoming Events",
    "links.blog": "Blog",

    // Services
    "services.photographerProfiles": "Photographer Profiles",
    "services.cosplayerPortfolios": "Cosplayer Portfolios",
    "services.bookingSystem": "Booking System",
    "services.reviews": "Reviews & Ratings",
    "services.messaging": "Secure Messaging",

    // FAQ
    "faq.question1": "How do I find the right photographer for my needs?",
    "faq.answer1":
      "You can use our search and filter features to narrow down photographers based on location, style, and ratings. Read reviews from other clients to make an informed decision.",
    "faq.question2": "How does the review system work?",
    "faq.answer2":
      "After a photoshoot, you can rate your photographer and leave detailed feedback. This helps other users and improves the quality of service on our platform.",
    "faq.question3": "Can I become a photographer on Trust & Shoot?",
    "faq.answer3":
      "Yes! Professional photographers can create a profile, showcase their portfolio, and start receiving bookings and reviews through our platform.",
    "faq.question4": "What happens if I'm not satisfied with my photoshoot?",
    "faq.answer4":
      "We encourage open communication between clients and photographers. If you're not satisfied, please discuss your concerns with the photographer first. If issues persist, our support team can help mediate.",
    "faq.question5": "How are photographers ranked on the platform?",
    "faq.answer5":
      "Photographers are ranked based on a combination of factors including client ratings, number of completed shoots, and quality of their portfolio.",
    "faq.question6": "Is there a fee to use Trust & Shoot?",
    "faq.answer6":
      "Basic browsing and searching is free for clients. Photographers pay a small commission on bookings made through the platform.",

    // Invite section
    "invite.description":
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "invite.shareLink": "Share the link",

    // Language selector
    "language.en": "English",
    "language.fr": "French",
    "language.select": "Language",
  },
  fr: {
    // Header
    "nav.home": "Accueil",
    "nav.messages": "Messages",
    "nav.search": "Rechercher",
    "nav.profile": "Profil",
    "nav.dashboard": "Tableau de bord",
    "nav.logout": "Déconnexion",
    "nav.reservations": "Réservations",

    // Hero section
    "hero.title": "Trouvez Votre Photographe Parfait",
    "hero.subtitle": "Connectez-vous avec des photographes talentueux spécialisés en photographie cosplay",
    "hero.search.placeholder": "Rechercher par nom, lieu ou spécialité...",

    // Quick filters
    "filters.portrait": "Portrait",
    "filters.cosplay": "Cosplay",
    "filters.nearMe": "À proximité",
    "filters.allFilters": "Tous les filtres",

    // Section titles
    "section.featured": "En vedette",
    "section.photographers": "Photographes",
    "section.browse": "Parcourir",
    "section.faq": "Questions",
    "section.questions": "Fréquentes",
    "section.invite": "Inviter",
    "section.others": "Autres",

    // Photographer card
    "card.viewProfile": "Voir le profil",
    "card.contact": "Contacter",

    // Footer
    "footer.about":
      "Connectez-vous avec des photographes et cosplayers talentueux. Créez des séances photo incroyables et développez votre portfolio.",
    "footer.quickLinks": "Liens rapides",
    "footer.services": "Nos services",
    "footer.contactUs": "Contactez-nous",
    "footer.copyright": "© 2025 TRUST&SHOOT. Tous droits réservés.",
    "footer.terms": "Conditions générales",
    "footer.privacy": "Politique de confidentialité",
    "footer.cookies": "Politique des cookies",
    "footer.madeWith": "Fait avec",
    "footer.by": "par l'équipe Trust & Shoot",

    // Links
    "links.home": "Accueil",
    "links.findPhotographers": "Trouver des photographes",
    "links.findCosplayers": "Trouver des cosplayers",
    "links.events": "Événements à venir",
    "links.blog": "Blog",

    // Services
    "services.photographerProfiles": "Profils de photographes",
    "services.cosplayerPortfolios": "Portfolios de cosplayers",
    "services.bookingSystem": "Système de réservation",
    "services.reviews": "Avis et évaluations",
    "services.messaging": "Messagerie sécurisée",

    // FAQ
    "faq.question1": "Comment trouver le bon photographe pour mes besoins ?",
    "faq.answer1":
      "Vous pouvez utiliser nos fonctionnalités de recherche et de filtrage pour affiner les photographes en fonction du lieu, du style et des évaluations. Lisez les avis d'autres clients pour prendre une décision éclairée.",
    "faq.question2": "Comment fonctionne le système d'évaluation ?",
    "faq.answer2":
      "Après une séance photo, vous pouvez évaluer votre photographe et laisser des commentaires détaillés. Cela aide les autres utilisateurs et améliore la qualité du service sur notre plateforme.",
    "faq.question3": "Puis-je devenir photographe sur Trust & Shoot ?",
    "faq.answer3":
      "Oui ! Les photographes professionnels peuvent créer un profil, présenter leur portfolio et commencer à recevoir des réservations et des avis via notre plateforme.",
    "faq.question4": "Que se passe-t-il si je ne suis pas satisfait de ma séance photo ?",
    "faq.answer4":
      "Nous encourageons une communication ouverte entre les clients et les photographes. Si vous n'êtes pas satisfait, discutez d'abord de vos préoccupations avec le photographe. Si les problèmes persistent, notre équipe de support peut aider à la médiation.",
    "faq.question5": "Comment les photographes sont-ils classés sur la plateforme ?",
    "faq.answer5":
      "Les photographes sont classés en fonction d'une combinaison de facteurs, notamment les évaluations des clients, le nombre de séances réalisées et la qualité de leur portfolio.",
    "faq.question6": "Y a-t-il des frais pour utiliser Trust & Shoot ?",
    "faq.answer6":
      "La navigation et la recherche de base sont gratuites pour les clients. Les photographes paient une petite commission sur les réservations effectuées via la plateforme.",

    // Invite section
    "invite.description":
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "invite.shareLink": "Partager le lien",

    // Language selector
    "language.en": "Anglais",
    "language.fr": "Français",
    "language.select": "Langue",
  },
}

// Provider du contexte
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Récupérer la langue du localStorage ou utiliser l'anglais par défaut
  const [language, setLanguage] = useState<Language>("en")

  // Charger la langue depuis localStorage au chargement
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Sauvegarder la langue dans localStorage quand elle change
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Fonction de traduction
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Hook pour utiliser le contexte
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
