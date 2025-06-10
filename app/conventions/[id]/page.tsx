import { getStaticConventionIds } from "@/lib/static-params"
import ConventionDetailPageClient from "./ConventionDetailPageClient"

export async function generateStaticParams() {
  // Pour l'export statique, on utilise des IDs prédéfinis
  return getStaticConventionIds()
}

export default function ConventionDetailPage() {
  return <ConventionDetailPageClient />
}
