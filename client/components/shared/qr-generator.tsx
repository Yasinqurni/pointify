"use client"

import { CardDescription } from "@/components/ui/card"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import QRCode from "qrcode.react"

interface QRGeneratorProps {
  title: string
  description: string
  initialData?: string
  onGenerate?: (data: string) => void
}

export default function QRGenerator({ title, description, initialData = "", onGenerate }: QRGeneratorProps) {
  const [qrData, setQrData] = useState(initialData)
  const [inputData, setInputData] = useState(initialData)

  const handleGenerate = () => {
    setQrData(inputData)
    onGenerate?.(inputData)
  }

  return (
    <Card className="w-full max-w-md bg-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-input">Data for QR Code</Label>
          <Textarea
            id="qr-input"
            placeholder="Enter data to encode in QR code"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <Button onClick={handleGenerate} className="w-full">
          Generate QR Code
        </Button>
        {qrData && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-lg border p-4 bg-background">
              <QRCode value={qrData} size={256} level="H" includeMargin={false} />
            </div>
            <p className="text-sm text-muted-foreground break-all text-center">
              Scan this QR code to access: <span className="font-mono">{qrData}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
