import { db } from "./firebase"
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
  setDoc,
  Timestamp,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore"
import type { TimeSlot, BookingRequest, BookingSettings } from "@/types/booking"

// Fonction pour récupérer les créneaux d'un photographe
export async function getPhotographerTimeSlots(photographerId: string): Promise<TimeSlot[]> {
  try {
    console.log(`Fetching time slots for photographer: ${photographerId}`)
    const slotsRef = collection(db, "timeSlots")
    const q = query(slotsRef, where("photographerId", "==", photographerId))

    const snapshot = await getDocs(q)
    console.log(`Found ${snapshot.docs.length} time slots`)

    const timeSlots = snapshot.docs.map((doc) => {
      const data = doc.data()
      const slot = {
        id: doc.id,
        photographerId: data.photographerId,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        price: data.price,
        location: data.location,
        description: data.description || "",
        bookedBy: data.bookedBy || null,
        bookedAt: data.bookedAt
          ? data.bookedAt instanceof Timestamp
            ? data.bookedAt.toDate()
            : new Date(data.bookedAt)
          : null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      }
      console.log(`Time slot ${doc.id}:`, slot)
      return slot
    })

    // Filter and sort in JavaScript
    const now = new Date()
    return timeSlots
      .filter((slot) => new Date(slot.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Error getting photographer time slots:", error)
    throw error
  }
}

// Fonction pour récupérer les créneaux disponibles d'un photographe
export async function getAvailableTimeSlots(photographerId: string): Promise<TimeSlot[]> {
  try {
    const slotsRef = collection(db, "timeSlots")
    const q = query(slotsRef, where("photographerId", "==", photographerId), where("status", "==", "available"))

    const snapshot = await getDocs(q)

    const timeSlots = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        photographerId: data.photographerId,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        price: data.price,
        location: data.location,
        description: data.description || "",
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      }
    })

    // Filter future slots only and sort
    const now = new Date()
    return timeSlots
      .filter((slot) => new Date(slot.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Error getting available time slots:", error)
    throw error
  }
}

// Fonction pour créer un créneau horaire
export async function createTimeSlot(timeSlot: Omit<TimeSlot, "id" | "createdAt">): Promise<string> {
  try {
    console.log("Creating time slot with data:", timeSlot)

    // Validate required fields
    if (!timeSlot.photographerId || !timeSlot.date || !timeSlot.startTime || !timeSlot.endTime) {
      throw new Error("Missing required fields for time slot creation")
    }

    // Ensure date is a Timestamp
    const slotData = {
      ...timeSlot,
      date:
        timeSlot.date instanceof Date ? Timestamp.fromDate(timeSlot.date) : Timestamp.fromDate(new Date(timeSlot.date)),
      createdAt: serverTimestamp(),
      bookedBy: null,
      bookedAt: null,
    }

    console.log("Formatted slot data for Firestore:", slotData)

    // Add document to Firestore
    const docRef = await addDoc(collection(db, "timeSlots"), slotData)
    console.log("Time slot created with ID:", docRef.id)

    return docRef.id
  } catch (error) {
    console.error("Error creating time slot:", error)
    throw error
  }
}

// Fonction pour mettre à jour un créneau horaire
export async function updateTimeSlot(id: string, timeSlot: Partial<TimeSlot>): Promise<void> {
  try {
    const slotRef = doc(db, "timeSlots", id)

    const updateData: any = { ...timeSlot }

    if (timeSlot.date) {
      updateData.date =
        timeSlot.date instanceof Date ? Timestamp.fromDate(timeSlot.date) : Timestamp.fromDate(new Date(timeSlot.date))
    }

    if (timeSlot.bookedAt) {
      updateData.bookedAt =
        timeSlot.bookedAt instanceof Date
          ? Timestamp.fromDate(timeSlot.bookedAt)
          : Timestamp.fromDate(new Date(timeSlot.bookedAt))
    }

    await updateDoc(slotRef, updateData)
    console.log("Time slot updated successfully:", id)
  } catch (error) {
    console.error("Error updating time slot:", error)
    throw error
  }
}

// Fonction pour supprimer un créneau horaire
export async function deleteTimeSlot(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "timeSlots", id))
    console.log("Time slot deleted successfully:", id)
  } catch (error) {
    console.error("Error deleting time slot:", error)
    throw error
  }
}

