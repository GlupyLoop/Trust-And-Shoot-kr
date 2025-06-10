"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#1a1a1a] group-[.toaster]:text-[#fffbea] group-[.toaster]:border-[#2a2a2a] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#fffbea]/80",
          actionButton: "group-[.toast]:bg-[#ff7145] group-[.toast]:text-[#fffbea]",
          cancelButton: "group-[.toast]:bg-[#2a2a2a] group-[.toast]:text-[#fffbea]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
