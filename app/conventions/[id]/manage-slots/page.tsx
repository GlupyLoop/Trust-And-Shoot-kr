import { getStaticConventionIds } from "@/lib/static-params"
import ManageSlotsClientPage from "./ManageSlotsClientPage"

export async function generateStaticParams() {
  // Pour l'export statique, on utilise des IDs prédéfinis
  return getStaticConventionIds()
}

export default function ManageSlotsPage() {
  return <ManageSlotsClientPage />
}
