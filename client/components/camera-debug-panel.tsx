"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Camera, CameraOff, RefreshCw } from "lucide-react"
import { forceStopAllCameraStreams, checkForActiveCameraStreams } from "@/lib/camera-utils"

export function CameraDebugPanel() {
  const [isChecking, setIsChecking] = useState(false)
  const [activeCameras, setActiveCameras] = useState(0)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const handleCheckCameras = () => {
    setIsChecking(true)
    
    // Count active cameras
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
    setLastCheck(new Date())
    setIsChecking(false)
  }

  const handleStopAllCameras = () => {
    forceStopAllCameraStreams()
    // Re-check after stopping
    setTimeout(() => {
      handleCheckCameras()
    }, 500)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Debug Panel
        </CardTitle>
        <CardDescription>
          Check for active camera streams and force cleanup if needed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Cameras:</span>
          <Badge variant={activeCameras > 0 ? "destructive" : "secondary"}>
            {activeCameras} active
          </Badge>
        </div>
        
        {lastCheck && (
          <div className="text-xs text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}
        
        {activeCameras > 0 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Camera(s) still running! Use "Stop All" to force cleanup.
            </span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleCheckCameras}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check
          </Button>
          
          <Button 
            onClick={handleStopAllCameras}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <CameraOff className="h-4 w-4 mr-2" />
            Stop All
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Use this panel if you notice your camera LED is still on after closing QR scanners.
        </div>
      </CardContent>
    </Card>
  )
} 