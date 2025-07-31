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

  const startScanner = async () => {
    try {
      // Check for camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
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
      console.error("Camera permission denied:", error)
      setHasPermission(false)
      setError("Camera access denied. Please allow camera access to scan QR codes.")
      if (onError) {
        onError("Camera access denied. Please allow camera access to scan QR codes.")
      }
    }
  }

  const stopCamera = () => {
    console.log("Stopping camera...")
    // Stop QR reader
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (error) {
        console.log("QR reader already stopped")
      }
      codeReaderRef.current = null
    }
    
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const videoStream = videoRef.current.srcObject as MediaStream
      videoStream.getTracks().forEach(track => {
        console.log("Stopping track:", track.kind)
        track.stop()
      })
      videoRef.current.srcObject = null
    }
    
    // Stop the stream we created
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log("Stopping stream track:", track.kind)
        track.stop()
      })
      streamRef.current = null
    }
    
    setIsScanning(false)
    setIsPaused(false)
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
    if (videoRef.current && streamRef.current) {
      setIsPaused(false)
      setIsScanning(true)
      
      // Reinitialize QR reader
      codeReaderRef.current = new BrowserQRCodeReader()
      
      codeReaderRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
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
    console.log("Closing camera...")
    
    // Force stop all camera operations
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
        codeReaderRef.current = null
      } catch (error) {
        console.log("QR reader already stopped")
      }
    }
    
    // Stop all video tracks immediately
    if (videoRef.current && videoRef.current.srcObject) {
      const videoStream = videoRef.current.srcObject as MediaStream
      videoStream.getTracks().forEach(track => {
        console.log("Force stopping video track:", track.kind)
        track.stop()
      })
      videoRef.current.srcObject = null
    }
    
    // Stop the stream we created
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log("Force stopping stream track:", track.kind)
        track.stop()
      })
      streamRef.current = null
    }
    
    // Reset all states
    setIsScanning(false)
    setIsPaused(false)
    setHasPermission(null)
    setError(null)
    
    // Call the onClose callback
    if (onClose) {
      onClose()
    }
  }

  useEffect(() => {
    startScanner()

    return () => {
      console.log("Component cleanup: force stopping camera")
      
      // Force stop all camera operations
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset()
          codeReaderRef.current = null
        } catch (error) {
          console.log("QR reader already stopped")
        }
      }
      
      // Stop all video tracks immediately
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream
        videoStream.getTracks().forEach(track => {
          console.log("Force stopping video track on cleanup:", track.kind)
          track.stop()
        })
        videoRef.current.srcObject = null
      }
      
      // Stop the stream we created
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log("Force stopping stream track on cleanup:", track.kind)
          track.stop()
        })
        streamRef.current = null
      }
      
      // Reset all states
      setIsScanning(false)
      setIsPaused(false)
      setHasPermission(null)
      setError(null)
    }
  }, [])

  // Additional cleanup effect for component unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting: stopping camera")
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset()
        } catch (error) {
          console.log("QR reader already stopped")
        }
        codeReaderRef.current = null
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log("Stopping track on unmount:", track.kind)
          track.stop()
        })
        streamRef.current = null
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream
        videoStream.getTracks().forEach(track => {
          console.log("Stopping video track on unmount:", track.kind)
          track.stop()
        })
        videoRef.current.srcObject = null
      }
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
    
    // Stop current camera
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (error) {
        console.log("QR reader already stopped")
      }
      codeReaderRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log("Stopping track on retry:", track.kind)
        track.stop()
      })
      streamRef.current = null
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => {
        console.log("Stopping video track on retry:", track.kind)
        track.stop()
      })
      videoRef.current.srcObject = null
    }
    
    // Re-run the effect
    setTimeout(() => {
      startScanner()
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