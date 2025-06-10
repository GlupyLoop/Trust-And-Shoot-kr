import { format } from "date-fns"
import { fr } from "date-fns/locale"

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "PPP", { locale: fr })
}

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
