"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, Network, Coins } from "lucide-react"
import { formatTokenBalance } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWalletStore } from "@/lib/store"

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
  userType: "user" | "merchant"
  loyalBalance: number | null
  idrxBalance?: number | null // Only for merchant
  totalLoyalRewarded?: number | null // Only for merchant
}

export function UserInfoModal({
  isOpen,
  onClose,
  walletAddress,
  userType,
  loyalBalance,
  idrxBalance,
  totalLoyalRewarded,
}: UserInfoModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { networkId, ethBalance } = useWalletStore()

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return "Unknown"
    switch (chainId) {
      case 1: return "Ethereum Mainnet"
      case 5: return "Goerli Testnet"
      case 11155111: return "Sepolia Testnet"
      case 137: return "Polygon"
      case 80001: return "Mumbai Testnet"
      default: return `Chain ID: ${chainId}`
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Your Wallet Info</DialogTitle>
          <DialogDescription>Details about your connected wallet and balances.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Wallet Address:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="px-2">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Role:</span>
            <span className="capitalize">{userType}</span>
          </div>
          
          {/* Network Information */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Network:</span>
            <div className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              <span className="text-sm">{getNetworkName(networkId)}</span>
            </div>
          </div>

          {/* ETH Balance */}
          {ethBalance && (
            <div className="flex items-center justify-between">
              <span className="font-medium">ETH Balance:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                <span>{parseFloat(ethBalance || "0").toFixed(4)} ETH</span>
              </div>
            </div>
          )}

          {loyalBalance !== null && (
            <div className="flex items-center justify-between">
              <span className="font-medium">LOYAL Balance:</span>
              <span>{formatTokenBalance(loyalBalance)}</span>
            </div>
          )}
          {userType === "merchant" && (
            <>
              {idrxBalance !== null && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">IDRX Balance:</span>
                  <span>{formatTokenBalance(idrxBalance)}</span>
                </div>
              )}
              {totalLoyalRewarded !== null && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total LOYAL Rewarded:</span>
                  <span>{formatTokenBalance(totalLoyalRewarded)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
