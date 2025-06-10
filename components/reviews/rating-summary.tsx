"use client"
import type { PhotographerData } from "@/lib/firebase"

type RatingSummaryProps = {
  photographer: PhotographerData
}

export default function RatingSummary({ photographer }: RatingSummaryProps) {
  const averageRating = photographer.averageRating || 0
  const totalReviews = photographer.totalReviews || 0

  // Utiliser la distribution des notes si disponible, sinon utiliser des valeurs par défaut
  const ratingDistribution = photographer.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }

  return (
    <div className="mb-6">
      <h3 className="font-medium text-[#fffbea] mb-3">Résumé des notes</h3>
      <div className="flex items-center gap-4 mb-3">
        <div className="text-4xl font-bold text-[#ff7145]">{averageRating.toFixed(1)}</div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-3 text-[#fffbea]">{stars}</span>
              <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#ff7145] h-full"
                  style={{
                    width:
                      totalReviews > 0
                        ? `${(ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] / totalReviews) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 w-6 text-right">
                {ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-sm text-gray-400 text-center">Basé sur {totalReviews} avis</div>
    </div>
  )
}
