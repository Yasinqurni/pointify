"use client"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { fetchMerchantRewardsProtected, type Reward } from "@/lib/api" // Use the protected function
import { authService } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Gift, PlusCircle, ListChecks, Edit, Trash2, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateRewardModal } from "@/components/create-reward-modal" // Import the new modal
import { Switch } from "@/components/ui/switch" // For active toggle
import { Label } from "@/components/ui/label" // For switch label

export default function MerchantRewardsPage() {
  const { walletAddress, userType } = useWalletStore()
  const { toast } = useToast()

  // State for My Rewards list
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [errorRewards, setErrorRewards] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    const loadRewards = async () => {
      if (walletAddress && userType === "merchant") {
        console.log("🔍 Loading rewards for merchant:", walletAddress)
        setLoadingRewards(true)
        setErrorRewards(null)
        
        try {
          console.log("🔍 About to call fetchMerchantRewards()")
          const response = await fetchMerchantRewardsProtected()
          console.log("🔍 fetchMerchantRewards returned:", response)
          // Ensure data is an array
          if (response && response.data && Array.isArray(response.data)) {
            console.log("🔍 Setting rewards:", response.data)
            setRewards(response.data)
          } else {
            console.error("❌ Invalid rewards data:", response)
            setRewards([])
            setErrorRewards("Invalid rewards data received.")
          }
        } catch (err) {
          console.error("❌ Failed to fetch rewards:", err)
          setRewards([])
          setErrorRewards("Failed to load rewards. Please try again.")
        } finally {
          setLoadingRewards(false)
        }
      }
    }

    loadRewards()
  }, [walletAddress, userType])

  const handleRewardCreated = (newReward: Reward) => {
    setRewards((prev) => [...prev, newReward])
  }

  const handleToggleActive = (rewardId: string, isActive: boolean) => {
    // This would typically be an API call to update the reward's status
    console.log(`Toggling reward ${rewardId} to active: ${isActive}`)
    setRewards((prev) => prev.map((reward) => (reward.id === rewardId ? { ...reward, isActive: isActive } : reward)))
    toast({
      title: "Feature Coming Soon",
      description: `Reward status toggle for ${rewardId} is not yet implemented.`,
    })
  }

  const handleEditReward = (rewardId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `Editing reward ${rewardId} is not yet implemented.`,
    })
    // Implement edit logic here
  }

  const handleDeleteReward = (rewardId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `Deleting reward ${rewardId} is not yet implemented.`,
    })
    // Implement delete logic here
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
    <main className="flex flex-1 flex-col p-4 md:p-8 pt-32 w-full">
      <Card className="w-full bg-card shadow-lg glass-card">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6" /> Rewards Management
          </CardTitle>
          <CardDescription>Create new loyalty rewards or manage your existing ones.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="my-rewards" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
              <TabsTrigger value="my-rewards">
                <ListChecks className="mr-2 h-4 w-4" /> My Rewards
              </TabsTrigger>
              {/* Removed Create New Reward tab, now it's a floating button */}
            </TabsList>

            <TabsContent value="my-rewards" className="mt-6">
              {loadingRewards ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Loading your rewards...</p>
                </div>
              ) : errorRewards ? (
                <div className="text-center text-destructive py-8">{errorRewards}</div>
              ) : rewards.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  You haven&apos;t created any rewards yet. Click the &quot;Add New Reward&quot; button to get started!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(rewards) && rewards.map((reward) => (
                    <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30">
                      <div className="relative">
                        <img
                          src={reward.imageUrl}
                          alt={reward.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop&crop=center";
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                            <Switch
                              id={`active-switch-${reward.id}`}
                              checked={(reward as any).isActive || false}
                              onCheckedChange={(checked) => handleToggleActive(reward.id, checked)}
                            />
                            <Label htmlFor={`active-switch-${reward.id}`} className="text-xs text-white">
                              {(reward as any).isActive ? "Active" : "Inactive"}
                            </Label>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                            <img
                              src={reward.merchantLogoUrl}
                              alt={reward.merchantName}
                              className="w-6 h-6 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop&crop=center";
                              }}
                            />
                            <span className="text-xs text-white font-medium">{reward.merchantName}</span>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{reward.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                              {reward.requiredPoints} points
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditReward(reward.id)}
                              aria-label={`Edit ${reward.title}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteReward(reward.id)}
                              aria-label={`Delete ${reward.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg text-lg"
        onClick={() => setIsCreateModalOpen(true)}
        aria-label="Add New Reward"
      >
        <PlusCircle className="h-8 w-8" />
        <span className="sr-only">Add New Reward</span>
      </Button>

      <CreateRewardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRewardCreated={handleRewardCreated}
      />
    </main>
  )
}
