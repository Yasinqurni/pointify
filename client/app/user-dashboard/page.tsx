"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import Link from "next/link"
import {
  fetchRewards,
  type Reward,
  fetchUserRedemptions,
  redeemReward,
  fetchUserPointReceptionLogs,
  type PointReception,
  completeRedemption,
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
import { ClaimQRCode } from "@/components/claim-qr-code"
import { NetworkWarning } from "@/components/network-warning"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { mockGetUserLoyalBalance } from "@/lib/ethers"
import { getPltBalance, redeemToMerchant, checkPltApprovalNeeded, safeApprove } from "@/lib/plt-swap-contract"
import { ethers } from "ethers"
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

type HistoryEntry = (Redemption & { type: "redeemed"; merchantName: string; redeemedPoints: number }) | (PointReception & { type: "received" })

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
  const [showQRModal, setShowQRModal] = useState(false)
  const [redemptionData, setRedemptionData] = useState<any>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const [loadingLoyalBalance, setLoadingLoyalBalance] = useState(true)
  const [copied, setCopied] = useState(false) // For copy wallet address
  const [realPltBalance, setRealPltBalance] = useState<number>(0)
  const [loadingPltBalance, setLoadingPltBalance] = useState(true)

  const [searchTerm, setSearchTerm] = useState("") // For reward search
  const [history, setHistory] = useState<HistoryEntry[]>([]) // For redemption history
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [errorHistory, setErrorHistory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("rewards") // State for active tab
  const [showQR, setShowQR] = useState(false) // State for QR code visibility
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null) // State for selected merchant
  const [redemptionStep, setRedemptionStep] = useState<'idle' | 'approving' | 'redeeming' | 'creating-record'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [transactionHash, setTransactionHash] = useState<string>("")

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
      setLoadingPltBalance(true)

      try {
        // Load rewards
        const rewardsResponse = await fetchRewards()
        const rewardsData = rewardsResponse.data
        const grouped: GroupedRewards = rewardsData.reduce((acc: GroupedRewards, reward: Reward) => {
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
        
        // Use the new balance service to fetch real IDRX balances
        const { balanceService } = await import("@/lib/balance-service")
        await balanceService.refreshBalancesImmediate(walletAddress, 'user')
        
        // Load real PLT balance from blockchain
        try {
          const pltBalance = await getPltBalance(walletAddress)
          setRealPltBalance(pltBalance)
        } catch (pltError) {
          console.error('Failed to load PLT balance:', pltError)
          setRealPltBalance(0)
        } finally {
          setLoadingPltBalance(false)
        }

        // Load user's redemption history and point reception logs
        const [redemptions, receptions] = await Promise.all([
          fetchUserRedemptions(walletAddress),
          fetchUserPointReceptionLogs(walletAddress),
        ])

        const combinedHistory: HistoryEntry[] = [
          ...redemptions.map((r) => ({ 
            ...r, 
            type: "redeemed" as const,
            merchantName: r.merchantName || "Unknown Merchant",
            redeemedPoints: r.redeemedPoints || 0
          })),
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
  }, [walletAddress, userType, router])

  const handleRedeemClick = (rewardId: string) => {
    console.log("🔍 Redeem clicked for reward ID:", rewardId)
    console.log("🔍 Available rewards:", rewards)
    
    const reward = Object.values(rewards).flat().find(r => r.id === rewardId)
    console.log("🔍 Found reward:", reward)
    
    if (!reward) {
      console.error("❌ Reward not found for ID:", rewardId)
      toast({
        title: "Error",
        description: "Reward not found. Please try again.",
        variant: "destructive",
      })
      return
    }
    
    console.log("🔍 Current PLT balance:", realPltBalance)
    console.log("🔍 Required points:", reward.requiredPoints)
    
    if (realPltBalance < reward.requiredPoints) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.requiredPoints} PLT points to redeem this reward, but you only have ${realPltBalance}.`,
        variant: "destructive",
      })
      return
    }
    
    console.log("🔍 Setting selected reward and opening modal")
    setSelectedReward(reward)
    setIsRedeemModalOpen(true)
  }

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !walletAddress) return

    setIsRedeeming(true)
    setRedemptionStep('idle')
    setErrorMessage("")
    setTransactionHash("")
    
    try {
      // Check if MetaMask is installed and connected
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // Get the user's wallet provider (MetaMask, etc.)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      // Verify the connected account matches the expected wallet address
      const connectedAddress = await signer.getAddress()
      if (connectedAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error(`Connected wallet address (${connectedAddress}) doesn't match expected address (${walletAddress})`)
      }

      // Get merchant address from the reward data
      let merchantAddress = selectedReward.merchant?.walletAddress || selectedReward.merchantWalletAddress
      if (!merchantAddress) {
        console.error("❌ Merchant wallet address missing from reward:", selectedReward)
        throw new Error("Merchant address not found for this reward")
      }

      // Validate and normalize the merchant address
      try {
        merchantAddress = ethers.utils.getAddress(merchantAddress)
        console.log('🔍 Normalized merchant address:', merchantAddress)
      } catch (addressError) {
        console.error("❌ Invalid merchant address:", merchantAddress)
        throw new Error(`Invalid merchant address: ${merchantAddress}`)
      }

      // Check if PLT token approval is needed
      const approvalNeeded = await checkPltApprovalNeeded(walletAddress, selectedReward.requiredPoints)
      console.log('🔍 Approval needed:', approvalNeeded)
      
      if (approvalNeeded) {
        console.log("🔍 PLT approval needed, requesting approval...")
        setRedemptionStep('approving')
        toast({
          title: "Approval Required",
          description: "Please approve PLT tokens for redemption in your wallet.",
        })
        
        // Get PLT token contract
        const pltTokenAddress = "0x929f30a023CCA95301ECc5f8b97d7C32862B774f" // PLT token address
        console.log('🔍 Creating PLT token contract with address:', pltTokenAddress)
        const pltTokenContract = new ethers.Contract(pltTokenAddress, [
          "function approve(address spender, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)"
        ], signer)
        
        // Approve PLT tokens for the swap contract
        const approveAmount = ethers.utils.parseUnits(selectedReward.requiredPoints.toString(), 18)
        console.log('🔍 Approving amount:', approveAmount.toString())
        console.log('🔍 For spender:', "0xC2ad80E574f02D984E0fD3dA3C4cD221431A8818")
        
        const approvalTxHash = await safeApprove(pltTokenContract, "0xC2ad80E574f02D984E0fD3dA3C4cD221431A8818", approveAmount, signer)
        console.log('🔍 Approval transaction hash:', approvalTxHash)
        
        toast({
          title: "Approval Successful",
          description: "PLT tokens approved. Proceeding with redemption...",
        })
      } else {
        console.log("🔍 No approval needed, proceeding directly to redemption...")
      }

      // Call the blockchain redemption function directly
      setRedemptionStep('redeeming')
      toast({
        title: "Processing Redemption",
        description: "Sending transaction to blockchain. This may take a few moments...",
      })
      
      const redemptionResult = await redeemToMerchant(
        merchantAddress,
        selectedReward.requiredPoints,
        signer
      )

      if (redemptionResult.status === 'success') {
        // Store transaction hash
        setTransactionHash(redemptionResult.transactionHash!)
        
        // After blockchain success, create the redemption record in backend
        setRedemptionStep('creating-record')
        toast({
          title: "Redemption Successful!",
          description: "Creating redemption record in backend...",
        })
        
        try {
          const redemptionRecord = await completeRedemption(
            selectedReward.id,
            walletAddress,
            redemptionResult.transactionHash!
          )

          // Refresh PLT balance after successful redemption
          const newPltBalance = await getPltBalance(walletAddress)
          setRealPltBalance(newPltBalance)

          // Update history with the successful redemption from backend
          const newRedemptionEntry: HistoryEntry = {
            ...redemptionRecord,
            type: "redeemed",
          }
          setHistory((prev) => [newRedemptionEntry, ...prev])

          // Store redemption data for QR code
          setRedemptionData({
            claimCode: redemptionRecord.claimCode,
            rewardTitle: selectedReward.title,
            merchantName: selectedReward.merchantName,
            redeemedPoints: selectedReward.requiredPoints,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          })

          // Close confirmation modal and show QR directly
          setIsRedeemModalOpen(false)
          setShowQRModal(true)
        } catch (backendError: any) {
          console.warn("Backend redemption record creation failed, but blockchain transaction succeeded:", backendError)
          
          // Create local redemption record as fallback
          const localRedemptionRecord = {
            id: `local-${Date.now()}`,
            rewardId: selectedReward.id,
            rewardTitle: selectedReward.title,
            redeemedDate: new Date().toISOString(),
            claimCode: `LOCAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            transactionHash: redemptionResult.transactionHash,
          }

          // Update history with local redemption record
          const newRedemptionEntry: HistoryEntry = {
            ...localRedemptionRecord,
            type: "redeemed",
            merchantName: selectedReward.merchantName,
            redeemedPoints: selectedReward.requiredPoints,
          }
          setHistory((prev) => [newRedemptionEntry, ...prev])

          // Store redemption data for QR code
          setRedemptionData({
            claimCode: localRedemptionRecord.claimCode,
            rewardTitle: selectedReward.title,
            merchantName: selectedReward.merchantName,
            redeemedPoints: selectedReward.requiredPoints,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          })

          // Close confirmation modal and show QR directly
          setIsRedeemModalOpen(false)
          setShowQRModal(true)
        }
      } else {
        throw new Error(redemptionResult.error || "Redemption failed")
      }
    } catch (error: any) {
      console.error("Redemption error:", error)
      setErrorMessage(error.message || "Failed to redeem reward")
      setShowErrorModal(true)
    } finally {
      setIsRedeeming(false)
      setRedemptionStep('idle')
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

  const handleRefreshPltBalance = async () => {
    if (!walletAddress) return
    
    setLoadingPltBalance(true)
    try {
      const newPltBalance = await getPltBalance(walletAddress)
      setRealPltBalance(newPltBalance)
      toast({
        title: "Balance Updated",
        description: "PLT balance refreshed from blockchain",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh PLT balance",
        variant: "destructive",
      })
    } finally {
      setLoadingPltBalance(false)
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
        <NetworkWarning className="mb-4 w-full max-w-4xl" />
        <motion.div
          className="w-full max-w-4xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Balance and Profile Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prominent PLT Balance Card */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg glass-card h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium flex items-center gap-2">
                      <Wallet className="h-6 w-6 text-primary" /> Your PLT Balance
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefreshPltBalance}
                      className="h-8 w-8 p-0"
                      disabled={loadingPltBalance}
                    >
                      <Loader2 className={`h-4 w-4 ${loadingPltBalance ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  {loadingPltBalance ? (
                    <div className="h-12 w-32 animate-pulse rounded-md bg-muted" />
                  ) : (
                    <motion.div
                      key={realPltBalance} // Key change to re-animate on balance update
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="text-6xl font-bold text-primary drop-shadow-md"
                    >
                      {realPltBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </motion.div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">Your Pointify Token (PLT) balance from blockchain</p>
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
                                  userPoints={realPltBalance}
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
                                  {entry.type === "redeemed" ? `-${entry.redeemedPoints || 0}` : `+${entry.pointsReceived}`}
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
            currentStep={redemptionStep}
          />
        )}

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center">Your Claim Code is Ready!</DialogTitle>
            </DialogHeader>
            {redemptionData && (
              <ClaimQRCode
                claimCode={redemptionData.claimCode}
                rewardTitle={redemptionData.rewardTitle}
                merchantName={redemptionData.merchantName}
                redeemedPoints={redemptionData.redeemedPoints}
                expiresAt={redemptionData.expiresAt}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}
