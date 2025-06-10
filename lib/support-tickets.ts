import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface SupportTicket {
  id?: string
  userId?: string
  email: string
  subject: string
  description: string
  priority: "low" | "medium" | "high"
  status?: "open" | "in_progress" | "resolved" | "closed"
  createdAt?: Date | Timestamp
  updatedAt?: Date | Timestamp
  resolvedAt?: Date | Timestamp
  adminResponse?: string
  adminId?: string
}

// Create a new support ticket
export async function createSupportTicket(
  ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "status">,
): Promise<SupportTicket> {
  try {
    const ticketData = {
      userId: ticket.userId || null,
      email: ticket.email,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      status: "open" as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "supportTickets"), ticketData)

    return {
      id: docRef.id,
      ...ticket,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating support ticket:", error)
    throw new Error("Failed to create support ticket")
  }
}

// Get tickets for a specific user (simplified query without orderBy to avoid index requirement)
export async function getUserTickets(userId: string): Promise<SupportTicket[]> {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(collection(db, "supportTickets"), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    const tickets: SupportTicket[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tickets.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        resolvedAt: data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate() : data.resolvedAt,
      } as SupportTicket)
    })

    // Sort in JavaScript instead of Firestore
    return tickets.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date()
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date()
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    throw new Error("Failed to fetch tickets")
  }
}

// Get all tickets (admin function) - simplified query
export async function getAllTickets(status?: string): Promise<SupportTicket[]> {
  try {
    let q = query(collection(db, "supportTickets"), limit(100)) // Add limit for performance

    if (status) {
      q = query(collection(db, "supportTickets"), where("status", "==", status), limit(100))
    }

    const querySnapshot = await getDocs(q)
    const tickets: SupportTicket[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tickets.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        resolvedAt: data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate() : data.resolvedAt,
      } as SupportTicket)
    })

    // Sort in JavaScript instead of Firestore
    return tickets.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date()
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date()
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error fetching all tickets:", error)
    throw new Error("Failed to fetch tickets")
  }
}

// Update ticket status
export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicket["status"],
  adminResponse?: string,
  adminId?: string,
): Promise<SupportTicket> {
  try {
    const ticketRef = doc(db, "supportTickets", ticketId)

    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    }

    if (adminResponse) {
      updateData.adminResponse = adminResponse
    }

    if (adminId) {
      updateData.adminId = adminId
    }

    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = serverTimestamp()
    }

    await updateDoc(ticketRef, updateData)

    // Get the updated document
    const updatedDoc = await getDoc(ticketRef)
    const data = updatedDoc.data()

    if (!data) {
      throw new Error("Ticket not found after update")
    }

    return {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      resolvedAt: data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate() : data.resolvedAt,
    } as SupportTicket
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw new Error("Failed to update ticket status")
  }
}

// Get ticket by ID
export async function getTicketById(ticketId: string): Promise<SupportTicket | null> {
  try {
    const ticketRef = doc(db, "supportTickets", ticketId)
    const ticketDoc = await getDoc(ticketRef)

    if (!ticketDoc.exists()) {
      return null
    }

    const data = ticketDoc.data()
    return {
      id: ticketDoc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      resolvedAt: data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate() : data.resolvedAt,
    } as SupportTicket
  } catch (error) {
    console.error("Error fetching ticket:", error)
    throw new Error("Failed to fetch ticket")
  }
}

// Get tickets count by status
export async function getTicketsCountByStatus(): Promise<Record<string, number>> {
  try {
    const querySnapshot = await getDocs(query(collection(db, "supportTickets"), limit(1000)))

    const counts = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.status in counts) {
        counts[data.status as keyof typeof counts]++
      }
    })

    return counts
  } catch (error) {
    console.error("Error fetching tickets count:", error)
    throw new Error("Failed to fetch tickets count")
  }
}

// Get tickets by email (for non-authenticated users) - simplified query
export async function getTicketsByEmail(email: string): Promise<SupportTicket[]> {
  try {
    const q = query(collection(db, "supportTickets"), where("email", "==", email))

    const querySnapshot = await getDocs(q)
    const tickets: SupportTicket[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tickets.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        resolvedAt: data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate() : data.resolvedAt,
      } as SupportTicket)
    })

    // Sort in JavaScript instead of Firestore
    return tickets.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date()
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date()
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error fetching tickets by email:", error)
    throw new Error("Failed to fetch tickets")
  }
}
