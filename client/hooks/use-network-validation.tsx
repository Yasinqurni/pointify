"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { web3Service, LISK_SEPOLIA_CONFIG } from "@/lib/web3"

export function useNetworkValidation() {
  const { toast } = useToast()
  const { isConnected, networkId } = useWalletStore()
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(true)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (isConnected && networkId) {
      const correct = networkId === LISK_SEPOLIA_CONFIG.chainId
      setIsOnCorrectNetwork(correct)
      
      if (!correct) {
        toast({
          title: "Wrong Network",
          description: `Please switch to ${LISK_SEPOLIA_CONFIG.chainName} to use this app.`,
          variant: "destructive",
        })
      }
    }
  }, [isConnected, networkId, toast])

  const switchToCorrectNetwork = async () => {
    if (!isConnected) return false
    
    setIsValidating(true)
    try {
      await web3Service.switchToLiskSepolia()
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${LISK_SEPOLIA_CONFIG.chainName}`,
      })
      return true
    } catch (error: any) {
      toast({
        title: "Switch Failed",
        description: error.message || "Failed to switch network. Please switch manually.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsValidating(false)
    }
  }

  return {
    isOnCorrectNetwork,
    isValidating,
    switchToCorrectNetwork,
    correctNetworkName: LISK_SEPOLIA_CONFIG.chainName,
  }
} 