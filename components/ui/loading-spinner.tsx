"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
  className?: string
}

export default function LoadingSpinner({ size = "md", color = "#ff7145", className = "" }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeMap[size]}`}
        style={{ borderColor: color }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
