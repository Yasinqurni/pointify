"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { fetchMerchantDashboardData, fetchMerchantLoyaltyProgram } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Gift, TrendingUp, Wallet, Plus, RefreshCcw, Package, ArrowRightLeft } from "lucide-react" // Added new icons
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { mockGetMerchantIDRXBalance, mockGetMerchantLoyalBalance, mockGetTotalLoyalRewarded } from "@/lib/ethers"
import { motion } from "framer-motion" // Added for animations
import Image from "next/image" // For business logo

export default function DashboardPage() {
  const {
    walletAddress,
    userType,
    merchantIDRXBalance,
    merchantLoyalBalance,
    totalLoyalRewarded,
    setMerchantIDRXBalance,
    setMerchantLoyalBalance,
    setTotalLoyalRewarded,
  } = useWalletStore()
  const router = useRouter()
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loyaltyProgram, setLoyaltyProgram] = useState<any>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for today's activity log
  const [todayActivity, setTodayActivity] = useState([
    { id: 1, type: "Reward", details: "10 LOYAL to Alice", time: "10:30 AM" },
    { id: 2, type: "Redemption", details: "Free Coffee by Bob", time: "11:15 AM" },
    { id: 3, type: "Reward", details: "25 LOYAL to Charlie", time: "01:00 PM" },
  ])
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapAmount, setSwapAmount] = useState("")
  const [swapDirection, setSwapDirection] = useState<"idrx-to-loyal" | "loyal-to-idrx">("idrx-to-loyal")

  useEffect(() => {
    if (!walletAddress || userType !== "merchant") {
      router.push("/") // Redirect if not connected as merchant
      return
    }

    const loadData = async () => {
      setLoadingDashboard(true)
      setError(null)
      try {
        const dashData = await fetchMerchantDashboardData("0xMerchant123")
        setDashboardData(dashData)

        const loyalData = await fetchMerchantLoyaltyProgram(walletAddress)
        setLoyaltyProgram(loyalData)

        const idrx = await mockGetMerchantIDRXBalance(walletAddress)
        const loyal = await mockGetMerchantLoyalBalance(walletAddress)
        const totalRewarded = await mockGetTotalLoyalRewarded(walletAddress)
        setMerchantIDRXBalance(idrx)
        setMerchantLoyalBalance(loyal)
        setTotalLoyalRewarded(totalRewarded)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoadingDashboard(false)
      }
    }

    loadData()
  }, [walletAddress, userType, router, setMerchantIDRXBalance, setMerchantLoyalBalance, setTotalLoyalRewarded, toast])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const actionButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const handleSwap = async () => {
    const amount = Number.parseFloat(swapAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap.",
        variant: "destructive",
      })
      return
    }

    try {
      // Mock swap operation
      if (swapDirection === "idrx-to-loyal") {
        setMerchantIDRXBalance((prev) => (prev || 0) - amount)
        setMerchantLoyalBalance((prev) => (prev || 0) + amount)
        toast({
          title: "Swap Successful",
          description: `${amount} IDRX swapped to ${amount} LOYAL`,
        })
      } else {
        setMerchantLoyalBalance((prev) => (prev || 0) - amount)
        setMerchantIDRXBalance((prev) => (prev || 0) + amount)
        toast({
          title: "Swap Successful",
          description: `${amount} LOYAL swapped to ${amount} IDRX`,
        })
      }
      setShowSwapModal(false)
      setSwapAmount("")
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "Failed to complete swap. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!walletAddress || userType !== "merchant") {
    return null // Redirect handled by useEffect
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-20 sm:gap-6 sm:p-6 md:gap-8 md:p-8 md:pt-32 lg:gap-10 lg:p-12 lg:pt-36">
        {/* Enhanced Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 pt-6 sm:pt-8 shadow-2xl glass-card border border-primary/20 backdrop-blur-sm gap-4 sm:gap-4"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Business Logo"
                width={40}
                height={40}
                className="rounded-full ring-2 ring-primary/30 shadow-lg sm:w-12 sm:h-12"
              />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
            </div>
            <div className="pb-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Pointify Cafe</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Premium Merchant Partner</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-green-600">Lisk L2</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-xs sm:text-sm font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </motion.div>

        {loadingDashboard ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="text-center text-destructive">{error}</div>
        ) : (
          <>
            {/* Balance Cards */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center shadow-xl glass-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full mb-3 sm:mb-4">
                    <Wallet className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-2">{merchantIDRXBalance?.toFixed(2) || "0.00"}</div>
                  <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground mb-3 sm:mb-4">IDRX Balance</p>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button asChild variant="secondary" className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 text-xs sm:text-sm">
                      <Link href="/merchant/top-up-loyal">Top Up</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-2 sm:px-3 border-primary/20 hover:bg-primary/10 text-xs sm:text-sm"
                      onClick={() => {
                        setSwapDirection("idrx-to-loyal")
                        setShowSwapModal(true)
                      }}
                    >
                      <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <Card className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center shadow-xl glass-card border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                  <div className="bg-green-500/10 p-2 sm:p-3 rounded-full mb-3 sm:mb-4">
                    <Gift className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-500" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-2">{merchantLoyalBalance?.toFixed(2) || "0.00"}</div>
                  <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground mb-3 sm:mb-4">LOYAL Balance</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-green-500/20 hover:bg-green-500/10 text-green-600 text-xs sm:text-sm"
                    onClick={() => {
                      setSwapDirection("loyal-to-idrx")
                      setShowSwapModal(true)
                    }}
                  >
                    <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Swap to IDRX
                  </Button>
                </Card>
              </motion.div>
            </div>

            {/* Transaction History */}
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="p-8 shadow-xl glass-card border-2 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0 pt-0">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                    Transaction History
                  </CardTitle>
                  <RefreshCcw className="h-5 w-5 text-muted-foreground hover:text-blue-500 transition-colors" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {todayActivity.map((activity) => (
                      <div key={activity.id} className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/40 hover:to-muted/60 transition-all duration-200 border border-muted/20">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${activity.type === "Reward" ? "bg-green-500" : "bg-blue-500"} shadow-lg`}></div>
                          <span className="font-semibold text-foreground">{activity.details}</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>


          </>
        )}

        {/* Swap Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Swap {swapDirection === "idrx-to-loyal" ? "IDRX to LOYAL" : "LOYAL to IDRX"}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="swap-amount">Amount</Label>
                  <Input
                    id="swap-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSwapModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSwap}
                    className="flex-1"
                    disabled={!swapAmount || Number.parseFloat(swapAmount) <= 0}
                  >
                    Confirm Swap
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
