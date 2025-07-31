"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import {
  fetchRewards,
  type Reward,
  fetchUserRedemptions,
  redeemReward,
  fetchUserPointReceptionLogs,
  type PointReception,
} from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Gift,
  History,
  Store,
  QrCode,
  Wallet,
  Copy,
  Check,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react"
import { RewardCard } from "@/components/reward-card"
import { RedeemConfirmationModal } from "@/components/redeem-confirmation-modal"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { mockGetUserLoyalBalance } from "@/lib/ethers"
import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react" // Import QRCode
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components
import { Input } from "@/components/ui/input" // Import Input for search
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Import Table components

// Helper type for grouped rewards
type GroupedRewards = {
  [merchantName: string]: Reward[]
}

type Redemption = {
  id: string
  rewardId: string
  rewardTitle: string
  redeemedDate: string
  claimCode: string
}

type HistoryEntry = (Redemption & { type: "redeemed" }) | (PointReception & { type: "received" })

export default function UserDashboardPage() {
  const { walletAddress, userType, userLoyalBalance, setUserLoyalBalance } = useWalletStore()
  const { toast } = useToast()
  const router = useRouter()

  const [rewards, setRewards] = useState<GroupedRewards>({})
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [errorRewards, setErrorRewards] = useState<string | null>(null)
  const [redeemedRewardIds, setRedeemedRewardIds] = useState<Set<string>>(new Set())

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)

  const [loadingLoyalBalance, setLoadingLoyalBalance] = useState(true)
  const [copied, setCopied] = useState(false) // For copy wallet address

  const [searchTerm, setSearchTerm] = useState("") // For reward search
  const [history, setHistory] = useState<HistoryEntry[]>([]) // For redemption history
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [errorHistory, setErrorHistory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("rewards") // State for active tab
  const [showQR, setShowQR] = useState(false) // State for QR code visibility
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null) // State for selected merchant

  useEffect(() => {
    if (!walletAddress || userType !== "user") {
      router.push("/")
      return
    }

    const loadData = async () => {
      setLoadingRewards(true)
      setErrorRewards(null)
      setLoadingLoyalBalance(true)
      setLoadingHistory(true)
      setErrorHistory(null)

      try {
        // Load rewards
        const rewardsData = await fetchRewards()
        const grouped: GroupedRewards = rewardsData.reduce((acc, reward) => {
          if (!acc[reward.merchantName]) {
            acc[reward.merchantName] = []
          }
          acc[reward.merchantName].push(reward)
          return acc
        }, {} as GroupedRewards)
        setRewards(grouped)

        // Load user's loyal balance
        const loyalBalance = await mockGetUserLoyalBalance(walletAddress)
        setUserLoyalBalance(loyalBalance)

        // Load user's redemption history and point reception logs
        const [redemptions, receptions] = await Promise.all([
          fetchUserRedemptions(walletAddress),
          fetchUserPointReceptionLogs(walletAddress),
        ])

        const combinedHistory: HistoryEntry[] = [
          ...redemptions.map((r) => ({ ...r, type: "redeemed" as const })),
          ...receptions.map((p) => ({ ...p, type: "received" as const })),
        ]

        // Sort by date, newest first
        combinedHistory.sort((a, b) => {
          const dateA = new Date(a.type === "redeemed" ? a.redeemedDate : a.receivedDate).getTime()
          const dateB = new Date(b.type === "redeemed" ? b.redeemedDate : b.receivedDate).getTime()
          return dateB - dateA
        })

        setHistory(combinedHistory)

        // Mark claimed rewards
        const claimedIds = new Set(redemptions.map((r) => r.rewardId))
        setRedeemedRewardIds(claimedIds)
      } catch (err) {
        console.error("Failed to load user dashboard data:", err)
        setErrorRewards("Failed to load rewards. Please try again.")
        setErrorHistory("Failed to load history. Please try again.")
        setUserLoyalBalance(0)
      } finally {
        setLoadingRewards(false)
        setLoadingLoyalBalance(false)
        setLoadingHistory(false)
      }
    }

    loadData()
  }, [walletAddress, userType, router, setUserLoyalBalance])

  const handleRedeemClick = (reward: Reward) => {
    if (userLoyalBalance === null || userLoyalBalance < reward.requiredPoints) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.requiredPoints} LOYAL points to redeem this reward, but you only have ${userLoyalBalance || 0}.`,
        variant: "destructive",
      })
      return
    }
    setSelectedReward(reward)
    setIsRedeemModalOpen(true)
  }

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !walletAddress) return

    setIsRedeeming(true)
    try {
      const redemptionResult = await redeemReward(walletAddress, selectedReward.id)

      toast({
        title: "Reward Redeemed!",
        description: `You have successfully redeemed "${selectedReward.title}".`,
      })

      // Update local balance after successful redemption
      if (userLoyalBalance !== null) {
        setUserLoyalBalance(userLoyalBalance - selectedReward.requiredPoints) // Corrected from requiredWithPoints
      }
      // Mark the reward as redeemed locally
      setRedeemedRewardIds((prev) => new Set(prev).add(selectedReward.id))

      // Update history
      const newRedemptionEntry: HistoryEntry = {
        ...redemptionResult,
        type: "redeemed",
      }
      setHistory((prev) => [newRedemptionEntry, ...prev])

      // Redirect to a success page with redemption details
      router.push(
        `/redeem-success?rewardTitle=${encodeURIComponent(selectedReward.title)}&merchantName=${encodeURIComponent(selectedReward.merchantName)}&redeemedPoints=${selectedReward.requiredPoints}&claimCode=${redemptionResult.claimCode}`,
      )
    } catch (err: any) {
      console.error("Failed to redeem reward:", err)
      toast({
        title: "Redemption Failed",
        description: err.message || "Could not redeem reward. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
      setIsRedeemModalOpen(false)
      setSelectedReward(null)
    }
  }

  const handleCopyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!walletAddress || userType !== "user") {
    return null // Redirect handled by useEffect
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  const filteredRewards = Object.entries(rewards).reduce((acc, [merchantName, merchantRewards]) => {
    const filtered = merchantRewards.filter(
      (reward) =>
        reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    if (filtered.length > 0) {
      acc[merchantName] = filtered
    }
    return acc
  }, {} as GroupedRewards)

  return (
    <>
      <main className="flex flex-1 flex-col items-center p-4 md:p-8">
        <motion.div
          className="w-full max-w-4xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Balance and Profile Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prominent LOYAL Balance Card */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg glass-card h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-medium flex items-center justify-center gap-2">
                    <Wallet className="h-6 w-6 text-primary" /> Your LOYAL Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  {loadingLoyalBalance ? (
                    <div className="h-12 w-32 animate-pulse rounded-md bg-muted" />
                  ) : (
                    <motion.div
                      key={userLoyalBalance} // Key change to re-animate on balance update
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="text-6xl font-bold text-primary drop-shadow-md"
                    >
                      {userLoyalBalance?.toFixed(2) || "0.00"}
                    </motion.div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">Your total loyalty points across all merchants</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Card with QR Code */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg glass-card h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" /> Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                  {showQR ? (
                    <div className="flex justify-center p-4 bg-muted/50 rounded-lg shadow-inner">
                      <QRCodeSVG value={walletAddress} size={200} level="H" includeMargin={false} />
                    </div>
                  ) : (
                    <div 
                      className="flex justify-center p-4 bg-muted/50 rounded-lg shadow-inner cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => setShowQR(true)}
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <QrCode className="h-12 w-12" />
                        <span className="text-sm font-medium">Tap to show QR</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground break-all font-mono">
                    <span>Wallet: {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
                    <Button variant="ghost" size="sm" onClick={handleCopyWalletAddress} className="px-2">
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {showQR && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowQR(false)}
                      className="mt-2"
                    >
                      Hide QR
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs for Rewards and History */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-lg glass-card">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted rounded-b-none">
                    <TabsTrigger value="rewards" className="rounded-b-none">
                      <Gift className="mr-2 h-4 w-4" /> Available Rewards
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-b-none">
                      <History className="mr-2 h-4 w-4" /> Activity History
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="rewards" className="p-4 pt-6">
                    {selectedMerchant ? (
                      // Show rewards for selected merchant
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Store className="h-5 w-5" /> {selectedMerchant}
                          </h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedMerchant(null)}
                            className="flex items-center gap-2"
                          >
                            ← Back to Merchants
                          </Button>
                        </div>
                        <div className="mb-4">
                          <Input
                            type="text"
                            placeholder="Search rewards..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background/50 backdrop-blur-sm"
                          />
                        </div>
                        {loadingRewards ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-2 text-muted-foreground">Loading rewards...</p>
                          </div>
                        ) : errorRewards ? (
                          <div className="text-center text-destructive py-8">{errorRewards}</div>
                        ) : !filteredRewards[selectedMerchant] || filteredRewards[selectedMerchant].length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            No rewards available from {selectedMerchant} or matching your search.
                          </div>
                        ) : (
                          <motion.div
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {filteredRewards[selectedMerchant].map((reward) => (
                              <motion.div key={reward.id} variants={itemVariants}>
                                <RewardCard
                                  {...reward}
                                  onRedeem={handleRedeemClick}
                                  userPoints={userLoyalBalance || 0}
                                  isClaimed={redeemedRewardIds.has(reward.id)}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      // Show merchants list
                      <div>
                        <div className="mb-4">
                          <Input
                            type="text"
                            placeholder="Search merchants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background/50 backdrop-blur-sm"
                          />
                        </div>
                        {loadingRewards ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-2 text-muted-foreground">Loading merchants...</p>
                          </div>
                        ) : errorRewards ? (
                          <div className="text-center text-destructive py-8">{errorRewards}</div>
                        ) : Object.keys(filteredRewards).length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            No merchants available at the moment or matching your search.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(filteredRewards).map(([merchantName, merchantRewards]) => {
                              // Get the first reward to extract merchant logo
                              const firstReward = merchantRewards[0];
                              const merchantLogo = firstReward?.merchantLogoUrl;
                              
                              return (
                                <motion.div key={merchantName} variants={itemVariants}>
                                  <Card 
                                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 glass-card overflow-hidden"
                                    onClick={() => setSelectedMerchant(merchantName)}
                                  >
                                    <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5">
                                      {merchantLogo && (
                                        <img
                                          src={merchantLogo}
                                          alt={merchantName}
                                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                                      <div className="absolute bottom-2 left-2 right-2">
                                        <div className="flex items-center gap-2">
                                          {merchantLogo && (
                                            <img
                                              src={merchantLogo}
                                              alt={merchantName}
                                              className="w-8 h-8 rounded-full object-cover border-2 border-background shadow-sm"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                              }}
                                            />
                                          )}
                                          <div>
                                            <h3 className="font-semibold text-lg text-foreground">{merchantName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                              {merchantRewards.length} reward{merchantRewards.length !== 1 ? 's' : ''} available
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Click to view rewards</span>
                                        <Gift className="h-4 w-4 text-primary" />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="history" className="p-4 pt-6">
                    {loadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading history...</p>
                      </div>
                    ) : errorHistory ? (
                      <div className="text-center text-destructive py-8">{errorHistory}</div>
                    ) : history.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>You haven&apos;t had any loyalty activity yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-md border bg-background shadow-md glass-card">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Details</TableHead>
                              <TableHead>Merchant</TableHead>
                              <TableHead>Points</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Code/Hash</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {history.map((entry) => (
                              <TableRow key={entry.id}>
                                <TableCell className="font-medium capitalize">
                                  <div className="flex items-center gap-2">
                                    {entry.type === "received" ? (
                                      <ArrowDownCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <ArrowUpCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    {entry.type}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {entry.type === "redeemed" ? entry.rewardTitle : "Points Received"}
                                </TableCell>
                                <TableCell>{entry.merchantName}</TableCell>
                                <TableCell>
                                  {entry.type === "redeemed" ? `-${entry.redeemedPoints}` : `+${entry.pointsReceived}`}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    entry.type === "redeemed" ? entry.redeemedDate : entry.receivedDate,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {entry.type === "redeemed"
                                    ? entry.claimCode
                                    : entry.transactionHash.slice(0, 8) + "..."}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {selectedReward && (
          <RedeemConfirmationModal
            isOpen={isRedeemModalOpen}
            onClose={() => setIsRedeemModalOpen(false)}
            onConfirm={handleConfirmRedeem}
            rewardTitle={selectedReward.title}
            requiredPoints={selectedReward.requiredPoints}
            isLoading={isRedeeming}
          />
        )}
      </main>
    </>
  )
}
