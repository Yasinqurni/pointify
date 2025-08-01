"use client"

import { useState, useEffect } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Wallet, 
  LogOut, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  ExternalLink 
} from "lucide-react"
import { web3Service, LISK_SEPOLIA_CONFIG } from "@/lib/web3"


export function WalletInfo() {
  const { toast } = useToast()
  const [isSwitching, setIsSwitching] = useState(false)
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(true)
  
  const { 
    walletAddress, 
    isConnected, 
    userType, 
    merchantIDRXBalance,
    networkId, 
    ethBalance,
    disconnectWallet,
  } = useWalletStore()

  useEffect(() => {
    if (isConnected && networkId) {
      setIsOnCorrectNetwork(networkId === LISK_SEPOLIA_CONFIG.chainId)
    }
  }, [isConnected, networkId])

  const handleSwitchNetwork = async () => {
    setIsSwitching(true)
    try {
      await web3Service.switchToLiskSepolia()
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${LISK_SEPOLIA_CONFIG.chainName}`,
      })
    } catch (error: any) {
      toast({
        title: "Switch Failed",
        description: error.message || "Failed to switch network. Please switch manually.",
        variant: "destructive",
      })
    } finally {
      setIsSwitching(false)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  if (!isConnected || !walletAddress) {
    return null
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
          Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Address</p>
          <p className="font-mono text-sm break-all">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          </div>

          {/* User Type */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">User Type</p>
          <Badge variant={userType === "merchant" ? "default" : "secondary"}>
            {userType === "merchant" ? "Merchant" : "Customer"}
          </Badge>
        </div>

        {/* Network Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Network</p>
          <div className="flex items-center gap-2">
            {isOnCorrectNetwork ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">
              {isOnCorrectNetwork 
                ? LISK_SEPOLIA_CONFIG.chainName 
                : `Network ID: ${networkId}`
              }
            </span>
            {!isOnCorrectNetwork && (
              <Badge variant="destructive" className="text-xs">
                Wrong Network
              </Badge>
            )}
          </div>
            </div>

        {/* Balance */}
        {ethBalance && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <p className="text-sm">
              {parseFloat(ethBalance).toFixed(4)} {LISK_SEPOLIA_CONFIG.nativeCurrency.symbol}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isOnCorrectNetwork && (
            <Button
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              {isSwitching ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Switch to Lisk Sepolia
            </Button>
          )}
          
          <Button
            onClick={handleDisconnect}
            size="sm"
            variant="destructive"
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>

        {/* Explorer Link */}
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              window.open(
                `${LISK_SEPOLIA_CONFIG.blockExplorerUrls[0]}/address/${walletAddress}`,
                '_blank'
              )
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
        </div>
        </CardContent>
      </Card>

      {/* IDRX Balance Display for Merchants */}
      {userType === 'merchant' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">IDRX Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance:</span>
                <span className="font-medium text-lg">{merchantIDRXBalance?.toFixed(2) || "0.00"} IDRX</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contract:</span>
                <span className="text-xs font-mono">0x722...AEfD8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 