// Fonction pour créer une demande de réservation
export async function createBookingRequest(
  bookingRequest: Omit<BookingRequest, "id" | "requestDate">,
): Promise<string> {
  try {
    console.log("Creating booking request:", bookingRequest)

    const requestData = {
      ...bookingRequest,
      requestDate: serverTimestamp(),
      status: "pending" as const,
      paymentStatus: "pending" as const,
    }

    const docRef = await addDoc(collection(db, "bookingRequests"), requestData)
    console.log("Booking request created with ID:", docRef.id)

    // Mettre à jour le statut du créneau horaire
    await updateTimeSlot(bookingRequest.timeSlotId, { status: "pending" })

    return docRef.id
  } catch (error) {
    console.error("Error creating booking request:", error)
    throw error
  }
}

// Fonction pour accepter une demande de réservation
export async function acceptBookingRequest(requestId: string): Promise<void> {
  try {
    const requestRef = doc(db, "bookingRequests", requestId)
    const requestDoc = await getDoc(requestRef)

    if (!requestDoc.exists()) {
      throw new Error("Booking request not found")
    }

    const requestData = requestDoc.data() as BookingRequest

    // Mettre à jour le statut de la demande
    await updateDoc(requestRef, {
      status: "accepted",
    })

    // Mettre à jour le statut du créneau horaire
    await updateTimeSlot(requestData.timeSlotId, {
      status: "booked",
      bookedBy: requestData.cosplayerId,
      bookedAt: new Date(),
    })

    console.log("Booking request accepted:", requestId)
  } catch (error) {
    console.error("Error accepting booking request:", error)
    throw error
  }
}

// Fonction pour rejeter une demande de réservation
export async function rejectBookingRequest(requestId: string): Promise<void> {
  try {
    const requestRef = doc(db, "bookingRequests", requestId)
    const requestDoc = await getDoc(requestRef)

    if (!requestDoc.exists()) {
      throw new Error("Booking request not found")
    }

    const requestData = requestDoc.data() as BookingRequest

    // Mettre à jour le statut de la demande
    await updateDoc(requestRef, {
      status: "rejected",
    })

    // Remettre le créneau horaire à disponible
    await updateTimeSlot(requestData.timeSlotId, {
      status: "available",
      bookedBy: null,
      bookedAt: null,
    })

    console.log("Booking request rejected:", requestId)
  } catch (error) {
    console.error("Error rejecting booking request:", error)
    throw error
  }
}

// Fonction pour annuler une réservation
export async function cancelBooking(requestId: string): Promise<void> {
  try {
    const requestRef = doc(db, "bookingRequests", requestId)
    const requestDoc = await getDoc(requestRef)

    if (!requestDoc.exists()) {
      throw new Error("Booking request not found")
    }

    const requestData = requestDoc.data() as BookingRequest

    // Mettre à jour le statut de la demande
    await updateDoc(requestRef, {
      status: "cancelled",
    })

    // Mettre à jour le statut du créneau horaire
    await updateTimeSlot(requestData.timeSlotId, {
      status: "cancelled",
    })

    console.log("Booking cancelled:", requestId)
  } catch (error) {
    console.error("Error cancelling booking:", error)
    throw error
  }
}

// Fonction pour récupérer les demandes de réservation d'un photographe
export async function getPhotographerBookingRequests(photographerId: string): Promise<BookingRequest[]> {
  try {
    const requestsRef = collection(db, "bookingRequests")
    const q = query(requestsRef, where("photographerId", "==", photographerId))

    const snapshot = await getDocs(q)

    const requests = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        timeSlotId: data.timeSlotId,
        photographerId: data.photographerId,
        cosplayerId: data.cosplayerId,
        requestDate:
          data.requestDate instanceof Timestamp ? data.requestDate.toDate() : new Date(data.requestDate || Date.now()),
        status: data.status,
        message: data.message || "",
        cosplayCharacter: data.cosplayCharacter || "",
        cosplayReference: data.cosplayReference || "",
        paymentStatus: data.paymentStatus || "pending",
      }
    })

    return requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
  } catch (error) {
    console.error("Error getting photographer booking requests:", error)
    throw error
  }
}

