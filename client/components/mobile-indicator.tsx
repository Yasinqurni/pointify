"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Monitor } from "lucide-react"

export function MobileIndicator() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobile(mobile)
  }, [])

  if (isMobile === null) {
    return null // Loading
  }

  return (
    <Badge 
      variant={isMobile ? "default" : "secondary"} 
      className={`mb-4 ${isMobile ? 'bg-blue-500' : 'bg-gray-500'}`}
    >
      {isMobile ? (
        <>
          <Smartphone className="h-3 w-3 mr-1" />
          Mobile Device Detected
        </>
      ) : (
        <>
          <Monitor className="h-3 w-3 mr-1" />
          Desktop
        </>
      )}
    </Badge>
  )
} 