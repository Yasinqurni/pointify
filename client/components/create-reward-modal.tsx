"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createReward, type Reward } from "@/lib/api"
import { useWalletStore } from "@/lib/store"

interface CreateRewardModalProps {
  isOpen: boolean
  onClose: () => void
  onRewardCreated: (newReward: Reward) => void
}

export function CreateRewardModal({ isOpen, onClose, onRewardCreated }: CreateRewardModalProps) {
  const { walletAddress, userType } = useWalletStore()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requiredPoints, setRequiredPoints] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [creatingReward, setCreatingReward] = useState(false)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setRequiredPoints("")
    setImageUrl("")
    setExpiryDate("")
  }

  const handleCreateRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress || userType !== "merchant") {
      toast({
        title: "Error",
        description: "Please connect your wallet as a merchant to create rewards.",
        variant: "destructive",
      })
      return
    }

    if (!title || !description || !requiredPoints || !imageUrl || !expiryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all reward details.",
        variant: "destructive",
      })
      return
    }

    setCreatingReward(true)
    try {
      const newReward = await createReward({
        title,
        description,
        imageUrl,
        merchantName: "Your Merchant Name", // This would ideally come from merchant profile
        merchantLogoUrl: "/placeholder.svg?height=40&width=40", // Placeholder
        requiredPoints: Number.parseInt(requiredPoints),
        expiryDate,
      })
      toast({
        title: "Reward Created!",
        description: "Your new reward has been successfully added.",
      })
      onRewardCreated(newReward) // Pass the new reward back to the parent
      resetForm()
      onClose()
    } catch (error) {
      console.error("Failed to create reward:", error)
      toast({
        title: "Error",
        description: "Failed to create reward. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreatingReward(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card glass-card">
        <DialogHeader>
          <DialogTitle>Create New Reward</DialogTitle>
          <DialogDescription>Define the details for a new loyalty reward your customers can redeem.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateRewardSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Reward Title</Label>
            <Input
              id="title"
              placeholder="e.g., Free Coffee, 10% Off Pastry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of the reward."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[80px] bg-background/50 backdrop-blur-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="points">Required LOYAL Points</Label>
              <Input
                id="points"
                type="number"
                placeholder="e.g., 100"
                value={requiredPoints}
                onChange={(e) => setRequiredPoints(e.target.value)}
                required
                min="1"
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="e.g., /placeholder.svg?height=100&width=100"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              className="bg-background/50 backdrop-blur-sm"
            />
            <p className="text-xs text-muted-foreground">Provide a direct URL to the reward image.</p>
          </div>
          <Button type="submit" className="w-full" disabled={creatingReward}>
            {creatingReward && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Reward
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
