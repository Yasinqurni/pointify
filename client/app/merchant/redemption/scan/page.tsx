"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, QrCode, Keyboard, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWalletStore } from "@/lib/store"
import { 
  verifyClaimCodeOnChain, 
  processRedemptionOnChain,
  checkUserBalanceForRedemption 
} from "@/lib/ethers"
import { verifyClaimCodeAPI } from "@/lib/api"
import { RealQRScanner } from "@/components/real-qr-scanner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ScanQRPage() {
  const { walletAddress } = useWalletStore()
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [redemptionDetails, setRedemptionDetails] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [claimStatus, setClaimStatus] = useState<"idle" | "verifying" | "verified" | "invalid" | "claiming">("idle")
  const [showScanner, setShowScanner] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [showManualDialog, setShowManualDialog] = useState(false)
  const { toast } = useToast()

  const handleScan = async (data: string) => {
    setScannedCode(data)
    setClaimStatus("verifying")
    setLoading(true)
    setRedemptionDetails(null)
    setShowScanner(false) // Close scanner after scan

    try {
      // Step 1: Verify claim code via API first
      console.log("Step 1: Verifying claim code via API...")
      const apiRedemption = await verifyClaimCodeAPI(data)
      
      if (!apiRedemption) {
        setClaimStatus("invalid")
        toast({
          title: "Invalid Claim Code",
          description: "The scanned code is not valid or has already been claimed.",
          variant: "destructive",
        })
        return
      }

      // Step 2: Verify on blockchain for additional validation
      console.log("Step 2: Verifying on blockchain...")
      const blockchainRedemption = await verifyClaimCodeOnChain(data)
      
      if (!blockchainRedemption) {
        setClaimStatus("invalid")
        toast({
          title: "Invalid Claim Code",
          description: "Claim code verification failed on blockchain.",
          variant: "destructive",
        })
        return
      }

      // Step 3: Check if user has sufficient balance
      console.log("Step 3: Checking user balance...")
      const hasBalance = await checkUserBalanceForRedemption(blockchainRedemption.userId, blockchainRedemption.redeemedPoints)
      
      if (!hasBalance) {
        setClaimStatus("invalid")
        toast({
          title: "Insufficient Balance",
          description: "User does not have enough LOYAL points for this redemption.",
          variant: "destructive",
        })
        return
      }

      // Combine API and blockchain data
      const combinedRedemption = {
        ...apiRedemption,
        ...blockchainRedemption,
        verifiedByAPI: true,
        verifiedByBlockchain: true
      }

      setRedemptionDetails(combinedRedemption)
      setClaimStatus("verified")
      toast({
        title: "Claim Code Verified!",
        description: `Reward: ${combinedRedemption.rewardTitle} for User: ${combinedRedemption.userId.slice(0, 6)}...${combinedRedemption.userId.slice(-4)}.`,
      })
    } catch (error: any) {
      console.error("Error verifying claim code:", error)
      setClaimStatus("invalid")
      toast({
        title: "Verification Failed",
        description: error.message || "An error occurred during verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid claim code.",
        variant: "destructive",
      })
      return
    }

    setScannedCode(manualCode)
    setClaimStatus("verifying")
    setLoading(true)
    setRedemptionDetails(null)
    setShowManualDialog(false)
    setManualCode("")

    try {
      // Step 1: Verify claim code via API first
      console.log("Step 1: Verifying claim code via API...")
      const apiRedemption = await verifyClaimCodeAPI(manualCode)
      
      if (!apiRedemption) {
        setClaimStatus("invalid")
        toast({
          title: "Invalid Claim Code",
          description: "The entered code is not valid or has already been claimed.",
          variant: "destructive",
        })
        return
      }

      // Step 2: Verify on blockchain for additional validation
      console.log("Step 2: Verifying on blockchain...")
      const blockchainRedemption = await verifyClaimCodeOnChain(manualCode)
      
      if (!blockchainRedemption) {
        setClaimStatus("invalid")
        toast({
          title: "Invalid Claim Code",
          description: "Claim code verification failed on blockchain.",
          variant: "destructive",
        })
        return
      }

      // Step 3: Check if user has sufficient balance
      console.log("Step 3: Checking user balance...")
      const hasBalance = await checkUserBalanceForRedemption(blockchainRedemption.userId, blockchainRedemption.redeemedPoints)
      
      if (!hasBalance) {
        setClaimStatus("invalid")
        toast({
          title: "Insufficient Balance",
          description: "User does not have enough LOYAL points for this redemption.",
          variant: "destructive",
        })
        return
      }

      // Combine API and blockchain data
      const combinedRedemption = {
        ...apiRedemption,
        ...blockchainRedemption,
        verifiedByAPI: true,
        verifiedByBlockchain: true
      }

      setRedemptionDetails(combinedRedemption)
      setClaimStatus("verified")
      toast({
        title: "Claim Code Verified!",
        description: `Reward: ${combinedRedemption.rewardTitle} for User: ${combinedRedemption.userId.slice(0, 6)}...${combinedRedemption.userId.slice(-4)}.`,
      })
    } catch (error: any) {
      console.error("Error verifying claim code:", error)
      setClaimStatus("invalid")
      toast({
        title: "Verification Failed",
        description: error.message || "An error occurred during verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmClaim = async () => {
    if (!redemptionDetails || !walletAddress) return

    setClaimStatus("claiming")
    setLoading(true)
    try {
      // Process redemption directly on blockchain
      console.log("Processing redemption on blockchain...")
      const result = await processRedemptionOnChain(redemptionDetails.claimCode, walletAddress)
      
      if (result.success) {
        toast({
          title: "Reward Claimed Successfully!",
          description: `${redemptionDetails.rewardTitle} has been successfully claimed. Transaction: ${result.transactionHash.slice(0, 10)}...`,
        })
        // Reset state after successful claim
        setScannedCode(null)
        setRedemptionDetails(null)
        setClaimStatus("idle")
      } else {
        throw new Error("Redemption processing failed")
      }
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
    setShowScanner(false)
  }

  const handleScannerClose = () => {
    setShowScanner(false)
    // Ensure camera is stopped when scanner is closed
    setTimeout(() => {
      setShowScanner(false)
    }, 100)
  }

  // Main view - show two buttons
  if (claimStatus === "idle") {
    return (
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10" onClick={() => window.history.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <QrCode className="h-6 w-6" /> Verify Claim Code
            </CardTitle>
            <CardDescription>Choose how you want to verify the claim code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button 
                onClick={() => setShowManualDialog(true)} 
                className="w-full h-16 text-lg"
                variant="outline"
              >
                <Keyboard className="h-5 w-5 mr-2" />
                Enter Code Manually
              </Button>
              
              <Button 
                onClick={() => setShowScanner(true)} 
                className="w-full h-16 text-lg"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan QR Code
              </Button>
            </div>

            {/* Manual Input Dialog */}
            <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Claim Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter claim code..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleManualSubmit} className="flex-1">
                      Verify Code
                    </Button>
                    <Button variant="outline" onClick={() => setShowManualDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* QR Scanner Modal */}
            {showScanner && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Scan QR Code</h3>
                    <Button variant="ghost" size="sm" onClick={handleScannerClose}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <RealQRScanner onScan={handleScan} onClose={handleScannerClose} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    )
  }

  // Loading state
  if (loading) {
    return (
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              {claimStatus === "verifying" ? "Verifying claim code..." : "Processing redemption..."}
            </p>
            {claimStatus === "verifying" && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>Step 1: API Verification</p>
                <p>Step 2: Blockchain Verification</p>
                <p>Step 3: Balance Check</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    )
  }

  // Invalid code state
  if (claimStatus === "invalid") {
    return (
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Invalid Claim Code</h3>
            <p className="text-muted-foreground text-center mb-6">
              The claim code is not valid or has already been used.
            </p>
            <Button onClick={handleReset} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Verified code state
  if (claimStatus === "verified" && redemptionDetails) {
    return (
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10" onClick={handleReset}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="h-6 w-6 text-green-500" /> Claim Verified
            </CardTitle>
            <CardDescription>Review the redemption details before confirming.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">{redemptionDetails.rewardTitle}</h4>
                <p className="text-sm text-green-600 mt-1">
                  {redemptionDetails.redeemedPoints} LOYAL points required
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Address:</span>
                  <span className="font-mono text-sm">
                    {redemptionDetails.userId.slice(0, 6)}...{redemptionDetails.userId.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant:</span>
                  <span className="font-medium">{redemptionDetails.merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Required:</span>
                  <span className="font-medium">{redemptionDetails.redeemedPoints} LOYAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-sm">{redemptionDetails.redeemedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification:</span>
                  <span className="text-sm text-green-600">✅ API + Blockchain</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleConfirmClaim}
                className="w-full h-12"
                disabled={claimStatus === "claiming"}
              >
                {claimStatus === "claiming" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Process Redemption
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full"
                disabled={claimStatus === "claiming"}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return null
} 