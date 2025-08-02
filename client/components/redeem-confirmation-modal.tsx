"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface RedeemConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  rewardTitle: string
  requiredPoints: number
  isLoading: boolean
  currentStep?: 'idle' | 'approving' | 'redeeming' | 'creating-record'
}

export function RedeemConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  rewardTitle,
  requiredPoints,
  isLoading,
  currentStep = 'idle',
}: RedeemConfirmationModalProps) {
  // Calculate progress percentage
  const getProgress = () => {
    switch (currentStep) {
      case 'idle': return 0
      case 'approving': return 25
      case 'redeeming': return 60
      case 'creating-record': return 90
      default: return 0
    }
  }

  // Get step description
  const getStepDescription = () => {
    switch (currentStep) {
      case 'approving': return 'Approving PLT tokens...'
      case 'redeeming': return 'Processing redemption on blockchain...'
      case 'creating-record': return 'Creating redemption record...'
      default: return ''
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to redeem &quot;{rewardTitle}&quot; for {requiredPoints} LOYAL points. This action cannot be
            undone. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <Progress value={getProgress()} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {getStepDescription()}
            </p>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStep === 'approving' ? 'Approving...' : 
               currentStep === 'redeeming' ? 'Redeeming...' : 
               currentStep === 'creating-record' ? 'Creating Record...' : 
               'Confirm'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
