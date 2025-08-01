"use client"

import { useEffect } from "react"
import { setupGlobalCameraCleanup, forceStopAllCameraStreams } from "@/lib/camera-utils"

interface CameraCleanupProviderProps {
  children: React.ReactNode
}

export function CameraCleanupProvider({ children }: CameraCleanupProviderProps) {
  useEffect(() => {
    // Set up global camera cleanup on mount
    setupGlobalCameraCleanup()
    
    // Cleanup function to stop all cameras when provider unmounts
    return () => {
      console.log('🔴 CameraCleanupProvider: Cleaning up all cameras')
      forceStopAllCameraStreams()
    }
  }, [])
  
  return <>{children}</>
} 