"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppMerchantSidebar } from "@/components/app-merchant-sidebar"
import { Button } from "@/components/ui/button"
import { UserInfoModal } from "@/components/user-info-modal"
import { MerchantRegistrationModal } from "@/components/merchant-registration-modal"
import { NetworkStatus } from "@/components/network-status"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth"
import { balanceService } from "@/lib/balance-service"
import { LogOut, Wallet, User, Shield, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AppLayoutWrapperProps {
  children: React.ReactNode
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const {
    walletAddress,
    isConnected,
    userType,
    merchantLoyalBalance,
    merchantIDRXBalance,
    totalLoyalRewarded,
    userLoyalBalance,
    setMerchantIDRXBalance,
    setMerchantLoyalBalance,
    setTotalLoyalRewarded,
    setUserLoyalBalance,
    disconnectWallet,
  } = useWalletStore()
  const { toast } = useToast()
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false)
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [merchantData, setMerchantData] = useState<any>(null)
  const [checkingMerchant, setCheckingMerchant] = useState(false)
  const [showMerchantRegistration, setShowMerchantRegistration] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [balancesLoaded, setBalancesLoaded] = useState(false)
  const [merchantFound, setMerchantFound] = useState(false)
  const [authAttempted, setAuthAttempted] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getUserData()
        const authWalletAddress = authService.getWalletAddress()
        const authUserType = authService.getUserType()
        
        // If authenticated user data doesn't match current wallet, logout
        if (authWalletAddress && walletAddress && authWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          console.log("Wallet address mismatch, logging out")
          await authService.logout()
          disconnectWallet()
          return
        }
        
        // If we have authenticated data but no wallet connection, connect wallet
        if (authWalletAddress && !isConnected) {
          console.log("Restoring wallet connection from auth")
          // This would need to be handled by the wallet connection logic
        }
      }
    }

    checkAuthStatus()
  }, [walletAddress, isConnected])

  // Reset balances loaded when wallet changes
  useEffect(() => {
    setBalancesLoaded(false)
    setLoadingBalances(true)
    setAuthAttempted(false) // Reset auth attempt when wallet changes
  }, [walletAddress])

  // Combined effect for merchant data and registration modal
  useEffect(() => {
    if (merchantData) {
      console.log("✅ Merchant data detected, ensuring registration modal is hidden")
      setShowMerchantRegistration(false)
      setMerchantFound(true)
    }
  }, [merchantData])

  // Load balances only when wallet and userType are available
  useEffect(() => {
    const loadBalances = async () => {
      if (walletAddress && userType && !balancesLoaded) {
        setLoadingBalances(true)
        try {
          // Use the new balance service to fetch real IDRX balances
          if (userType === 'merchant' || userType === 'user') {
            await balanceService.refreshBalancesImmediate(walletAddress, userType)
          }
        } catch (error) {
          console.error('Failed to load balances:', error)
        } finally {
          setLoadingBalances(false)
          setBalancesLoaded(true)
        }
      }
    }

    loadBalances()
  }, [walletAddress, userType, balancesLoaded])

  // Handle authentication on client side only
  useEffect(() => {
    // Only run authentication on client side
    if (typeof window === 'undefined') {
      return
    }

    const handleAuthentication = async () => {
      if (!walletAddress || !userType || isAuthenticating || authAttempted) {
        return
      }

      console.log("🔄 Starting authentication for:", { walletAddress, userType })
      setIsAuthenticating(true)
      setAuthAttempted(true)

      try {
        // Check if already authenticated
        if (authService.isAuthenticated()) {
          console.log("✅ Already authenticated")
          
          // For merchants, still check registration status
          if (userType === "merchant") {
            try {
              const response = await authService.checkMerchant(walletAddress)
              if (response?.data?.exists && response.data.merchant) {
                setMerchantData(response.data.merchant)
                setMerchantFound(true)
                setShowMerchantRegistration(false)
              } else {
                setShowMerchantRegistration(true)
              }
            } catch (error) {
              console.error("❌ Error checking merchant:", error)
              setShowMerchantRegistration(true)
            }
          }
          return
        }

        // Try to authenticate - only merchant login now
        console.log("🔐 Attempting merchant authentication...")
        
        if (userType === "merchant") {
          // Check if merchant exists first
          const merchantCheck = await authService.checkMerchant(walletAddress)
          
          if (merchantCheck?.data?.exists && merchantCheck.data.merchant) {
            // Merchant exists, try to login
            try {
              const loginResult = await authService.login(walletAddress)
              setMerchantData(merchantCheck.data.merchant)
              setMerchantFound(true)
              setShowMerchantRegistration(false)
              
              // Quick verification
              if (!authService.isAuthenticated()) {
                toast({
                  title: "Authentication Error",
                  description: "Failed to save authentication tokens. Please try again.",
                  variant: "destructive",
                })
              }
              
            } catch (loginError: any) {
              console.error("❌ Merchant login failed:", loginError)
              toast({
                title: "Login Failed",
                description: "Failed to authenticate. Please try connecting again.",
                variant: "destructive",
              })
            }
          } else {
            // Merchant doesn't exist, show registration
            setShowMerchantRegistration(true)
          }
        }
      } catch (error: any) {
        console.error("❌ Authentication process failed:", error)
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        })
      } finally {
        setIsAuthenticating(false)
      }
    }

    handleAuthentication()
  }, [walletAddress, userType, authAttempted])

  // Handle redirects after authentication
  useEffect(() => {
    if (!walletAddress || !userType || typeof window === 'undefined') {
      return
    }

    const currentPath = window.location.pathname
    const isAuthenticated = authService.isAuthenticated()
    
    console.log("🔀 Redirect check:", { currentPath, userType, isAuthenticated, merchantData: !!merchantData })
    
    // Only redirect from landing page for merchants
    if (currentPath === '/' && userType === "merchant" && isAuthenticated && merchantData) {
      console.log("🔀 Redirecting merchant to dashboard")
      window.location.href = '/dashboard'
    }
  }, [walletAddress, userType, merchantData])

  const handleDisconnect = () => {
    authService.logout()
    disconnectWallet()
    setIsUserInfoModalOpen(false)
    // Redirect to landing page
    window.location.href = "/"
  }

  const handleMerchantRegistrationSuccess = async (merchantData: any) => {
    console.log("Merchant registration successful:", merchantData)
    setMerchantData(merchantData)
    setShowMerchantRegistration(false)
    
    // Redirect to merchant dashboard after successful registration
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
    
    toast({
      title: "Registration Successful!",
      description: "Your merchant account has been created and you are now logged in.",
    })
  }

  const handleMerchantRegistrationCancel = () => {
    setShowMerchantRegistration(false)
    disconnectWallet()
  }

  if (checkingMerchant || isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            {isAuthenticating ? "Authenticating..." : "Checking merchant registration..."}
          </p>
        </div>
      </div>
    )
  }


  // Don't show registration modal if merchant data exists
  if (merchantData) {
    // Merchant data exists, proceed to main app
  }

  if (showMerchantRegistration && !merchantFound && !merchantData) {
    return (
      <MerchantRegistrationModal
        walletAddress={walletAddress || ""}
        onSuccess={handleMerchantRegistrationSuccess}
        onCancel={handleMerchantRegistrationCancel}
      />
    )
  }

  // If we're on the landing page and wallet is not connected, just render children without any wrapper
  if (!walletAddress || !isConnected) {
    return children
  }

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {userType === "merchant" && (
            <AppMerchantSidebar />
          )}
          <div className="flex flex-1 flex-col w-full min-w-0">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold text-sm sm:text-base">Pointify</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <NetworkStatus />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserInfoModalOpen(true)}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            </header>
            <SidebarInset>
              <div className="flex flex-1 flex-col w-full min-w-0">
                {children}
              </div>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>

      <UserInfoModal
        isOpen={isUserInfoModalOpen}
        onClose={() => setIsUserInfoModalOpen(false)}
        walletAddress={walletAddress || ""}
        userType={userType || "user"}
        loyalBalance={userType === "merchant" ? (merchantLoyalBalance || 0) : (userLoyalBalance || 0)}
        idrxBalance={userType === "merchant" ? (merchantIDRXBalance || 0) : undefined}
        totalLoyalRewarded={userType === "merchant" ? (totalLoyalRewarded || 0) : undefined}
      />
    </>
  )
}
