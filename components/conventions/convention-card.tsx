"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import type { Convention } from "@/lib/conventions"
import { formatDate } from "@/lib/utils"

interface ConventionCardProps {
  convention: Convention
  photographersCount?: number
}

export function ConventionCard({ convention, photographersCount = 0 }: ConventionCardProps) {
  const [imageError, setImageError] = useState(false)

  const defaultImage = "/placeholder.svg?height=200&width=400"
  const imageUrl = imageError || !convention.imageUrl ? defaultImage : convention.imageUrl

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
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
        <CardTitle className="text-xl">{convention.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" /> {convention.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(convention.startDate)} - {formatDate(convention.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{photographersCount} photographers attending</span>
        </div>
        <p className="mt-4 line-clamp-2 text-sm">{convention.description}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/conventions/${convention.id}`} className="w-full">
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
