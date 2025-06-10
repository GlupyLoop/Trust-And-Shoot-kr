import { collection, getDocs, query, limit, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Limite le nombre d'IDs à générer pour éviter un build trop long
const MAX_STATIC_ITEMS = 20

// Récupère les IDs des photographes
export async function getPhotographerIds() {
  try {
    const q = query(collection(db, "users"), where("role", "==", "photographer"), limit(MAX_STATIC_ITEMS))

    const snapshot = await getDocs(q)
    const ids = snapshot.docs.map((doc) => ({ id: doc.id }))

    // Si aucun photographe trouvé, retourner des IDs d'exemple
    if (ids.length === 0) {
      return [{ id: "example-photographer-1" }, { id: "example-photographer-2" }, { id: "example-photographer-3" }]
    }

    return ids
  } catch (error) {
    console.error("Erreur lors de la récupération des IDs de photographes:", error)
    return [{ id: "example-photographer-1" }, { id: "example-photographer-2" }, { id: "example-photographer-3" }]
  }
}

// Récupère les IDs des cosplayers
export async function getCosplayerIds() {
  try {
    const q = query(collection(db, "users"), where("role", "==", "cosplayer"), limit(MAX_STATIC_ITEMS))

    const snapshot = await getDocs(q)
    const ids = snapshot.docs.map((doc) => ({ id: doc.id }))

    // Si aucun cosplayer trouvé, retourner des IDs d'exemple
    if (ids.length === 0) {
      return [{ id: "example-cosplayer-1" }, { id: "example-cosplayer-2" }, { id: "example-cosplayer-3" }]
    }

    return ids
  } catch (error) {
    console.error("Erreur lors de la récupération des IDs de cosplayers:", error)
    return [{ id: "example-cosplayer-1" }, { id: "example-cosplayer-2" }, { id: "example-cosplayer-3" }]
  }
}

// Récupère les IDs des conventions
export async function getConventionIds() {
  try {
    const q = query(collection(db, "conventions"), limit(MAX_STATIC_ITEMS))

    const snapshot = await getDocs(q)
    const ids = snapshot.docs.map((doc) => ({ id: doc.id }))

    // Si aucune convention trouvée, retourner les IDs d'exemple existants
    if (ids.length === 0) {
      return [{ id: "example-convention" }, { id: "comic-con-brussels" }, { id: "made-in-asia" }]
    }

    return ids
  } catch (error) {
    console.error("Erreur lors de la récupération des IDs de conventions:", error)
    return [{ id: "example-convention" }, { id: "comic-con-brussels" }, { id: "made-in-asia" }]
  }
}

// Version simplifiée pour l'export statique
export function getStaticPhotographerIds() {
  return [{ id: "example-photographer-1" }, { id: "example-photographer-2" }, { id: "example-photographer-3" }]
}

export function getStaticCosplayerIds() {
  return [{ id: "example-cosplayer-1" }, { id: "example-cosplayer-2" }, { id: "example-cosplayer-3" }]
}

export function getStaticConventionIds() {
  return [{ id: "example-convention" }, { id: "comic-con-brussels" }, { id: "made-in-asia" }]
}