// Fonction pour récupérer les réservations d'un cosplayer
export async function getCosplayerBookings(cosplayerId: string): Promise<BookingRequest[]> {
  try {
    const requestsRef = collection(db, "bookingRequests")
    const q = query(requestsRef, where("cosplayerId", "==", cosplayerId))

    const snapshot = await getDocs(q)

    const requests = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        timeSlotId: data.timeSlotId,
        photographerId: data.photographerId,
        cosplayerId: data.cosplayerId,
        requestDate:
          data.requestDate instanceof Timestamp ? data.requestDate.toDate() : new Date(data.requestDate || Date.now()),
        status: data.status,
        message: data.message || "",
        cosplayCharacter: data.cosplayCharacter || "",
        cosplayReference: data.cosplayReference || "",
        paymentStatus: data.paymentStatus || "pending",
      }
    })

    return requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
  } catch (error) {
    console.error("Error getting cosplayer bookings:", error)
    throw error
  }
}

// Fonction pour récupérer les paramètres de réservation d'un photographe
export async function getBookingSettings(photographerId: string): Promise<BookingSettings | null> {
  try {
    const settingsRef = doc(db, "bookingSettings", photographerId)
    const settingsDoc = await getDoc(settingsRef)

    if (!settingsDoc.exists()) {
      return null
    }

    return settingsDoc.data() as BookingSettings
  } catch (error) {
    console.error("Error getting booking settings:", error)
    throw error
  }
}

// Fonction pour créer ou mettre à jour les paramètres de réservation d'un photographe
export async function updateBookingSettings(settings: BookingSettings): Promise<void> {
  try {
    const settingsRef = doc(db, "bookingSettings", settings.photographerId)
    await setDoc(settingsRef, settings, { merge: true })
    console.log("Booking settings updated successfully")
  } catch (error) {
    console.error("Error updating booking settings:", error)
    throw error
  }
}

// Fonction pour créer les paramètres de réservation d'un photographe
export async function createBookingSettings(settings: BookingSettings): Promise<void> {
  try {
    const settingsRef = doc(db, "bookingSettings", settings.photographerId)
    await setDoc(settingsRef, settings)
    console.log("Booking settings created successfully")
  } catch (error) {
    console.error("Error creating booking settings:", error)
    throw error
  }
}

// Fonction pour écouter les changements de créneaux en temps réel
export function subscribeToTimeSlots(photographerId: string, callback: (slots: TimeSlot[]) => void): () => void {
  console.log("Setting up real-time subscription for photographer:", photographerId)

  const slotsRef = collection(db, "timeSlots")
  const q = query(slotsRef, where("photographerId", "==", photographerId))

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log("Real-time update received, processing", snapshot.docs.length, "documents")

      const timeSlots = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          photographerId: data.photographerId,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status,
          price: data.price,
          location: data.location,
          description: data.description || "",
          bookedBy: data.bookedBy || null,
          bookedAt: data.bookedAt
            ? data.bookedAt instanceof Timestamp
              ? data.bookedAt.toDate()
              : new Date(data.bookedAt)
            : null,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        }
      })

      // Filter future slots only and sort
      const now = new Date()
      const filteredSlots = timeSlots
        .filter((slot) => new Date(slot.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      console.log("Filtered slots (future only):", filteredSlots.length)
      callback(filteredSlots)
    },
    (error) => {
      console.error("Error in real-time subscription:", error)
    },
  )

  return unsubscribe
}

// Fonction pour écouter les changements de demandes de réservation en temps réel
export function subscribeToBookingRequests(
  photographerId: string,
  callback: (requests: BookingRequest[]) => void,
): () => void {
  console.log("Setting up real-time subscription for booking requests:", photographerId)

  const requestsRef = collection(db, "bookingRequests")
  const q = query(requestsRef, where("photographerId", "==", photographerId))

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log("Real-time booking requests update received, processing", snapshot.docs.length, "documents")

      const requests = snapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            timeSlotId: data.timeSlotId,
            photographerId: data.photographerId,
            cosplayerId: data.cosplayerId,
            requestDate:
              data.requestDate instanceof Timestamp
                ? data.requestDate.toDate()
                : new Date(data.requestDate || Date.now()),
            status: data.status,
            message: data.message || "",
            cosplayCharacter: data.cosplayCharacter || "",
            cosplayReference: data.cosplayReference || "",
            paymentStatus: data.paymentStatus || "pending",
          }
        })
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())

      console.log("Processed booking requests:", requests.length)
      callback(requests)
    },
    (error) => {
      console.error("Error in booking requests real-time subscription:", error)
    },
  )

  return unsubscribe
}
