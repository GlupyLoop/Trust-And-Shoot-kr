"use client"

import type React from "react"

import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

type AnimatedSectionProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  once?: boolean
  threshold?: number
}

export default function AnimatedSection({
  children,
  className,
  delay = 0.2,
  direction = "up",
  duration = 0.5,
  once = true,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold,
  })

  // Set initial and animate values based on direction
  const getDirectionValues = () => {
    switch (direction) {
      case "up":
        return { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case "down":
        return { initial: { y: -40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case "left":
        return { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      case "right":
        return { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      case "none":
        return { initial: { opacity: 0 }, animate: { opacity: 1 } }
      default:
        return { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
    }
  }

  const { initial, animate } = getDirectionValues()

  useEffect(() => {
    if (inView) {
      controls.start(animate)
    }
  }, [controls, inView, animate])

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={controls}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
