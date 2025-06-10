"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  conversationId: string
  handleBackToList: () => void
}

const MessageHeader: React.FC<HeaderProps> = ({ conversationId, handleBackToList }) => {
  const router = useRouter()

  return (
    <div className="bg-[#1a1a1a] w-full flex items-center justify-between p-3 border-b-[1px] border-[#2a2a2a]">
      <div className="flex items-center gap-3">
        <button onClick={handleBackToList} className="block md:hidden p-2 hover:bg-[#2a2a2a] rounded-full transition">
          <ArrowLeft size={20} />
        </button>
      </div>
    </div>
  )
}

export default MessageHeader
