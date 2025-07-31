"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { mockGetMerchantIDRXBalance, mockTopUpLoyal } from "@/lib/ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowUpCircle, ArrowLeft } from "lucide-react"
import { TopUpConfirmationModal } from "@/components/top-up-confirmation-modal"

export default function TopUpLoyalPage() {
  const { walletAddress, userType, merchantIDRXBalance, setMerchantIDRXBalance, setMerchantLoyalBalance } =
    useWalletStore()
  const { toast } = useToast()

  const [topUpAmount, setTopUpAmount] = useState("")
  const [loadingIDRX, setLoadingIDRX] = useState(true)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [isToppingUp, setIsToppingUp] = useState(false)

  useEffect(() => {
    const loadIDRXBalance = async () => {
      if (walletAddress && userType === "merchant") {
        setLoadingIDRX(true)
        try {
          const balance = await mockGetMerchantIDRXBalance(walletAddress)
          setMerchantIDRXBalance(balance)
        } catch (error) {
          console.error("Failed to fetch IDRX balance:", error)
          setMerchantIDRXBalance(0)
          toast({
            title: "Error",
            description: "Failed to load IDRX balance. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoadingIDRX(false)
        }
      }
    }

    loadIDRXBalance()
  }, [walletAddress, userType, setMerchantIDRXBalance, toast])

  const handleTopUpClick = () => {
    const amount = Number.parseFloat(topUpAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount to top up.",
        variant: "destructive",
      })
      return
    }
    if (merchantIDRXBalance === null || amount > merchantIDRXBalance) {
      toast({
        title: "Insufficient IDRX",
        description: "You do not have enough IDRX to complete this top-up.",
        variant: "destructive",
      })
      return
    }
    setIsTopUpModalOpen(true)
  }

  const handleConfirmTopUp = async () => {
    if (!walletAddress) return

    setIsToppingUp(true)
    try {
      const amount = Number.parseFloat(topUpAmount)
      await mockTopUpLoyal(walletAddress, amount)

      // Update balances in store
      setMerchantIDRXBalance((merchantIDRXBalance || 0) - amount)
      setMerchantLoyalBalance((prevLoyalBalance) => (prevLoyalBalance || 0) + amount)

      toast({
        title: "Top-Up Successful!",
        description: `${amount} LOYAL tokens have been added to your balance.`,
      })
      setTopUpAmount("") // Clear input
    } catch (error: any) {
      console.error("Failed to top up LOYAL:", error)
      toast({
        title: "Top-Up Failed",
        description: error.message || "Could not top up LOYAL. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsToppingUp(false)
      setIsTopUpModalOpen(false)
    }
  }

  if (!walletAddress || userType !== "merchant") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please connect your wallet as a merchant to access this page.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <>
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10" onClick={() => window.history.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ArrowUpCircle className="h-6 w-6" /> Top Up LOYAL
            </CardTitle>
            <CardDescription>Convert your IDRX tokens into LOYAL tokens for your loyalty program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-md bg-muted p-4">
              <span className="text-lg font-medium">Your IDRX Balance:</span>
              {loadingIDRX ? (
                <div className="h-6 w-20 animate-pulse rounded-md bg-gray-200" />
              ) : (
                <span className="text-2xl font-bold text-primary">{merchantIDRXBalance?.toFixed(2) || "0.00"}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-up-amount">Amount to Top Up (IDRX)</Label>
              <Input
                id="top-up-amount"
                type="number"
                placeholder="e.g., 100"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
              <CardDescription className="text-sm">
                This amount of IDRX will be converted to LOYAL tokens.
              </CardDescription>
            </div>
            <Button onClick={handleTopUpClick} className="w-full" disabled={isToppingUp || loadingIDRX}>
              {isToppingUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed to Top Up
            </Button>
          </CardContent>
        </Card>

        <TopUpConfirmationModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          onConfirm={handleConfirmTopUp}
          amount={Number.parseFloat(topUpAmount) || 0}
          isLoading={isToppingUp}
        />
      </main>
    </>
  )
}
