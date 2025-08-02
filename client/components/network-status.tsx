"use client"

import { useState, useEffect } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react"
import { web3Service, LISK_SEPOLIA_CONFIG } from "@/lib/web3"

export function NetworkStatus() {
  const { toast } = useToast()
  const [isSwitching, setIsSwitching] = useState(false)
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(true)
  
  const { isConnected, networkId } = useWalletStore()

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

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm">Not Connected</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isOnCorrectNetwork ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Lisk Sepolia</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Wrong Network</span>
          </div>
          <Button
            onClick={handleSwitchNetwork}
            disabled={isSwitching}
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
          >
            {isSwitching ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Wifi className="h-3 w-3" />
            )}
            Switch
          </Button>
        </div>
      )}
    </div>
  )
} 