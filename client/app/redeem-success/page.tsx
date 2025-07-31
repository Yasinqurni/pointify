"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, QrCode } from "lucide-react"
import { useEffect, useState } from "react"
import QRCode from "qrcode.react"

export default function RedeemSuccessPage() {
  const searchParams = useSearchParams()
  const rewardTitle = searchParams.get("rewardTitle") || "Your Reward"
  const merchantName = searchParams.get("merchantName") || "A Merchant"
  const redeemedPoints = searchParams.get("redeemedPoints") || "0"
  const claimCode = searchParams.get("claimCode") || "N/A"

  const [qrData, setQrData] = useState("")

  useEffect(() => {
    // Encode the claim code into the QR data
    setQrData(claimCode)
  }, [claimCode])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50 p-4 text-foreground">
      <Card className="w-full max-w-md text-center shadow-lg bg-card">
        <CardHeader className="space-y-2">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="text-3xl font-bold">Redemption Successful!</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Congratulations! You&apos;ve successfully redeemed your reward.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-lg font-semibold">{rewardTitle}</p>
            <p className="text-sm text-muted-foreground">from {merchantName}</p>
            <p className="text-sm text-muted-foreground">
              Points Used: <span className="font-semibold">{redeemedPoints} LOYAL</span>
            </p>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted p-4">
            <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
              <QrCode className="h-6 w-6" /> Your Claim Code
            </h3>
            <p className="text-2xl font-bold text-primary break-all">{claimCode}</p>
            {qrData && (
              <div className="flex justify-center p-2 bg-background rounded-md">
                <QRCode value={qrData} size={200} level="H" includeMargin={false} />
              </div>
            )}
            <p className="text-sm text-muted-foreground">Present this code to the merchant to claim your reward.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/user-dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/redemption-history">View Redemption History</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
