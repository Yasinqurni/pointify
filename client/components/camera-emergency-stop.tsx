"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CameraOff } from "lucide-react"
import { forceStopAllCameraStreams } from "@/lib/camera-utils"

export function CameraEmergencyStop() {
  const [showEmergencyButton, setShowEmergencyButton] = useState(false)
  const [activeCameras, setActiveCameras] = useState(0)

  // Check for active cameras periodically
  useEffect(() => {
    const checkCameras = () => {
      let count = 0
      const videoElements = document.querySelectorAll('video')
      
      videoElements.forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
              count++
            }
          })
        }
      })
      
      setActiveCameras(count)
      setShowEmergencyButton(count > 0)
    }

    // Check immediately
    checkCameras()
    
    // Check every 2 seconds
    const interval = setInterval(checkCameras, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const handleEmergencyStop = () => {
    console.log('🚨 EMERGENCY STOP: User triggered manual camera stop')
    forceStopAllCameraStreams()
    
    // Re-check after a short delay
    setTimeout(() => {
      let count = 0
      document.querySelectorAll('video').forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
              count++
            }
          })
        }
      })
      setActiveCameras(count)
      setShowEmergencyButton(count > 0)
    }, 1000)
  }

  if (!showEmergencyButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-pulse">
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg border-2 border-red-600">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold text-sm">Camera Still Running!</span>
        </div>
        <div className="text-xs mb-3">
          {activeCameras} active camera stream{activeCameras !== 1 ? 's' : ''} detected
        </div>
        <Button 
          onClick={handleEmergencyStop}
          size="sm"
          variant="secondary"
          className="w-full bg-white text-red-600 hover:bg-gray-100"
        >
          <CameraOff className="h-4 w-4 mr-2" />
          STOP CAMERAS NOW
        </Button>
      </div>
    </div>
  )
} 