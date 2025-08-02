"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, QrCode } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ClaimQRCodeProps {
  claimCode: string
  rewardTitle: string
  merchantName: string
  redeemedPoints: number
  expiresAt?: string
}

export function ClaimQRCode({ 
  claimCode, 
  rewardTitle, 
  merchantName, 
  redeemedPoints,
  expiresAt 
}: ClaimQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Create QR code data with structured information
        const qrData = JSON.stringify({
          type: "pointify_claim",
          code: claimCode,
          reward: rewardTitle,
          merchant: merchantName,
          points: redeemedPoints,
          timestamp: Date.now()
        })
        
        const url = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(url)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }

    generateQR()
  }, [claimCode, rewardTitle, merchantName, redeemedPoints])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(claimCode)
    toast({
      title: "Copied!",
      description: "Claim code copied to clipboard",
    })
  }

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `pointify-claim-${claimCode}.png`
      link.click()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-6 w-6" />
          Your Claim Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="Claim QR Code" 
              className="border-2 border-border rounded-lg"
            />
          ) : (
            <div className="w-[300px] h-[300px] border-2 border-border rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Claim Code */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Claim Code:</p>
          <div className="bg-muted p-4 rounded-lg">
            <code className="text-2xl font-mono font-bold tracking-wider">
              {claimCode}
            </code>
          </div>
        </div>

        {/* Reward Details */}
        <div className="space-y-2 text-center">
          <h3 className="font-semibold text-lg">{rewardTitle}</h3>
          <p className="text-muted-foreground">{merchantName}</p>
          <p className="text-sm">
            <span className="font-semibold">{redeemedPoints}</span> LOYAL points
          </p>
          {expiresAt && (
            <p className="text-xs text-muted-foreground">
              Expires: {new Date(expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCopyCode}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadQR}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Save QR
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How to redeem:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Show this QR code to the cashier</li>
            <li>2. Or tell them the claim code: <strong>{claimCode}</strong></li>
            <li>3. Wait for them to confirm your redemption</li>
            <li>4. Enjoy your reward!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
} 