/**
 * Utility functions to handle browser compatibility issues
 */

// Check if the browser supports backdrop-filter
export function supportsBackdropFilter(): boolean {
  if (typeof window === "undefined") return false

  return (
    "backdropFilter" in document.documentElement.style || "-webkit-backdrop-filter" in document.documentElement.style
  )
}

// Check if the browser supports smooth scrolling
export function supportsSmoothScroll(): boolean {
  if (typeof window === "undefined") return false

  return "scrollBehavior" in document.documentElement.style
}

// Polyfill for smooth scrolling
export function smoothScrollTo(element: HTMLElement | null, options?: ScrollIntoViewOptions): void {
  if (!element) return

  if (supportsSmoothScroll()) {
    element.scrollIntoView({ behavior: "smooth", ...options })
  } else {
    // Fallback for browsers that don't support smooth scrolling
    element.scrollIntoView(options)
  }
}

// Safe localStorage access with fallback
export function safeLocalStorage() {
  const storage = {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key)
      } catch (e) {
        console.warn("localStorage is not available:", e)
        return null
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        localStorage.setItem(key, value)
      } catch (e) {
        console.warn("localStorage is not available:", e)
      }
    },
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.warn("localStorage is not available:", e)
      }
    },
  }

  return storage
}
