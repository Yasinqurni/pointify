"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createReward, getLoyaltySettings, type Reward, type CreateRewardRequest } from "@/lib/api"
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
  const [defaultPointsLoaded, setDefaultPointsLoaded] = useState(false)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setRequiredPoints("")
    setImageUrl("")
    setExpiryDate("")
    setDefaultPointsLoaded(false)
  }

  // Load default points from loyalty settings when modal opens
  useEffect(() => {
    const loadDefaultPoints = async () => {
      if (isOpen && !defaultPointsLoaded && userType === "merchant") {
        try {
          const settings = await getLoyaltySettings()
          setRequiredPoints(settings.defaultRewardPoints.toString())
          setDefaultPointsLoaded(true)
        } catch (error) {
          console.error("Failed to load default points:", error)
          // Don't show error toast, just use empty default
        }
      }
    }

    loadDefaultPoints()
  }, [isOpen, defaultPointsLoaded, userType])

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
      const createRewardData: CreateRewardRequest = {
        title,
        description,
        imageUrl,
        requiredPoints: Number.parseInt(requiredPoints),
        expiryDate,
      }
      
      const newReward = await createReward(createRewardData)
      toast({
        title: "Reward Created!",
        description: "Your new reward has been successfully added.",
      })
      onRewardCreated(newReward) // Pass the new reward back to the parent
      resetForm()
      onClose()
    } catch (error: any) {
      console.error("Failed to create reward:", error)
      
      // Provide specific error messages based on the error type
      let errorMessage = "Failed to create reward. Please try again."
      
      if (error.message?.includes("authentication token")) {
        errorMessage = "Authentication expired. Please log in again."
      } else if (error.message?.includes("401")) {
        errorMessage = "Authentication required. Please log in again."
      } else if (error.message?.includes("403")) {
        errorMessage = "Access denied. Only merchants can create rewards."
      } else if (error.message?.includes("400")) {
        errorMessage = "Invalid reward data. Please check your inputs."
      } else if (error.message?.includes("500")) {
        errorMessage = "Server error. Please try again later."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
