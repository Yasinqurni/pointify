"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Users, Loader2, Award, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { fetchMerchantLoyaltyProgram } from "@/lib/api"
import { mockRewardUser } from "@/lib/ethers"
import { MockAddressScanner } from "@/components/mock-address-scanner" // Import the new scanner component

// Define a mock conversion rate: 1 USD = 1 LOYAL point
const LOYAL_POINTS_PER_USD = 1

const MerchantLoyalDashboardPage: React.FC = () => {
  const { walletAddress, userType, merchantLoyalBalance, setMerchantLoyalBalance, setTotalLoyalRewarded } =
    useWalletStore()
  const { toast } = useToast()

  const [loyaltyProgram, setLoyaltyProgram] = useState<any>(null)
  const [loadingLoyalty, setLoadingLoyalty] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [customerAddress, setCustomerAddress] = useState("")
  const [priceAmount, setPriceAmount] = useState("") // Changed from rewardAmount
  const [calculatedLoyalPoints, setCalculatedLoyalPoints] = useState(0) // New state for calculated points
  const [isRewarding, setIsRewarding] = useState(false)
  const [rewardSuccessMessage, setRewardSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadLoyaltyProgram = async () => {
      if (walletAddress && userType === "merchant") {
        setLoadingLoyalty(true)
        setError(null)
        try {
          const data = await fetchMerchantLoyaltyProgram(walletAddress)
          setLoyaltyProgram(data)
        } catch (err) {
          console.error("Failed to fetch loyalty program:", err)
          setError("Failed to load loyalty program. Please try again.")
        } finally {
          setLoadingLoyalty(false)
        }
      }
    }

    loadLoyaltyProgram()
  }, [walletAddress, userType])

  // Effect to calculate LOYAL points whenever priceAmount changes
  useEffect(() => {
    const amount = Number.parseFloat(priceAmount)
    if (!isNaN(amount) && amount > 0) {
      setCalculatedLoyalPoints(Math.floor(amount * LOYAL_POINTS_PER_USD))
    } else {
      setCalculatedLoyalPoints(0)
    }
  }, [priceAmount])

  const handleRewardCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress || userType !== "merchant") {
      toast({
        title: "Error",
        description: "Please connect your wallet as a merchant to reward customers.",
        variant: "destructive",
      })
      return
    }

    const amountToReward = calculatedLoyalPoints // Use calculated points
    if (!customerAddress || amountToReward <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid customer address and a positive price to reward.",
        variant: "destructive",
      })
      return
    }

    setIsRewarding(true)
    setRewardSuccessMessage(null)
    try {
      await mockRewardUser(walletAddress, customerAddress, amountToReward)

      // Update balances in store
      setMerchantLoyalBalance((prevBalance) => (prevBalance || 0) - amountToReward)
      setTotalLoyalRewarded((prevTotal) => (prevTotal || 0) + amountToReward)

      toast({
        title: "Customer Rewarded!",
        description: `${amountToReward} LOYAL points sent to ${customerAddress.slice(0, 6)}...${customerAddress.slice(-4)}.`,
      })
      setRewardSuccessMessage(`Successfully rewarded ${amountToReward} LOYAL points!`)
      setCustomerAddress("")
      setPriceAmount("")
      setTimeout(() => setRewardSuccessMessage(null), 3000) // Clear message after 3 seconds
    } catch (error: any) {
      console.error("Failed to reward customer:", error)
      toast({
        title: "Reward Failed",
        description: error.message || "Could not reward customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRewarding(false)
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
      <main className="flex flex-1 flex-col items-center p-4 md:p-8">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" /> Loyalty Dashboard
            </CardTitle>
            <CardDescription>Manage your loyalty program and reward your customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingLoyalty ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading loyalty program...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Loyal Customers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{loyaltyProgram?.loyalCustomers.length || 0}</div>
                      <p className="text-xs text-muted-foreground">Customers with LOYAL points</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total LOYAL Points Issued</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{loyaltyProgram?.totalLoyaltyPoints || "0"}</div>
                      <p className="text-xs text-muted-foreground">Across all your customers</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="h-5 w-5" /> Reward a Customer
                    </CardTitle>
                    <CardDescription>
                      Issue LOYAL points to a customer&apos;s wallet based on purchase price.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRewardCustomer} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-address">Customer Wallet Address</Label>
                        <MockAddressScanner onScan={setCustomerAddress} />
                        {customerAddress && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Selected Address:{" "}
                            <span className="font-mono">{`${customerAddress.slice(0, 6)}...${customerAddress.slice(-4)}`}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price-amount">Price (USD)</Label>
                        <Input
                          id="price-amount"
                          type="number"
                          placeholder="e.g., 10.50"
                          value={priceAmount}
                          onChange={(e) => setPriceAmount(e.target.value)}
                          required
                          min="0.01"
                          step="0.01"
                        />
                        <CardDescription className="text-sm">
                          This price will be converted to {LOYAL_POINTS_PER_USD} LOYAL point per USD.
                          <br />
                          Calculated LOYAL Points: <span className="font-semibold">{calculatedLoyalPoints}</span>
                        </CardDescription>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isRewarding || calculatedLoyalPoints <= 0 || !customerAddress}
                      >
                        {isRewarding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reward Customer
                      </Button>
                      <AnimatePresence>
                        {rewardSuccessMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 text-center text-green-600 font-medium"
                          >
                            {rewardSuccessMessage}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Your Loyal Customers</CardTitle>
                    <CardDescription>A list of customers with LOYAL points from your program.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loyaltyProgram?.loyalCustomers.length === 0 ? (
                      <p className="text-muted-foreground">No loyal customers yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 pr-4 font-semibold">Address</th>
                              <th className="py-2 pr-4 font-semibold">Name (Mock)</th>
                              <th className="py-2 font-semibold">Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loyaltyProgram?.loyalCustomers.map((customer: any) => (
                              <tr key={customer.address} className="border-b last:border-b-0">
                                <td className="py-2 pr-4 font-mono text-xs">
                                  {`${customer.address.slice(0, 6)}...${customer.address.slice(-4)}`}
                                </td>
                                <td className="py-2 pr-4">{customer.name}</td>
                                <td className="py-2 font-medium">{customer.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

export default MerchantLoyalDashboardPage
