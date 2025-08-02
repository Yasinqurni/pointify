"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, QrCode } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onShowQR: () => void
  rewardTitle: string
  redeemedPoints: number
  transactionHash?: string
}

export function SuccessModal({
  isOpen,
  onClose,
  onShowQR,
  rewardTitle,
  redeemedPoints,
  transactionHash,
}: SuccessModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Redemption Successful!
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {rewardTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                Successfully redeemed for {redeemedPoints} PLT points
              </p>
            </div>
            
            {transactionHash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 font-medium mb-1">
                  Transaction Hash:
                </p>
                <p className="text-xs font-mono text-green-600 break-all">
                  {transactionHash}
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Your claim code is ready! Click below to view your QR code.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={onShowQR} className="bg-green-600 hover:bg-green-700">
              <QrCode className="mr-2 h-4 w-4" />
              View QR Code
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 