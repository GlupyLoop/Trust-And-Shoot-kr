import { db, storage } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export type Convention = {
  id: string
  name: string
  location: string
  startDate: Date
  endDate: Date
  description: string
  imageUrl?: string
}

export type TimeSlot = {
  id: string
  photographerId: string
  conventionId: string
  date: Date
  startTime: string
  endTime: string
  status: "available" | "booked"
  userId?: string
  userName?: string
  photographerName?: string
}

// Fonction pour récupérer toutes les conventions
export async function getConventions(): Promise<Convention[]> {
  const conventionsRef = collection(db, "conventions")
  const snapshot = await getDocs(conventionsRef)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      location: data.location,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      description: data.description,
      imageUrl: data.imageUrl,
    }
  })
}

// Fonction pour récupérer une convention par son ID
export async function getConventionById(id: string): Promise<Convention | null> {
  const conventionRef = doc(db, "conventions", id)
  const conventionDoc = await getDoc(conventionRef)

  if (!conventionDoc.exists()) {
    return null
  }

  const data = conventionDoc.data()
  return {
    id: conventionDoc.id,
    name: data.name,
    location: data.location,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
    description: data.description,
    imageUrl: data.imageUrl,
  }
}

// Fonction pour créer une nouvelle convention
export async function createConvention(convention: Omit<Convention, "id">, imageFile?: File): Promise<string> {
  let imageUrl = ""

  if (imageFile) {
    const storageRef = ref(storage, `conventions/${Date.now()}_${imageFile.name}`)
    const uploadResult = await uploadBytes(storageRef, imageFile)
    imageUrl = await getDownloadURL(uploadResult.ref)
  }

  const conventionData = {
    name: convention.name,
    location: convention.location,
    startDate: Timestamp.fromDate(convention.startDate),
    endDate: Timestamp.fromDate(convention.endDate),
    description: convention.description,
    imageUrl,
  }

  const docRef = await addDoc(collection(db, "conventions"), conventionData)
  return docRef.id
}

// Fonction pour mettre à jour une convention
export async function updateConvention(id: string, convention: Partial<Convention>, imageFile?: File): Promise<void> {
  const conventionRef = doc(db, "conventions", id)

  const updateData: any = { ...convention }

  if (convention.startDate) {
    updateData.startDate = Timestamp.fromDate(convention.startDate)
  }

  if (convention.endDate) {
    updateData.endDate = Timestamp.fromDate(convention.endDate)
  }

  if (imageFile) {
    const storageRef = ref(storage, `conventions/${Date.now()}_${imageFile.name}`)
    const uploadResult = await uploadBytes(storageRef, imageFile)
    updateData.imageUrl = await getDownloadURL(uploadResult.ref)
  }

  await updateDoc(conventionRef, updateData)
}

// Fonction pour supprimer une convention
export async function deleteConvention(id: string): Promise<void> {
  await deleteDoc(doc(db, "conventions", id))
}

// Fonction pour récupérer les photographes participant à une convention
export async function getPhotographersForConvention(conventionId: string): Promise<any[]> {
  const photographersRef = collection(db, "users")
  const q = query(
    photographersRef,
    where("userType", "==", "photographer"),
    where("conventions", "array-contains", conventionId),
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Fonction pour ajouter une convention à un photographe
export async function addConventionToPhotographer(photographerId: string, conventionId: string): Promise<void> {
  const photographerRef = doc(db, "users", photographerId)
  const photographerDoc = await getDoc(photographerRef)

  if (!photographerDoc.exists()) {
    throw new Error("Photographer not found")
  }

  const data = photographerDoc.data()
  const conventions = data.conventions || []

  if (!conventions.includes(conventionId)) {
    await updateDoc(photographerRef, {
      conventions: [...conventions, conventionId],
    })
  }
}

// Fonction pour supprimer une convention d'un photographe
export async function removeConventionFromPhotographer(photographerId: string, conventionId: string): Promise<void> {
  const photographerRef = doc(db, "users", photographerId)
  const photographerDoc = await getDoc(photographerRef)

  if (!photographerDoc.exists()) {
    throw new Error("Photographer not found")
  }

  const data = photographerDoc.data()
  const conventions = data.conventions || []

  await updateDoc(photographerRef, {
    conventions: conventions.filter((id: string) => id !== conventionId),
  })
}

// Fonction pour créer un créneau horaire
export async function createTimeSlot(slot: Omit<TimeSlot, "id">): Promise<string> {
  const slotData = {
    ...slot,
    date: Timestamp.fromDate(slot.date),
  }

  const docRef = await addDoc(collection(db, "timeSlots"), slotData)
  return docRef.id
}

// Fonction pour récupérer les créneaux d'un photographe pour une convention
export async function getPhotographerTimeSlots(photographerId: string, conventionId: string): Promise<TimeSlot[]> {
  const slotsRef = collection(db, "timeSlots")
  const q = query(slotsRef, where("photographerId", "==", photographerId), where("conventionId", "==", conventionId))

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      photographerId: data.photographerId,
      conventionId: data.conventionId,
      date: data.date.toDate(),
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      userId: data.userId,
      userName: data.userName,
      photographerName: data.photographerName,
    }
  })
}

// Fonction pour réserver un créneau
export async function bookTimeSlot(slotId: string, userId: string, userName: string): Promise<void> {
  const slotRef = doc(db, "timeSlots", slotId)

  await updateDoc(slotRef, {
    status: "booked",
    userId,
    userName,
  })
}

// Fonction pour annuler une réservation
export async function cancelBooking(slotId: string): Promise<void> {
  const slotRef = doc(db, "timeSlots", slotId)

  await updateDoc(slotRef, {
    status: "available",
    userId: null,
    userName: null,
  })
}

// Fonction pour supprimer un créneau
export async function deleteTimeSlot(slotId: string): Promise<void> {
  await deleteDoc(doc(db, "timeSlots", slotId))
}

// Fonction pour récupérer les réservations d'un utilisateur
export async function getUserBookings(userId: string): Promise<TimeSlot[]> {
  const slotsRef = collection(db, "timeSlots")
  const q = query(slotsRef, where("userId", "==", userId), where("status", "==", "booked"))

  const snapshot = await getDocs(q)

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data()

      // Récupérer le nom du photographe
      const photographerRef = doc(db, "users", data.photographerId)
      const photographerDoc = await getDoc(photographerRef)
      const photographerName = photographerDoc.exists()
        ? `${photographerDoc.data().firstName} ${photographerDoc.data().lastName}`
        : "Unknown Photographer"

      return {
        id: doc.id,
        photographerId: data.photographerId,
        conventionId: data.conventionId,
        date: data.date.toDate(),
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        userId: data.userId,
        userName: data.userName,
        photographerName,
      }
    }),
  )
}
