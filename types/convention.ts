export interface Convention {
  id: string
  name: string
  location: string
  startDate: Date | string
  endDate: Date | string
  description: string
  imageUrl?: string
  createdAt: Date | string
}

export interface TimeSlot {
  id: string
  photographerId: string
  conventionId: string
  date: Date | string
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  status: "available" | "booked"
  bookedBy?: string // userId if booked
  bookedAt?: Date | string
  price?: number
  notes?: string
}

export interface BookingRequest {
  id: string
  timeSlotId: string
  photographerId: string
  userId: string
  conventionId: string
  requestDate: Date | string
  status: "pending" | "accepted" | "rejected"
  message?: string
}
