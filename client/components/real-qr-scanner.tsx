"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserQRCodeReader } from "@zxing/library"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, X, QrCode, Play, Square } from "lucide-react"

interface RealQRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
  onClose?: () => void
}

export function RealQRScanner({ onScan, onError, onClose }: RealQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isMountedRef = useRef(true)

  const startScanner = async () => {
    if (!isMountedRef.current) return

    try {
      // Check for camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (!isMountedRef.current) {
        // Component was unmounted while getting permission
        stream.getTracks().forEach(track => track.stop())
        return
      }
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
        setIsScanning(true)
        setIsPaused(false)
        
        // Initialize ZXing QR reader
        codeReaderRef.current = new BrowserQRCodeReader()
        
        // Start scanning
        codeReaderRef.current.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (!isMountedRef.current) return
            
            if (result && !isPaused) {
              console.log("QR Code detected:", result.getText())
              onScan(result.getText())
              setIsScanning(false)
              // Stop scanning after successful scan
              stopCamera()
            }
            if (error && error.name !== 'NotFoundException') {
              console.error("QR scanning error:", error)
              setError(error.message)
            }
          }
        )
      }
    } catch (error: any) {
      if (!isMountedRef.current) return
      
      console.error("Camera permission denied:", error)
      setHasPermission(false)
      setError("Camera access denied. Please allow camera access to scan QR codes.")
      if (onError) {
        onError("Camera access denied. Please allow camera access to scan QR codes.")
      }
    }
  }

  const stopCamera = () => {
    console.log("🔴 Stopping camera...")
    
    // STEP 1: Stop QR reader FIRST and more aggressively
    if (codeReaderRef.current) {
      try {
        // Try multiple cleanup methods for ZXing
        codeReaderRef.current.reset()
        if (typeof codeReaderRef.current.stopContinuousDecode === 'function') {
          codeReaderRef.current.stopContinuousDecode()
        }
        if (typeof codeReaderRef.current.stopAsyncDecode === 'function') {
          codeReaderRef.current.stopAsyncDecode()
        }
        console.log("✅ QR reader stopped")
      } catch (error) {
        console.log("ℹ️ QR reader cleanup error (expected):", error)
      }
      codeReaderRef.current = null
    }
    
    // STEP 2: Stop ALL tracks immediately (multiple approaches)
    const allStreams: MediaStream[] = []
    
    // Collect video element stream
    if (videoRef.current && videoRef.current.srcObject) {
      const videoStream = videoRef.current.srcObject as MediaStream
      allStreams.push(videoStream)
    }
    
    // Collect our stored stream
    if (streamRef.current) {
      allStreams.push(streamRef.current)
    }
    
    // Stop all tracks from all collected streams
    allStreams.forEach((stream, index) => {
      stream.getTracks().forEach(track => {
        console.log(`🔴 Force stopping track ${track.kind} from stream ${index}, state:`, track.readyState)
        if (track.readyState === 'live') {
          try {
            track.stop()
            console.log(`✅ Track ${track.kind} stopped`)
          } catch (error) {
            console.log(`⚠️ Error stopping track ${track.kind}:`, error)
          }
        }
      })
    })
    
    // STEP 3: Clear video element completely
    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.srcObject = null
        videoRef.current.src = ""
        videoRef.current.load() // Force reload to clear any cached streams
        console.log("✅ Video element completely cleared")
      } catch (error) {
        console.log("⚠️ Video element cleanup error:", error)
      }
    }
    
    // STEP 4: Clear our stream reference
    streamRef.current = null
    
    // STEP 5: Global stream cleanup (find any orphaned streams)
    try {
      const allVideoElements = document.querySelectorAll('video')
      allVideoElements.forEach((video, index) => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
              console.log(`🔴 GLOBAL: Found orphaned track ${track.kind} on video ${index}`)
              track.stop()
            }
          })
          video.srcObject = null
        }
      })
    } catch (error) {
      console.log("⚠️ Global cleanup error:", error)
    }
    
    setIsScanning(false)
    setIsPaused(false)
    console.log("✅ Camera completely stopped")
  }

  const pauseScanner = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (error) {
        console.log("QR reader already stopped")
      }
    }
    setIsPaused(true)
    setIsScanning(false)
  }

  const resumeScanner = () => {
    if (videoRef.current && streamRef.current && isMountedRef.current) {
      setIsPaused(false)
      setIsScanning(true)
      
      // Reinitialize QR reader
      codeReaderRef.current = new BrowserQRCodeReader()
      
      codeReaderRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (!isMountedRef.current) return
          
          if (result && !isPaused) {
            console.log("QR Code detected:", result.getText())
            onScan(result.getText())
            setIsScanning(false)
            stopCamera()
          }
          if (error && error.name !== 'NotFoundException') {
            console.error("QR scanning error:", error)
            setError(error.message)
          }
        }
      )
    }
  }

  const handleClose = () => {
    console.log("🔴 Closing camera...")
    
    // IMMEDIATE aggressive stop
    stopCamera()
    
    // Add multiple safety checks with delays
    setTimeout(() => {
      console.log("🔴 Safety check 1: Looking for lingering tracks...")
      
      // Check our stream ref
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            console.log("🔴 EMERGENCY: Stopping lingering stream track:", track.kind)
            track.stop()
          }
        })
      }
      
      // Check video element
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            console.log("🔴 EMERGENCY: Stopping lingering video track:", track.kind)
            track.stop()
          }
        })
        videoRef.current.srcObject = null
      }
      
      // Global check
      document.querySelectorAll('video').forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
              console.log("🔴 EMERGENCY: Stopping global lingering track:", track.kind)
              track.stop()
            }
          })
          video.srcObject = null
        }
      })
    }, 100)
    
    // Final safety check
    setTimeout(() => {
      console.log("🔴 Final safety check: Ensuring all cameras are off...")
      
      // Force stop any remaining tracks globally
      document.querySelectorAll('video').forEach(video => {
        if (video.srcObject) {
          console.log("🚨 CRITICAL: Found active video stream during final check!")
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
          video.srcObject = null
        }
      })
      
      // Reset all states and call callback
      setHasPermission(null)
      setError(null)
      
      console.log("✅ Final cleanup completed")
      
      // Call the onClose callback
      if (onClose) {
        onClose()
      }
    }, 300)
  }

  useEffect(() => {
    isMountedRef.current = true
    startScanner()

    return () => {
      console.log("🔴 Component cleanup: FORCE stopping camera")
      isMountedRef.current = false
      
      // Immediate cleanup when component unmounts
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset()
        } catch (error) {
          console.log("QR reader already stopped in cleanup")
        }
        codeReaderRef.current = null
      }
      
      // Stop all tracks immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            console.log("🔴 CLEANUP: Force stopping track:", track.kind)
            track.stop()
          }
        })
        streamRef.current = null
      }
      
      // Clear video element
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop()
          }
        })
        videoRef.current.srcObject = null
      }
      
      console.log("✅ Component cleanup completed")
    }
  }, [])

  const handleManualInput = () => {
    const code = prompt("Enter QR code manually:")
    if (code) {
      onScan(code)
    }
  }

  const handleRetry = () => {
    setError(null)
    setHasPermission(null)
    stopCamera()
    
    // Re-run the effect
    setTimeout(() => {
      if (isMountedRef.current) {
        startScanner()
      }
    }, 100)
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <X className="h-16 w-16 text-red-500" />
        <h3 className="text-lg font-semibold">Camera Access Required</h3>
        <p className="text-sm text-muted-foreground text-center">
          Please allow camera access to scan QR codes, or use manual input.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
          <Button onClick={handleManualInput} variant="outline">
            Enter Code Manually
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <X className="h-16 w-16 text-red-500" />
        <h3 className="text-lg font-semibold">Scanning Error</h3>
        <p className="text-sm text-muted-foreground text-center">
          {error}
        </p>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
          <Button onClick={handleManualInput} variant="outline">
            Enter Code Manually
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-full max-w-md mx-auto">
          <video
            ref={videoRef}
            className="w-full rounded-lg border-2 border-primary/20"
            autoPlay
            playsInline
            muted
          />
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-lg">
                <QrCode className="h-5 w-5 animate-pulse" />
                <span>Scanning QR Code...</span>
              </div>
            </div>
          )}
          
          {/* Camera Control Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isPaused ? (
              <Button
                onClick={resumeScanner}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                title="Resume Scanning"
              >
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={pauseScanner}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2"
                title="Pause Scanning"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={handleClose}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200"
              title="Close Camera"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {isPaused ? "Camera paused. Click play to resume scanning." : "Point your camera at a QR code"}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleManualInput} variant="outline" size="sm">
            Enter Code Manually
          </Button>
          {isPaused && (
            <Button onClick={resumeScanner} variant="default" size="sm" className="bg-green-500 hover:bg-green-600">
              <Play className="h-3 w-3 mr-1" />
              Resume Scan
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 