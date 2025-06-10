"use client"

import Image from "next/image"

type OptimizedImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export default function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes="(max-width: 768px) 100vw, 400px"
    />
  )
}
