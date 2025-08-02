"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { xellarService, LISK_SEPOLIA_CONFIG } from "@/lib/xellar"

interface WalletConnectProps {
  userType: "user" | "merchant"
  children: React.ReactNode
}

export function WalletConnect({ userType, children }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false)
  const [switchingNetwork, setSwitchingNetwork] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const connectWallet = useWalletStore((state) => state.connectWallet)
  const setNetworkId = useWalletStore((state) => state.setNetworkId)
  const setEthBalance = useWalletStore((state) => state.setEthBalance)
  const { toast } = useToast()

  const handleConnect = async () => {
    console.log("🔘 WalletConnect button clicked with userType:", userType)
    setConnecting(true)
    setWalletError(null)
    
    try {
      // Connect to wallet using Xellar
      const { address, provider } = await xellarService.connect()
      
      // Check if we're switching networks
      if (switchingNetwork) {
        setSwitchingNetwork(false)
        toast({
          title: "Network Switched",
          description: `Successfully switched to ${LISK_SEPOLIA_CONFIG.chainName}`,
        })
      }
      
      // Get network and balance
      const network = await xellarService.getNetwork()
      const balance = await xellarService.getBalance(address)
      
      // Connect wallet with real data
      console.log("🔗 Connecting wallet with userType:", userType)
      connectWallet(address, userType, network.chainId, balance)
      
      // Set up event listeners
      xellarService.onAccountsChanged((accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected.",
          })
        } else {
          // User switched accounts
          toast({
            title: "Account Changed",
            description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          })
        }
      })

      xellarService.onChainChanged((chainId: string) => {
        const newChainId = parseInt(chainId, 16)
        setNetworkId(newChainId)
        
        if (newChainId === LISK_SEPOLIA_CONFIG.chainId) {
          toast({
            title: "Network Connected",
            description: `Connected to ${LISK_SEPOLIA_CONFIG.chainName}`,
          })
        } else {
        toast({
            title: "Wrong Network",
            description: `Please switch to ${LISK_SEPOLIA_CONFIG.chainName}`,
            variant: "destructive",
        })
        }
      })

      toast({
        title: "Wallet Connected!",
        description: `Successfully connected as ${userType} to ${address.slice(0, 6)}...${address.slice(-4)} on ${LISK_SEPOLIA_CONFIG.chainName}.`,
      })
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      
      // Handle specific network switching errors
      if (error.message.includes('switch') || error.message.includes('network')) {
        setSwitchingNetwork(true)
        toast({
          title: "Switching Network",
          description: "Please approve the network switch in your wallet.",
        })
        
        // Retry connection after a short delay
        setTimeout(async () => {
          try {
            await handleConnect()
          } catch (retryError: any) {
            setSwitchingNetwork(false)
            setWalletError(retryError.message || "Failed to connect wallet")
            toast({
              title: "Connection Failed",
              description: retryError.message || "Could not connect to wallet. Please try again.",
              variant: "destructive",
            })
          }
        }, 2000)
        return
      }
      
      setWalletError(error.message || "Failed to connect wallet")
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="space-y-3">
      {walletError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{walletError}</span>
        </div>
      )}
      
      <motion.button
        onClick={handleConnect}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg text-lg font-semibold
                  bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all duration-200"
        disabled={connecting || switchingNetwork}
      >
        {connecting || switchingNetwork ? (
          <span className="flex items-center gap-2">
            {switchingNetwork ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Wallet className="animate-pulse" />
            )}
            {switchingNetwork ? "Switching Network..." : "Connecting..."}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wallet /> {children}
          </span>
        )}
      </motion.button>
      
      {switchingNetwork && (
        <div className="text-center text-sm text-muted-foreground">
          Please approve the network switch in your wallet
        </div>
      )}
    </div>
  )
}
