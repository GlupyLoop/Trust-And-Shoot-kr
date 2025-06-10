import CosplayerProfileClient from "./CosplayerProfileClient"
import { getStaticCosplayerIds } from "@/lib/static-params"

export async function generateStaticParams() {
  // Pour l'export statique, on utilise des IDs prédéfinis
  return getStaticCosplayerIds()
}

export default function CosplayerProfile() {
  return <CosplayerProfileClient />
}
