"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react" // Import CheckCircle icon

interface RewardCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  merchantName: string
  merchantLogoUrl: string
  requiredPoints: number
  expiryDate: string
  onRedeem?: (rewardId: string) => void
  userPoints?: number // Optional: for displaying if user has enough points
  isClaimed?: boolean // New prop: to indicate if the reward has been claimed
}

export function RewardCard({
  id,
  title,
  description,
  imageUrl,
  merchantName,
  merchantLogoUrl,
  requiredPoints,
  expiryDate,
  onRedeem,
  userPoints,
  isClaimed = false, // Default to false
}: RewardCardProps) {
  const hasEnoughPoints = userPoints !== undefined ? userPoints >= requiredPoints : true
  const isExpired = new Date(expiryDate) < new Date()
  const isDisabled = !hasEnoughPoints || isExpired || !onRedeem || isClaimed

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl glass-card">
      {" "}
      {/* Changed bg-card to glass-card */}
      <div className="relative h-40 w-full">
        <Image
          src={imageUrl || "/placeholder.svg?height=100&width=100&query=reward"}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
        {isClaimed ? (
          <Badge className="absolute right-2 top-2 bg-green-500 text-white px-3 py-1 text-sm font-semibold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Claimed
          </Badge>
        ) : (
          <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
            {requiredPoints} Points
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center space-x-2 mb-2">
          <Image
            src={merchantLogoUrl || "/placeholder.svg?height=40&width=40&query=merchant logo"}
            alt={merchantName}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-sm text-muted-foreground font-medium">{merchantName}</span>
        </div>
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">Expires: {expiryDate}</div>
        {userPoints !== undefined && (
          <div className="text-sm mt-2">
            Your Points: <span className="font-semibold">{userPoints}</span>
            {!hasEnoughPoints && <span className="text-destructive ml-2">(Not enough points)</span>}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => onRedeem?.(id)} disabled={isDisabled}>
          {isClaimed ? "Already Claimed" : isExpired ? "Expired" : "Redeem Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
