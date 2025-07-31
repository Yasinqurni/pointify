"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useWalletStore } from "@/lib/store"
import { fetchUserLoyaltyDetails } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Store, Gift } from "lucide-react"
import { RewardCard } from "@/components/reward-card"
import { RedeemConfirmationModal } from "@/components/redeem-confirmation-modal"
import { useToast } from "@/components/ui/use-toast"
import { redeemReward } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Reward {
  id: string
  title: string // Changed from 'name' to 'title'
  requiredPoints: number // Changed from 'pointsRequired' to 'requiredPoints'
  description: string
  imageUrl: string
}

export default function MerchantLoyaltyPage() {
  const params = useParams()
  const merchantName = params.merchantName as string
  const { walletAddress, userType, userLoyalBalance } = useWalletStore()
  const { toast } = useToast()
  const router = useRouter()

  const [merchantDetails, setMerchantDetails] = useState<{
    merchantName: string
    userPoints: number
    rewards: Reward[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)

  useEffect(() => {
    const loadMerchantDetails = async () => {
      if (walletAddress && userType === "user" && merchantName) {
        setLoading(true)
        setError(null)
        try {
          // In a real app, you'd fetch merchant details by ID, not name directly
          // For this mock, we'll use a placeholder merchant address
          const mockMerchantAddress = "0xMerchant123" // Replace with actual merchant address logic
          const data = await fetchUserLoyaltyDetails(walletAddress, mockMerchantAddress)
          if (data) {
            setMerchantDetails(data)
            // The updateLoyaltyBalance function in store.ts doesn't take merchantAddress
            // For now, we'll just rely on the userLoyalBalance from the store if it's updated elsewhere
          } else {
            setError("Merchant loyalty program not found or you are not enrolled.")
          }
        } catch (err) {
          console.error("Failed to fetch merchant loyalty details:", err)
          setError("Failed to load merchant loyalty details. Please try again.")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        setError("Please connect your wallet as a user to view merchant loyalty programs.")
      }
    }

    loadMerchantDetails()
  }, [walletAddress, userType, merchantName])

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward)
    setIsRedeemModalOpen(true)
  }

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !walletAddress || !merchantDetails) return

    setIsRedeeming(true)
    try {
      const redemptionResult = await redeemReward(walletAddress, selectedReward.id)

      toast({
        title: "Reward Redeemed!",
        description: `You have successfully redeemed "${selectedReward.title}".`, // Changed from selectedReward.name
      })

      // Redirect to a success page with redemption details
      router.push(
        `/redeem-success?rewardTitle=${encodeURIComponent(selectedReward.title)}&merchantName=${encodeURIComponent(merchantDetails.merchantName)}&redeemedPoints=${selectedReward.requiredPoints}&claimCode=${redemptionResult.claimCode}`, // Changed from selectedReward.name and selectedReward.pointsRequired
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

  if (loading) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Loading merchant loyalty program...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/user-dashboard">Back to User Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!merchantDetails) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Merchant Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The loyalty program for &quot;{merchantName}&quot; could not be found.
            </p>
            <Button asChild className="mt-4">
              <Link href="/user-dashboard">Back to User Dashboard</Link>
            </Button>
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
              <Store className="h-6 w-6" /> {merchantDetails.merchantName} Loyalty
            </CardTitle>
            <CardDescription>
              Your loyalty points and available rewards at {merchantDetails.merchantName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-md bg-muted p-4">
              <span className="text-lg font-medium">Your LOYAL Points:</span>
              <span className="text-3xl font-bold text-primary">{merchantDetails.userPoints}</span>
            </div>

            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <Gift className="h-5 w-5" /> Available Rewards
            </h3>
            {merchantDetails.rewards.length === 0 ? (
              <p className="text-muted-foreground">No rewards available from this merchant yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {merchantDetails.rewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    id={String(reward.id)}
                    title={reward.title} // Changed from reward.name
                    description={reward.description}
                    imageUrl={reward.imageUrl || "/placeholder.svg?height=100&width=100"}
                    merchantName={merchantDetails.merchantName}
                    merchantLogoUrl="/placeholder.svg?height=40&width=40" // Placeholder
                    requiredPoints={reward.requiredPoints} // Changed from reward.pointsRequired
                    expiryDate="2025-12-31" // Mock expiry date
                    onRedeem={() => handleRedeemClick(reward)}
                    userPoints={merchantDetails.userPoints}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedReward && (
          <RedeemConfirmationModal
            isOpen={isRedeemModalOpen}
            onClose={() => setIsRedeemModalOpen(false)}
            onConfirm={handleConfirmRedeem}
            rewardTitle={selectedReward.title} // Changed from selectedReward.name
            requiredPoints={selectedReward.requiredPoints} // Changed from selectedReward.pointsPoints
            isLoading={isRedeeming}
          />
        )}
      </main>
    </>
  )
}
