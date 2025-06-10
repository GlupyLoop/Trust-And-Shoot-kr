"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import type { Convention } from "@/lib/firebase"
import { formatDate } from "@/lib/utils"
import { getPhotographersByConvention, type PhotographerData } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

interface ConventionCardProps {
  convention: Convention
}

export function ConventionCard({ convention }: ConventionCardProps) {
  const [imageError, setImageError] = useState(false)
  const [photographers, setPhotographers] = useState<PhotographerData[]>([])
  const [loading, setLoading] = useState(true)
  const { user, userData } = useAuth()
  const [isAttending, setIsAttending] = useState(false)

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setLoading(true)
        const data = await getPhotographersByConvention(convention.id)
        setPhotographers(data)
      } catch (error) {
        console.error("Error fetching photographers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotographers()

    // Check if the current user (if a photographer) is attending this convention
    if (user && userData?.role === "photographer" && userData.conventions) {
      setIsAttending(userData.conventions.includes(convention.id))
    }
  }, [convention.id, user, userData])

  const defaultImage = "/placeholder.svg?height=200&width=400"
  const imageUrl = imageError || !convention.imageUrl ? defaultImage : convention.imageUrl

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg bg-gradient-to-br from-[#1a1a1a] to-[#1e1e1e] border-[#2a2a2a] hover:border-[#ff7145]/30">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={convention.name}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl text-[#fffbea]">{convention.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-gray-400">
          <MapPin className="h-4 w-4 text-[#ff7145]" /> {convention.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Calendar className="h-4 w-4 text-[#ff7145]" />
          <span>
            {formatDate(convention.startDate)} - {formatDate(convention.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4 text-[#ff7145]" />
          <span>{loading ? "Chargement..." : `${photographers.length} photographes présents`}</span>
        </div>
        <p className="mt-4 line-clamp-2 text-sm text-gray-300">{convention.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link href={`/conventions/${convention.id}`} className="w-full">
          <Button variant="default" className="w-full bg-[#ff7145] hover:bg-[#ff7145]/90 text-white">
            View Details
          </Button>
        </Link>
        {user && userData?.role === "cosplayer" && (
          <div className="flex flex-wrap gap-2">
            {photographers.slice(0, 3).map((photographer) => (
              <Link key={photographer.uid} href={`/photographer/${photographer.uid}`}>
                <Button variant="outline" size="sm">
                  {photographer.displayName || "Photographer"}
                </Button>
              </Link>
            ))}
            {photographers.length > 3 && (
              <Button variant="ghost" size="sm">
                +{photographers.length - 3} more
              </Button>
            )}
          </div>
        )}
        {user && userData?.role === "photographer" && isAttending && (
          <div className="text-sm text-[#ff7145]">Vous participez à cette convention</div>
        )}
      </CardFooter>
    </Card>
  )
}
