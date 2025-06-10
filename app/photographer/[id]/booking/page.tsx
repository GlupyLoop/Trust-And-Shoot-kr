import { getStaticPhotographerIds } from "@/lib/static-params"
import BookPhotographerPageClient from "./BookPhotographerPageClient"

export async function generateStaticParams() {
  // Pour l'export statique, on utilise des IDs prédéfinis
  return getStaticPhotographerIds()
}

export default function BookPhotographerPage() {
  return <BookPhotographerPageClient />
}
