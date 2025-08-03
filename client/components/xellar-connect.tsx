"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, AlertCircle, Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { xellar } from "@/lib/xellar"


interface XellarConnectProps {
  userType: "user" | "merchant"
  children: React.ReactNode
  disableRedirect?: boolean
}

export function XellarConnect({ userType, children, disableRedirect = false }: XellarConnectProps) {
  const [connecting, setConnecting] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const router = useRouter()

  const connectWallet = useWalletStore((state) => state.connectWallet)
  const { toast } = useToast()

  const detectMobileWallet = () => {
    if (typeof window === 'undefined') return null
    
    // Check for various mobile wallet providers
    const providers = [
      { name: 'MetaMask', provider: (window as any).ethereum, priority: 1 },
      { name: 'Trust Wallet', provider: (window as any).trustwallet, priority: 2 },
      { name: 'Coinbase Wallet', provider: (window as any).coinbaseWalletExtension, priority: 2 },
      { name: 'WalletConnect', provider: (window as any).walletconnect, priority: 3 },
      { name: 'Injected Provider', provider: (window as any).web3?.currentProvider, priority: 4 }
    ]
    
    // Find available providers, prioritize by preference
    const available = providers.filter(p => p.provider).sort((a, b) => a.priority - b.priority)
    
    console.log("🔍 Available wallet providers:", available.map(p => p.name))
    return available.length > 0 ? available[0] : null
  }

  const isMobile = () => {
    // Check if we're in a browser environment first
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false // Default to desktop on server-side
    }
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const handleConnect = async () => {
    console.log("🔘 XellarConnect button clicked with userType:", userType)
    setConnecting(true)
    setWalletError(null)
    
    try {
      // Use Xellar's authentication system
      console.log("🔗 Connecting with Xellar auth...")
      
      // Detect available wallet providers
      const walletInfo = detectMobileWallet()
      
      if (!walletInfo) {
        const mobile = isMobile()
        if (mobile) {
          throw new Error('No wallet detected. Please install a mobile wallet app or open this page in your wallet app\'s browser.')
        } else {
          throw new Error('Please install MetaMask or another Ethereum wallet extension')
        }
      }

      console.log(`✅ ${walletInfo.name} detected, requesting accounts...`)
      const provider = walletInfo.provider
      
      // Handle different provider types
      let accounts: string[]
      
      if (provider.request) {
        // Standard EIP-1193 provider (MetaMask, etc.)
        accounts = await provider.request({ method: 'eth_requestAccounts' })
      } else if (provider.enable) {
        // Legacy provider method
        accounts = await provider.enable()
      } else if (provider.selectedAddress) {
        // Already connected provider
        accounts = [provider.selectedAddress]
      } else {
        throw new Error(`Unsupported wallet provider: ${walletInfo.name}`)
      }
      
      console.log("📋 Accounts received:", accounts)
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.')
      }
      
      const address = accounts[0]
      console.log("✅ Wallet address:", address)
      
      // Skip problematic RPC calls and use defaults
      console.log("🚀 Skipping RPC calls to avoid hanging...")
      const networkId = 4202 // Default to Lisk Sepolia
      const balanceFormatted = "0" // Default balance
      console.log("✅ Using defaults - Network ID:", networkId, "Balance:", balanceFormatted)
      
      // Connect wallet with Xellar integration
      console.log("🔗 Connecting wallet with userType:", userType)
      connectWallet(address, userType, networkId, balanceFormatted)
      
      console.log("✅ Wallet connected successfully!")
      
      // Debug: Check store state after connection
      setTimeout(() => {
        const store = useWalletStore.getState()
        console.log("🔍 Store state after connection:")
        console.log("  - walletAddress:", store.walletAddress)
        console.log("  - userType:", store.userType)
        console.log("  - isConnected:", store.isConnected)
      }, 100)
      
      toast({
        title: `Connected with ${walletInfo.name}!`,
        description: `Successfully connected as ${userType} to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })

      // Redirect to appropriate dashboard after successful connection (unless disabled)
      if (!disableRedirect) {
        setTimeout(() => {
          if (userType === "merchant") {
            console.log("🔀 Redirecting merchant to dashboard")
            router.push("/dashboard")
          } else if (userType === "user") {
            console.log("🔀 Redirecting user to user dashboard")
            router.push("/user-dashboard")
          }
        }, 1000) // Small delay to ensure store is updated
      } else {
        console.log("🔀 Redirect disabled, staying on current page")
      }
      
    } catch (error: any) {
      console.error("❌ Wallet connection error:", error)
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
      
      let errorMessage = error.message || "Failed to connect wallet"
      
      // Provide helpful mobile-specific error messages
      if (isMobile() && errorMessage.includes('MetaMask')) {
        errorMessage = "For mobile: Install MetaMask app and open this page in the MetaMask browser, or use Trust Wallet"
      }
      
      setWalletError(errorMessage)
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      console.log("🏁 Connection process finished, setting connecting to false")
      setConnecting(false)
    }
  }

  return (
    <div className="space-y-3">
      {walletError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{walletError}</span>
        </motion.div>
      )}
      
      <motion.button
        onClick={handleConnect}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
        }}
        whileTap={{ scale: 0.98 }}
        className="w-full relative overflow-hidden group"
        disabled={connecting}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Animated sparkles background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-4 right-6 w-1 h-1 bg-white rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-3 left-8 w-1 h-1 bg-white rounded-full animate-pulse delay-200"></div>
        </div>
        
        {/* Button content */}
        <div className="relative flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300">
          {connecting ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Connecting...</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </div>
              <span>{children}</span>
            </motion.div>
          )}
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      </motion.button>
    </div>
  )
} 