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
import { Loader2 } from "lucide-react"

interface RedeemConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  rewardTitle: string
  requiredPoints: number
  isLoading: boolean
}

export function RedeemConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  rewardTitle,
  requiredPoints,
  isLoading,
}: RedeemConfirmationModalProps) {
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
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
