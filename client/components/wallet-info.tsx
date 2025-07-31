"use client"

import { useWalletStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Copy, LogOut, Network, Coins } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export function WalletInfo() {
  const { 
    walletAddress, 
    isConnected, 
    userType, 
    networkId, 
    ethBalance,
    disconnectWallet 
  } = useWalletStore()
  const { toast } = useToast()

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      })
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from your wallet.",
    })
  }

  if (!isConnected || !walletAddress) {
    return null
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Connected Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* User Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type:</span>
            <span className="text-sm font-medium capitalize">
              {userType === "merchant" ? "Merchant" : "User"}
            </span>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <div className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              <span className="text-sm font-medium">
                {getNetworkName(networkId)}
              </span>
            </div>
          </div>

          {/* ETH Balance */}
          {ethBalance && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ETH Balance:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                <span className="text-sm font-medium">
                  {parseFloat(ethBalance).toFixed(4)} ETH
                </span>
              </div>
            </div>
          )}

          {/* Disconnect Button */}
          <Button
            variant="outline"
            onClick={handleDisconnect}
            className="w-full mt-4"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
} 