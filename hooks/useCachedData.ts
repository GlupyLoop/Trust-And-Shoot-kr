"use client"

import { useState, useEffect } from "react"

interface CacheOptions {
  expiryTime?: number // Time in milliseconds before cache expires
  refreshOnFocus?: boolean // Whether to refresh data when window regains focus
}

export default function useCachedData<T>(fetchFn: () => Promise<T>, key: string, options: CacheOptions = {}) {
  const { expiryTime = 5 * 60 * 1000, refreshOnFocus = false } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetched, setLastFetched] = useState(0)

  const fetchData = async (force = false) => {
    // Skip if data is fresh and not forced
    if (!force && data && Date.now() - lastFetched < expiryTime) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      setData(result)
      setLastFetched(Date.now())

      // Store in sessionStorage for persistence
      sessionStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and cache check
  useEffect(() => {
    const cachedData = sessionStorage.getItem(`cache_${key}`)

    if (cachedData) {
      try {
        const { data: cached, timestamp } = JSON.parse(cachedData)

        if (Date.now() - timestamp < expiryTime) {
          setData(cached)
          setLastFetched(timestamp)
          setLoading(false)
          return
        }
      } catch (err) {
        console.error("Error parsing cached data:", err)
      }
    }

    fetchData()
  }, [key])

  // Set up focus event listener if needed
  useEffect(() => {
    if (!refreshOnFocus) return

    const handleFocus = () => {
      if (Date.now() - lastFetched > expiryTime) {
        fetchData()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [refreshOnFocus, lastFetched])

  return { data, loading, error, refetch: () => fetchData(true) }
}
