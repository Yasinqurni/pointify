"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { web3Service } from "@/lib/web3"

interface WalletConnectProps {
  userType: "user" | "merchant"
  children: React.ReactNode
}

export function WalletConnect({ userType, children }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const connectWallet = useWalletStore((state) => state.connectWallet)
  const setNetworkId = useWalletStore((state) => state.setNetworkId)
  const setEthBalance = useWalletStore((state) => state.setEthBalance)
  const { toast } = useToast()

  const handleConnect = async () => {
    setConnecting(true)
    setWalletError(null)
    
    try {
      // Connect to real wallet
      const { address, provider } = await web3Service.connect()
      
      // Get network and balance
      const network = await web3Service.getNetwork()
      const balance = await web3Service.getBalance(address)
      
      // Connect wallet with real data
      connectWallet(address, userType, network.chainId, balance)
      
      // Set up event listeners
      web3Service.onAccountsChanged((accounts) => {
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

      web3Service.onChainChanged((chainId) => {
        const newChainId = parseInt(chainId, 16)
        setNetworkId(newChainId)
        toast({
          title: "Network Changed",
          description: `Switched to network ID: ${newChainId}`,
        })
      })

      toast({
        title: "Wallet Connected!",
        description: `Successfully connected as ${userType} to ${address.slice(0, 6)}...${address.slice(-4)}.`,
      })
    } catch (error: any) {
      console.error("Wallet connection error:", error)
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
        disabled={connecting}
      >
        {connecting ? (
          <span className="flex items-center gap-2">
            <Wallet className="animate-pulse" /> Connecting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wallet /> {children}
          </span>
        )}
      </motion.button>
    </div>
  )
}
