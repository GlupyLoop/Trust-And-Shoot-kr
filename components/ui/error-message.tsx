"use client"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ message, onRetry, className = "" }: ErrorMessageProps) {
  return (
    <div className={`bg-red-500/10 border border-red-500/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Réessayer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
