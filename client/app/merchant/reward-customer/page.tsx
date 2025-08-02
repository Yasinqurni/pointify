"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Scan, CheckCircle, Sparkles, DollarSign, ArrowLeft, QrCode, Keyboard, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  mockGetUserLoyalBalance 
} from "@/lib/ethers"
import { getPltBalance, clearPltBalanceCache } from "@/lib/plt-swap-contract"
import { sendRewardToUser } from "@/lib/reward-contract"
import { getLoyaltySettings, type LoyaltySettings } from "@/lib/api"
import { useWalletStore } from "@/lib/store"
import { RealQRScanner } from "@/components/real-qr-scanner"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ethers } from "ethers"

export default function RewardCustomerPage() {
  console.log("🚀 RewardCustomerPage component rendering...")
  const { walletAddress, userType, merchantLoyalBalance, setMerchantLoyalBalance, setTotalLoyalRewarded } = useWalletStore()
  const { toast } = useToast()
  
  console.log("📊 Store state in RewardCustomerPage:")
  console.log("  - walletAddress:", walletAddress)
  console.log("  - userType:", userType)
  console.log("  - merchantLoyalBalance:", merchantLoyalBalance)

  const [scannedAddress, setScannedAddress] = useState<string | null>(null)
  const [priceAmount, setPriceAmount] = useState("")
  const [currency, setCurrency] = useState<"IDR">("IDR")
  const [calculatedLoyalPoints, setCalculatedLoyalPoints] = useState(0)
  const [rewardStatus, setRewardStatus] = useState<"idle" | "scanning" | "confirming" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [manualAddress, setManualAddress] = useState("")
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings | null>(null)
  const [pltBalance, setPltBalance] = useState<number>(0)
  const [loadingPltBalance, setLoadingPltBalance] = useState(true)
  const [approvalStep, setApprovalStep] = useState<"none" | "approving" | "approved">("none")

  // Load PLT balance
  const loadPltBalance = async () => {
    if (!walletAddress) return
    
    try {
      setLoadingPltBalance(true)
      // Clear cache to force fresh read
      clearPltBalanceCache(walletAddress)
      const balance = await getPltBalance(walletAddress)
      setPltBalance(balance)
      console.log('✅ RewardCustomerPage: PLT balance loaded:', balance)
    } catch (error) {
      console.error('❌ Failed to load PLT balance:', error)
      setPltBalance(0)
    } finally {
      setLoadingPltBalance(false)
    }
  }

  // Load loyalty settings
  useEffect(() => {
    const loadLoyaltySettings = async () => {
      try {
        const settings = await getLoyaltySettings()
        setLoyaltySettings(settings)
      } catch (error) {
        console.error("Failed to load loyalty settings:", error)
        toast({
          title: "Warning",
          description: "Failed to load loyalty settings. Using default values.",
          variant: "destructive",
        })
      }
    }

    if (userType === "merchant") {
      loadLoyaltySettings()
    }
  }, [userType, toast])

  // Load PLT balance
  useEffect(() => {
    if (walletAddress && userType === "merchant") {
      loadPltBalance()
    }
  }, [walletAddress, userType])

  useEffect(() => {
    const amount = Number.parseFloat(priceAmount)
    if (!isNaN(amount) && amount > 0 && loyaltySettings) {
      // Check minimum purchase requirement
      if (amount < loyaltySettings.minimumPurchase) {
        setCalculatedLoyalPoints(0)
        return
      }
      
      // Only IDR calculation
      const points = Math.floor(amount / loyaltySettings.pointsPerRupiah)
      setCalculatedLoyalPoints(points)
    } else {
      setCalculatedLoyalPoints(0)
    }
  }, [priceAmount, loyaltySettings])

  const handleScan = (data: string) => {
    setScannedAddress(data)
    setRewardStatus("idle") // Keep as idle, not confirming
    setErrorMessage(null)
    setShowScanner(false) // Close scanner after scan
  }

  const handleManualSubmit = () => {
    if (!manualAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address.",
        variant: "destructive",
      })
      return
    }

    setScannedAddress(manualAddress)
    setRewardStatus("idle") // Keep as idle, not confirming
    setErrorMessage(null)
    setShowManualDialog(false)
    setManualAddress("")
  }

  const handleConfirmReward = async () => {
    if (!walletAddress || userType !== "merchant") {
      toast({
        title: "Error",
        description: "Please connect your wallet as a merchant.",
        variant: "destructive",
      })
      return
    }

    if (!scannedAddress || calculatedLoyalPoints <= 0) {
      setErrorMessage("Please scan a customer address and enter a valid price.")
      setRewardStatus("error")
      return
    }

    // Check merchant balance before processing
    if (pltBalance < calculatedLoyalPoints) {
      setErrorMessage(`Insufficient PLT balance. You have ${pltBalance} PLT, but need ${calculatedLoyalPoints} PLT.`)
      setRewardStatus("error")
      toast({
        title: "Insufficient Balance",
        description: `You need ${calculatedLoyalPoints} PLT but only have ${pltBalance} PLT.`,
        variant: "destructive",
      })
      return
    }

    setRewardStatus("confirming") // Keep confirming state for loading
    setErrorMessage(null)
    setLoadingMessage("Processing reward transaction on blockchain...")
    setTransactionHash(null)
    setApprovalStep("none")

    try {
      // Get wallet signer for blockchain transaction
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask or another wallet.")
      }
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      // Process reward directly on blockchain
      setLoadingMessage("Checking PLT token approval...")
      
      const rewardResult = await sendRewardToUser(scannedAddress, calculatedLoyalPoints, signer)

      if (rewardResult.status === 'success') {
        // Refresh PLT balance after successful transaction
        await loadPltBalance()
        const currentTotalRewarded = useWalletStore.getState().totalLoyalRewarded || 0
        
        // Update store with blockchain data
        setMerchantLoyalBalance(pltBalance)
        setTotalLoyalRewarded(currentTotalRewarded + calculatedLoyalPoints)

        setTransactionHash(rewardResult.transactionHash || null)

        setRewardStatus("success")
        setLoadingMessage("")
        toast({
          title: "Reward Issued Successfully!",
          description: `${calculatedLoyalPoints} PLT points sent to ${scannedAddress.slice(0, 6)}...${scannedAddress.slice(-4)}. Transaction: ${rewardResult.transactionHash?.slice(0, 10)}...`,
        })
        
        // Reset form after a short delay to show success
        setTimeout(() => {
          handleReset()
        }, 2000)
      } else {
        const errorMessage = rewardResult.error || 'Reward failed'
        
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error("Failed to reward customer:", error)
      setErrorMessage(error.message || "Could not issue reward. Please try again.")
      setRewardStatus("error")
      setLoadingMessage("")
      toast({
        title: "Reward Failed",
        description: error.message || "Could not issue reward. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setScannedAddress(null)
    setPriceAmount("")
    setCalculatedLoyalPoints(0)
    setRewardStatus("idle")
    setErrorMessage(null)
    setShowScanner(false)
    setTransactionHash(null)
    setApprovalStep("none")
  }

  const handleScannerClose = () => {
    console.log('🔴 MODAL: Starting camera cleanup...')
    
    // STEP 1: Force immediate global camera cleanup
    const videoElements = document.querySelectorAll('video')
    videoElements.forEach((video, index) => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          console.log(`🔴 MODAL: Force stopping track ${track.kind} on video ${index}`)
          track.stop()
        })
        video.pause()
        video.srcObject = null
        video.src = ""
        if (typeof video.load === 'function') {
          video.load()
        }
      }
    })
    
    // STEP 2: Multiple safety checks with increasing delays
    setTimeout(() => {
      console.log('🔴 MODAL: Safety check 1...')
      document.querySelectorAll('video').forEach((video, index) => {
        if (video.srcObject) {
          console.log(`🚨 MODAL: Found lingering stream on video ${index}!`)
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
          video.srcObject = null
        }
      })
    }, 200)
    
    // STEP 3: Final check and unmount
    setTimeout(() => {
      console.log('🔴 MODAL: Final safety check before unmount...')
      
      // Last chance cleanup
      document.querySelectorAll('video').forEach(video => {
        if (video.srcObject) {
          console.log('🚨 MODAL CRITICAL: Forcing final cleanup!')
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
          video.srcObject = null
        }
      })
      
      console.log('✅ MODAL: Camera cleanup completed, unmounting...')
      setShowScanner(false)
    }, 500)
  }

  if (!walletAddress || userType !== "merchant") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 min-h-screen">
        <Card className="w-full max-w-md text-center bg-card shadow-lg glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please connect your wallet as a merchant to access this page.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Main view - show two buttons (only when no address is set)
  if (rewardStatus === "idle" && !scannedAddress) {
    return (
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-16 md:pt-32 min-h-screen">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10" onClick={() => window.history.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6" /> Reward Customer
            </CardTitle>
            <CardDescription>Choose how you want to get the customer's wallet address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button 
                onClick={() => setShowManualDialog(true)} 
                className="w-full h-16 text-lg"
                variant="outline"
              >
                <Keyboard className="h-5 w-5 mr-2" />
                Enter Address Manually
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
                  <DialogTitle>Enter Customer Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter wallet address..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleManualSubmit} className="flex-1">
                      Confirm Address
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

  // Reward form view (when address is set)
  if (scannedAddress) {
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
              <Sparkles className="h-6 w-6" /> Issue PLT Points
            </CardTitle>
            <CardDescription>
              Issue PLT points to the scanned customer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Customer Address Found!</h4>
                <p className="text-sm text-blue-600 mt-1">
                  Address: {scannedAddress.slice(0, 6)}...{scannedAddress.slice(-4)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={currency === "IDR" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrency("IDR")}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      IDR
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="price-amount">Purchase Amount (IDR)</Label>
                  <Input
                    id="price-amount"
                    type="number"
                    placeholder="e.g., 50000"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum purchase: {loyaltySettings?.minimumPurchase.toLocaleString() || '0'} IDR
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Calculated Points:</h4>
                  <div className="text-2xl font-bold text-primary">{calculatedLoyalPoints} PLT</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rate: 1 point per {loyaltySettings?.pointsPerRupiah.toLocaleString() || '10,000'} IDR
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Your Balance</h4>
                  {loadingPltBalance ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading balance...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-yellow-700">{pltBalance} PLT</div>
                      <p className="text-sm text-yellow-600 mt-1">
                        {calculatedLoyalPoints > pltBalance 
                          ? "⚠️ Insufficient balance for this reward" 
                          : "✅ Sufficient balance available"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={handleConfirmReward}
                className="w-full h-12"
                disabled={rewardStatus === "confirming" || calculatedLoyalPoints <= 0 || calculatedLoyalPoints > pltBalance || loadingPltBalance}
              >
                {rewardStatus === "confirming" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {rewardStatus === "confirming" ? loadingMessage : "Confirm & Issue"}
              </Button>

              {rewardStatus === "confirming" && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                  disabled={true}
                >
                  Cancel Transaction
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Success state
  if (rewardStatus === "success") {
    return (
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Reward Issued Successfully!</h3>
            <p className="text-muted-foreground text-center mb-4">
              {calculatedLoyalPoints} PLT points have been sent to the customer.
            </p>
            {transactionHash && (
              <div className="bg-green-50 p-3 rounded-lg w-full">
                <p className="text-sm font-medium text-green-800">Transaction Hash:</p>
                <p className="text-xs font-mono text-green-600 break-all">{transactionHash}</p>
              </div>
            )}
            <Button onClick={handleReset} className="w-full mt-4">
              Issue Another Reward
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Error state
  if (rewardStatus === "error") {
    return (
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Reward Failed</h3>
            <p className="text-muted-foreground text-center mb-6">
              {errorMessage || "An error occurred while issuing the reward."}
            </p>
            <Button onClick={handleReset} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return null
}
