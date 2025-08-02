"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, QrCode, Scan, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { verifyClaimCode, confirmClaim, type Redemption } from "@/lib/api"

// Mock QR scanner component (replace with a real one like react-qr-reader)
const MockQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const [mockInput, setMockInput] = useState("")
  const { toast } = useToast()

  const handleMockScan = () => {
    if (mockInput.trim()) {
      onScan(mockInput.trim())
      setMockInput("")
    } else {
      toast({
        title: "Error",
        description: "Please enter a mock QR code value.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center h-48 w-full rounded-md border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600">
        <Scan className="h-12 w-12" />
        <span className="ml-2 text-lg">Simulated QR Scanner</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mock-qr-input">Enter Claim Code Manually (for demo)</Label>
        <Input
          id="mock-qr-input"
          placeholder="e.g., COFFEE-ABC123"
          value={mockInput}
          onChange={(e) => setMockInput(e.target.value)}
        />
      </div>
      <Button onClick={handleMockScan} className="w-full">
        Simulate Scan
      </Button>
    </div>
  )
}

export default function ScanQRPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [redemptionDetails, setRedemptionDetails] = useState<Redemption | null>(null)
  const [loading, setLoading] = useState(false)
  const [claimStatus, setClaimStatus] = useState<"idle" | "verifying" | "verified" | "invalid" | "claiming">("idle")
  const { toast } = useToast()

  const handleScan = async (data: string) => {
    setScannedCode(data)
    setClaimStatus("verifying")
    setLoading(true)
    setRedemptionDetails(null)

    try {
      const redemption = await verifyClaimCode(data)
      if (redemption) {
        setRedemptionDetails(redemption)
        setClaimStatus("verified")
        toast({
          title: "Claim Code Verified!",
          description: `Reward: ${redemption.rewardTitle} for User: ${redemption.userId.slice(0, 6)}...${redemption.userId.slice(-4)}.`,
        })
      } else {
        setClaimStatus("invalid")
        toast({
          title: "Invalid Claim Code",
          description: "The scanned code is not valid or has already been claimed.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying claim code:", error)
      setClaimStatus("invalid")
      toast({
        title: "Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmClaim = async () => {
    if (!redemptionDetails) return

    setClaimStatus("claiming")
    setLoading(true)
    try {
      await confirmClaim(redemptionDetails.id)
      toast({
        title: "Reward Claimed!",
        description: `${redemptionDetails.rewardTitle} has been successfully claimed.`,
      })
      // Reset state after successful claim
      setScannedCode(null)
      setRedemptionDetails(null)
      setClaimStatus("idle")
    } catch (error) {
      console.error("Error confirming claim:", error)
      toast({
        title: "Claim Failed",
        description: "Failed to confirm claim. Please try again.",
        variant: "destructive",
      })
      setClaimStatus("verified") // Go back to verified state if claim fails
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setScannedCode(null)
    setRedemptionDetails(null)
    setClaimStatus("idle")
    setLoading(false)
  }

  return (
    <>
      <main className="flex flex-1 flex-col items-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <QrCode className="h-6 w-6" /> Scan QR Code
            </CardTitle>
            <CardDescription>Scan a customer&apos;s claim code to verify and redeem a reward.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {claimStatus === "idle" && <MockQRScanner onScan={handleScan} />}

            {(claimStatus === "verifying" || loading) && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Verifying claim code...</p>
              </div>
            )}

            {claimStatus === "verified" && redemptionDetails && (
              <div className="space-y-4 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="text-xl font-semibold">Claim Code Valid!</h3>
                <p className="text-muted-foreground">Reward Details:</p>
                <div className="rounded-md border p-4 text-left">
                  <p>
                    <span className="font-medium">Reward:</span> {redemptionDetails.rewardTitle}
                  </p>
                  <p>
                    <span className="font-medium">User:</span>{" "}
                    {`${redemptionDetails.userId.slice(0, 6)}...${redemptionDetails.userId.slice(-4)}`}
                  </p>
                  <p>
                    <span className="font-medium">Points:</span> {redemptionDetails.redeemedPoints} LOYAL
                  </p>
                  <p>
                    <span className="font-medium">Claim Code:</span>{" "}
                    <span className="font-mono">{redemptionDetails.claimCode}</span>
                  </p>
                </div>
                <Button onClick={handleConfirmClaim} className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Claim
                </Button>
                <Button variant="outline" onClick={handleReset} className="w-full bg-transparent">
                  Scan Another
                </Button>
              </div>
            )}

            {claimStatus === "invalid" && (
              <div className="space-y-4 text-center">
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <h3 className="text-xl font-semibold">Invalid or Used Code</h3>
                <p className="text-muted-foreground">
                  The claim code &quot;{scannedCode}&quot; is not valid or has already been claimed.
                </p>
                <Button onClick={handleReset} className="w-full">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
