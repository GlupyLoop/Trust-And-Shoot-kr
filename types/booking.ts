export interface TimeSlot {
  id: string
  photographerId: string
  date: Date
  startTime: string
  endTime: string
  status: "available" | "pending" | "booked" | "cancelled"
  price: number
  location: string
  description?: string
  bookedBy?: string | null
  bookedAt?: Date | null
  createdAt: Date
}

export interface BookingRequest {
  id: string
  timeSlotId: string
  photographerId: string
  cosplayerId: string
  requestDate: Date
  status: "pending" | "accepted" | "rejected" | "cancelled"
  message?: string
  cosplayCharacter?: string
  cosplayReference?: string
  paymentStatus?: "pending" | "paid" | "refunded"
}

export interface BookingSettings {
  photographerId: string
  allowBooking: boolean
  autoAccept: boolean
  requirePayment: boolean
  cancellationPolicy?: string
  bookingInstructions?: string
}
