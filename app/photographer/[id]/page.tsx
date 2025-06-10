import { getStaticPhotographerIds } from "@/lib/static-params"
import PhotographerProfileClient from "./PhotographerProfileClient"

export async function generateStaticParams() {
  // Pour l'export statique, on utilise des IDs prédéfinis
  return getStaticPhotographerIds()
}

export default function PhotographerProfile({ params }: { params: { id: string } }) {
  return <PhotographerProfileClient id={params.id} />
}
