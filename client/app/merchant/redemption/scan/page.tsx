"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { verifyClaimCodeAPI } from "@/lib/api"

export default function RedeemScanPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [claimCode, setClaimCode] = useState("")
  const [userWalletAddress, setUserWalletAddress] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    redemption?: any
    error?: string
  } | null>(null)

  const handleVerifyClaim = async () => {
    if (!claimCode.trim() || !userWalletAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both claim code and wallet address.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const result = await verifyClaimCodeAPI(claimCode)
      
      if (result && result.isValid) {
        setVerificationResult({
          isValid: true,
          redemption: result.redemption
        })
        
        toast({
          title: "Claim Code Valid",
          description: "This claim code is valid and ready to be redeemed.",
        })
      } else {
        setVerificationResult({
          isValid: false,
          error: result?.error || "Invalid claim code"
        })
        
        toast({
          title: "Invalid Claim Code",
          description: "This claim code is invalid or has already been used.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Verification failed:", error)
      setVerificationResult({
        isValid: false,
        error: error.message || "Verification failed"
      })
      
      toast({
        title: "Verification Failed",
        description: "Failed to verify claim code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleConfirmRedeem = async () => {
    if (!verificationResult?.isValid) return

    try {
      // Here you would call the API to confirm the redemption
      // For now, we'll just show a success message
      toast({
        title: "Redemption Successful",
        description: "The reward has been successfully redeemed!",
      })
      
      // Reset form
      setClaimCode("")
      setUserWalletAddress("")
      setVerificationResult(null)
      
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Redeem Reward</CardTitle>
          <CardDescription className="text-center">
            Enter the claim code and customer wallet address to redeem a reward
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimCode">Claim Code</Label>
            <Input
              id="claimCode"
              placeholder="Enter claim code"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              disabled={isVerifying}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Customer Wallet Address</Label>
            <Input
              id="walletAddress"
              placeholder="0x..."
              value={userWalletAddress}
              onChange={(e) => setUserWalletAddress(e.target.value)}
              disabled={isVerifying}
            />
          </div>

          <Button 
            onClick={handleVerifyClaim} 
            disabled={isVerifying || !claimCode.trim() || !userWalletAddress.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Claim Code"
            )}
          </Button>

          {verificationResult && (
            <div className="mt-4 p-4 rounded-lg border">
              {verificationResult.isValid ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Claim code is valid!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>{verificationResult.error}</span>
                </div>
              )}
              
              {verificationResult.isValid && verificationResult.redemption && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm">
                    <strong>Reward:</strong> {verificationResult.redemption.rewardTitle}
                  </div>
                  <div className="text-sm">
                    <strong>Points Redeemed:</strong> {verificationResult.redemption.redeemedPoints}
                  </div>
                  <Button 
                    onClick={handleConfirmRedeem}
                    className="w-full mt-3"
                    variant="default"
                  >
                    Confirm Redemption
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 