"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Scan, CheckCircle, Sparkles, DollarSign, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mockRewardUser } from "@/lib/ethers"
import { useWalletStore } from "@/lib/store"
import { RealQRScanner } from "@/components/real-qr-scanner"
import { motion, AnimatePresence } from "framer-motion"

// Mock loyalty rules - in real app this would come from the loyalty settings
const LOYALTY_RULES = {
  pointsPerDollar: 1,
  pointsPerRupiah: 10000,
  minimumPurchase: 5,
  autoCalculate: true
}

export default function RewardCustomerPage() {
  const { walletAddress, userType, setMerchantLoyalBalance, setTotalLoyalRewarded } = useWalletStore()
  const { toast } = useToast()

  const [scannedAddress, setScannedAddress] = useState<string | null>(null)
  const [priceAmount, setPriceAmount] = useState("")
  const [currency, setCurrency] = useState<"USD" | "IDR">("USD")
  const [calculatedLoyalPoints, setCalculatedLoyalPoints] = useState(0)
  const [rewardStatus, setRewardStatus] = useState<"idle" | "scanning" | "confirming" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const amount = Number.parseFloat(priceAmount)
    if (!isNaN(amount) && amount > 0) {
      let points = 0
      if (currency === "USD") {
        points = Math.floor(amount * LOYALTY_RULES.pointsPerDollar)
      } else {
        points = Math.floor(amount / LOYALTY_RULES.pointsPerRupiah)
      }
      setCalculatedLoyalPoints(points)
    } else {
      setCalculatedLoyalPoints(0)
    }
  }, [priceAmount, currency])

  const handleScan = (data: string) => {
    setScannedAddress(data)
    setRewardStatus("confirming")
    setErrorMessage(null)
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

    setRewardStatus("confirming") // Keep confirming state for loading
    setErrorMessage(null)

    try {
      await mockRewardUser(walletAddress, scannedAddress, calculatedLoyalPoints)

      // Update balances in store
      setMerchantLoyalBalance((prevBalance) => (prevBalance || 0) - calculatedLoyalPoints)
      setTotalLoyalRewarded((prevTotal) => (prevTotal || 0) + calculatedLoyalPoints)

      setRewardStatus("success")
      toast({
        title: "Reward Issued!",
        description: `${calculatedLoyalPoints} LOYAL points sent to ${scannedAddress.slice(0, 6)}...${scannedAddress.slice(-4)}.`,
      })
      // Reset form after success
      setTimeout(() => handleReset(), 2000) // Reset after success animation
    } catch (error: any) {
      console.error("Failed to reward customer:", error)
      setErrorMessage(error.message || "Could not issue reward. Please try again.")
      setRewardStatus("error")
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
  }

  if (!walletAddress || userType !== "merchant") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
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
            <Sparkles className="h-6 w-6" /> Reward Customer
          </CardTitle>
          <CardDescription>Scan a customer&apos;s wallet to issue LOYAL points.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {rewardStatus === "idle" && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >

                <RealQRScanner onScan={handleScan} onClose={handleReset} />
              </motion.div>
            )}

            {(rewardStatus === "confirming" || rewardStatus === "error") && scannedAddress && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Customer Scanned!</h3>
                  <p className="text-muted-foreground">
                    Address:{" "}
                    <span className="font-mono">{`${scannedAddress.slice(0, 6)}...${scannedAddress.slice(-4)}`}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={currency === "USD" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrency("USD")}
                      className="flex-1"
                    >
                      USD
                    </Button>
                    <Button
                      variant={currency === "IDR" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrency("IDR")}
                      className="flex-1"
                    >
                      IDR
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price-amount">Purchase Amount ({currency})</Label>
                    <Input
                      id="price-amount"
                      type="number"
                      placeholder={currency === "USD" ? "e.g., 10.50" : "e.g., 150000"}
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      required
                      min={LOYALTY_RULES.minimumPurchase}
                      step={currency === "USD" ? "0.01" : "1000"}
                      className="bg-background/50 backdrop-blur-sm"
                    />
                    {Number.parseFloat(priceAmount) < LOYALTY_RULES.minimumPurchase && priceAmount && (
                      <p className="text-sm text-orange-600">
                        Minimum purchase: {LOYALTY_RULES.minimumPurchase} {currency}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Calculated Points:</span>
                      <span className="text-2xl font-bold text-primary">{calculatedLoyalPoints} LOYAL</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Rate: {currency === "USD" ? `${LOYALTY_RULES.pointsPerDollar} point per $1` : `${LOYALTY_RULES.pointsPerRupiah.toLocaleString()} IDR per point`}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleConfirmReward}
                  className="w-full"
                  disabled={calculatedLoyalPoints <= 0 || rewardStatus === "confirming"}
                >
                  {rewardStatus === "confirming" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm & Issue
                </Button>
                {errorMessage && <p className="text-destructive text-center text-sm">{errorMessage}</p>}
                <Button variant="outline" onClick={handleReset} className="w-full bg-transparent">
                  Cancel
                </Button>
              </motion.div>
            )}

            {rewardStatus === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 text-center"
              >
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="text-xl font-semibold">Points Issued Successfully!</h3>
                <p className="text-muted-foreground">
                  {calculatedLoyalPoints} LOYAL points sent to{" "}
                  {`${scannedAddress?.slice(0, 6)}...${scannedAddress?.slice(-4)}`}.
                </p>
                <motion.div
                  className="mx-auto h-12 w-12 rounded-full bg-yellow-400 flex items-center justify-center"
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 1, repeat: 1, ease: "linear" }}
                >
                  <span className="text-2xl">🪙</span> {/* LOYAL coin icon */}
                </motion.div>
                <Button onClick={handleReset} className="w-full">
                  Issue Another Reward
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </main>
  )
}
