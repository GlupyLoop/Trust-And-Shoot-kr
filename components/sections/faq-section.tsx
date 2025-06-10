"use client"

import { Plus } from "lucide-react"
import AnimatedSection from "../ui/animated-section"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"

type FAQ = {
  question: string
  answer: string
}

// Modifier la fonction FAQSection pour adapter le style
export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const { t } = useLanguage()

  const faqs: FAQ[] = [
    {
      question: t("faq.question1"),
      answer: t("faq.answer1"),
    },
    {
      question: t("faq.question2"),
      answer: t("faq.answer2"),
    },
    {
      question: t("faq.question3"),
      answer: t("faq.answer3"),
    },
    {
      question: t("faq.question4"),
      answer: t("faq.answer4"),
    },
    {
      question: t("faq.question5"),
      answer: t("faq.answer5"),
    },
    {
      question: t("faq.question6"),
      answer: t("faq.answer6"),
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, i) => (
          <AnimatedSection key={i} delay={0.2 + i * 0.05} direction={i % 2 === 0 ? "left" : "right"}>
            <motion.div
              className={`bg-[#2a2a2a] text-white rounded-lg p-3 cursor-pointer overflow-hidden`}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleFAQ(i)}
              layout
            >
              <div className="flex justify-between items-center">
                <span>{faq.question}</span>
                <motion.button
                  className="w-6 h-6 bg-[#ff7145] rounded-md flex items-center justify-center flex-shrink-0 ml-2"
                  whileHover={{ rotate: 90 }}
                  animate={{ rotate: openFAQ === i ? 45 : 0 }}
                >
                  <Plus className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <AnimatePresence>
                {openFAQ === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 pt-2 border-t border-white/30"
                  >
                    <p className="text-sm">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  )
}
