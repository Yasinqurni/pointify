"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Users, Loader2, Award, Sparkles, Wallet, Coins, TrendingUp } from "lucide-react"
import { mockRewardUser, mockGetMerchantIDRXBalance } from "@/lib/ethers"
import { MockAddressScanner } from "@/components/mock-address-scanner"
import { 
  fetchMerchantDashboardData, 
  fetchMerchantLoyaltyProgram,
  fetchMerchantData 
} from "@/lib/api"

// Define a mock conversion rate: 1 USD = 1 LOYAL point
const LOYAL_POINTS_PER_USD = 1

interface MerchantDashboardData {
  totalCustomers: number
  totalPointsIssued: number
  totalRewards: number
  recentTransactions: any[]
}

interface MerchantData {
  id: string
  name: string
  description?: string
  logoUrl?: string
  walletAddress: string
  createdAt: string
}

const MerchantLoyalDashboardPage: React.FC = () => {
  const { 
    walletAddress, 
    userType, 
    merchantLoyalBalance, 
    merchantIDRXBalance,
    totalLoyalRewarded,
    setMerchantLoyalBalance, 
    setMerchantIDRXBalance,
    setTotalLoyalRewarded 
  } = useWalletStore()
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<MerchantDashboardData | null>(null)
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null)
  const [loyaltyProgram, setLoyaltyProgram] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [customerAddress, setCustomerAddress] = useState("")
  const [priceAmount, setPriceAmount] = useState("")
  const [calculatedLoyalPoints, setCalculatedLoyalPoints] = useState(0)
  const [isRewarding, setIsRewarding] = useState(false)
  const [rewardSuccessMessage, setRewardSuccessMessage] = useState<string | null>(null)

  // Effect to calculate LOYAL points whenever priceAmount changes
  useEffect(() => {
    const amount = Number.parseFloat(priceAmount)
    if (!isNaN(amount) && amount > 0) {
      setCalculatedLoyalPoints(Math.floor(amount * LOYAL_POINTS_PER_USD))
    } else {
      setCalculatedLoyalPoints(0)
    }
  }, [priceAmount])

  // Load merchant data and dashboard data
  useEffect(() => {
    const loadMerchantData = async () => {
      if (!walletAddress || userType !== "merchant") return

      setLoading(true)
      setError(null)

      try {
        // Load merchant profile data
        const merchant = await fetchMerchantData(walletAddress) as MerchantData
        setMerchantData(merchant)

        // Load dashboard statistics
        const dashboard = await fetchMerchantDashboardData(walletAddress) as MerchantDashboardData
        setDashboardData(dashboard)

        // Load loyalty program data
        const loyalty = await fetchMerchantLoyaltyProgram(walletAddress)
        setLoyaltyProgram(loyalty)

        // Load blockchain balances
        const idrxBalance = await mockGetMerchantIDRXBalance(walletAddress)
        setMerchantIDRXBalance(idrxBalance)

      } catch (error: any) {
        console.error("Failed to load merchant data:", error)
        setError("Failed to load merchant data. Please refresh the page.")
        toast({
          title: "Error",
          description: "Failed to load merchant data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMerchantData()
  }, [walletAddress, userType])

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

    const amountToReward = calculatedLoyalPoints
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
      const currentMerchantBalance = useWalletStore.getState().merchantLoyalBalance || 0
      const currentTotalRewarded = useWalletStore.getState().totalLoyalRewarded || 0
      
      setMerchantLoyalBalance(currentMerchantBalance - amountToReward)
      setTotalLoyalRewarded(currentTotalRewarded + amountToReward)

      toast({
        title: "Customer Rewarded!",
        description: `${amountToReward} LOYAL points sent to ${customerAddress.slice(0, 6)}...${customerAddress.slice(-4)}.`,
      })
      setRewardSuccessMessage(`Successfully rewarded ${amountToReward} LOYAL points!`)
      setCustomerAddress("")
      setPriceAmount("")
      setRewardSuccessMessage(null)
    } catch (error: any) {
      console.error("Failed to reward customer:", error)
      toast({
        title: "Reward Failed",
        description: error.message || "Failed to reward customer. Please try again.",
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
        <Card className="w-full max-w-6xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" /> Merchant Dashboard
            </CardTitle>
            <CardDescription>
              {merchantData ? `${merchantData.name} - ${merchantData.description || 'No description'}` : 'Loading merchant details...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading merchant data...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <>
                {/* Merchant Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Wallet className="h-5 w-5" /> Merchant Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Business Name</Label>
                        <p className="text-lg font-semibold">{merchantData?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Wallet Address</Label>
                        <p className="text-sm font-mono">{walletAddress}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm">{merchantData?.description || 'No description provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Registered Since</Label>
                        <p className="text-sm">{merchantData?.createdAt ? new Date(merchantData.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Blockchain Balances Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Coins className="h-5 w-5" /> Blockchain Balances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{merchantLoyalBalance || 0}</div>
                        <p className="text-sm text-muted-foreground">LOYAL Balance</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{merchantIDRXBalance || 0}</div>
                        <p className="text-sm text-muted-foreground">IDRX Balance</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{totalLoyalRewarded || 0}</div>
                        <p className="text-sm text-muted-foreground">Total Rewarded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dashboard Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData?.totalCustomers || 0}</div>
                      <p className="text-xs text-muted-foreground">Active customers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Points Issued</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData?.totalPointsIssued || 0}</div>
                      <p className="text-xs text-muted-foreground">LOYAL points distributed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData?.totalRewards || 0}</div>
                      <p className="text-xs text-muted-foreground">Available rewards</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Reward Customer Form */}
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
                      {rewardSuccessMessage && (
                        <div className="mt-4 text-center text-green-600 font-medium">
                          {rewardSuccessMessage}
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Recent Transactions</CardTitle>
                      <CardDescription>Latest customer interactions and rewards.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 pr-4 font-semibold">Customer</th>
                              <th className="py-2 pr-4 font-semibold">Type</th>
                              <th className="py-2 pr-4 font-semibold">Points</th>
                              <th className="py-2 font-semibold">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentTransactions.map((transaction: any, index: number) => (
                              <tr key={index} className="border-b last:border-b-0">
                                <td className="py-2 pr-4 font-mono text-xs">
                                  {`${transaction.customerAddress?.slice(0, 6)}...${transaction.customerAddress?.slice(-4)}`}
                                </td>
                                <td className="py-2 pr-4">{transaction.type}</td>
                                <td className="py-2 pr-4 font-medium">{transaction.points}</td>
                                <td className="py-2 text-xs">{new Date(transaction.date).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Loyal Customers List */}
                {loyaltyProgram?.loyalCustomers && loyaltyProgram.loyalCustomers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Your Loyal Customers</CardTitle>
                      <CardDescription>A list of customers with LOYAL points from your program.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 pr-4 font-semibold">Address</th>
                              <th className="py-2 pr-4 font-semibold">Name</th>
                              <th className="py-2 font-semibold">Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loyaltyProgram.loyalCustomers.map((customer: any) => (
                              <tr key={customer.address} className="border-b last:border-b-0">
                                <td className="py-2 pr-4 font-mono text-xs">
                                  {`${customer.address.slice(0, 6)}...${customer.address.slice(-4)}`}
                                </td>
                                <td className="py-2 pr-4">{customer.name || 'Unknown'}</td>
                                <td className="py-2 font-medium">{customer.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

export default MerchantLoyalDashboardPage
