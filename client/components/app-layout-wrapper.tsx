"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppMerchantSidebar } from "@/components/app-merchant-sidebar"
import { Button } from "@/components/ui/button"
import { UserInfoModal } from "@/components/user-info-modal"
import { MerchantRegistrationModal } from "@/components/merchant-registration-modal"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth"
import {
  mockGetMerchantIDRXBalance,
  mockGetMerchantLoyalBalance,
  mockGetTotalLoyalRewarded,
  mockGetUserLoyalBalance,
} from "@/lib/ethers"
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
  }, [walletAddress])

  // Hide registration modal when merchant data exists
  useEffect(() => {
    if (merchantData && showMerchantRegistration) {
      console.log("✅ Force hiding registration modal - merchant data exists")
      setShowMerchantRegistration(false)
    }
  }, [merchantData, showMerchantRegistration])

  // Force hide registration modal if merchant data exists
  useEffect(() => {
    if (merchantData) {
      console.log("✅ Merchant data detected, ensuring registration modal is hidden")
      setShowMerchantRegistration(false)
      setMerchantFound(true)
    }
  }, [merchantData])

  // Force hide registration modal if merchant is found
  useEffect(() => {
    if (merchantFound) {
      console.log("✅ Merchant found, ensuring registration modal is hidden")
      setShowMerchantRegistration(false)
    }
  }, [merchantFound])

  useEffect(() => {
    const loadBalances = async () => {
      if (walletAddress && !balancesLoaded) {
        setLoadingBalances(true)
        try {
          if (userType === "merchant") {
            const idrx = await mockGetMerchantIDRXBalance(walletAddress)
            const loyal = await mockGetMerchantLoyalBalance(walletAddress)
            const totalRewarded = await mockGetTotalLoyalRewarded(walletAddress)
            setMerchantIDRXBalance(idrx)
            setMerchantLoyalBalance(loyal)
            setTotalLoyalRewarded(totalRewarded)
          } else if (userType === "user") {
            const loyal = await mockGetUserLoyalBalance(walletAddress)
            setUserLoyalBalance(loyal)
          }
        } catch (error) {
          console.error("Failed to load balances:", error)
          toast({
            title: "Error",
            description: "Failed to load wallet balances. Please refresh.",
            variant: "destructive",
          })
          setMerchantIDRXBalance(0)
          setMerchantLoyalBalance(0)
          setTotalLoyalRewarded(0)
          setUserLoyalBalance(0)
        } finally {
          setLoadingBalances(false)
          setBalancesLoaded(true)
        }
      }
    }
    
    loadBalances()
  }, [walletAddress, userType, balancesLoaded])

  // Check if merchant is registered and authenticate if needed
  useEffect(() => {
    const checkMerchantRegistration = async () => {
      console.log("=== Starting merchant registration check ===")
      console.log("walletAddress:", walletAddress)
      console.log("userType:", userType)
      console.log("checkingMerchant:", checkingMerchant)
      console.log("isAuthenticating:", isAuthenticating)
      console.log("merchantData:", merchantData)
      console.log("showMerchantRegistration:", showMerchantRegistration)
      
      if (walletAddress && userType === "merchant" && !checkingMerchant && !isAuthenticating) {
        console.log("✅ Conditions met, starting merchant registration check...")
        setCheckingMerchant(true)
        setMerchantData(null) // Reset merchant data to ensure fresh check
        setShowMerchantRegistration(false) // Reset registration modal state
        setMerchantFound(false) // Reset merchant found state
        
        try {
          // Always check merchant registration first
          console.log("🔍 Performing merchant registration check...")
          console.log("🔍 About to call authService.checkMerchant with walletAddress:", walletAddress)
          try {
            const response = await authService.checkMerchant(walletAddress)
            console.log("📋 Merchant check response:", response)
            console.log("📋 Response type:", typeof response)
            console.log("📋 Response keys:", Object.keys(response))
            
            if (response && response.data && response.data.exists && response.data.merchant) {
              console.log("✅ Merchant exists, setting data:", response.data.merchant)
              console.log("✅ Response.data.merchant type:", typeof response.data.merchant)
              console.log("✅ Response.data.merchant keys:", Object.keys(response.data.merchant))
              setMerchantData(response.data.merchant)
              setMerchantFound(true)
              setShowMerchantRegistration(false) // Explicitly hide registration modal
              console.log("✅ Registration modal should be hidden now")
              
              // Force immediate state update
              setTimeout(() => {
                setShowMerchantRegistration(false)
                setMerchantFound(true)
              }, 0)
              
              return // Exit early to prevent further processing
            } else if (response && response.data && response.data.exists === false) {
              // Merchant not registered, show registration modal
              console.log("❌ Merchant not registered, showing registration modal")
              setShowMerchantRegistration(true)
            } else {
              // Unexpected response, assume merchant needs to register
              console.log("❌ Unexpected response, showing registration modal")
              console.log("❌ Response:", response)
              setShowMerchantRegistration(true)
            }
          } catch (error) {
            console.error("❌ Error in merchant check:", error)
            setShowMerchantRegistration(true)
          }

          // Then check if user is authenticated
          if (!authService.isAuthenticated()) {
            console.log("🔐 User not authenticated, attempting login...")
            setIsAuthenticating(true)
            
            try {
              console.log("🔍 Attempting login for wallet:", walletAddress)
              const loginResult = await authService.login(walletAddress)
              console.log("✅ Login successful:", loginResult)
            } catch (loginError: any) {
              console.log("❌ Login failed:", loginError.message)
              console.log("🔍 Checking if merchant exists...")
              
              // Check if merchant exists
              const merchantCheck = await authService.checkMerchant(walletAddress)
              console.log("🔍 Merchant check result:", merchantCheck)
              
              if (merchantCheck && merchantCheck.data && merchantCheck.data.exists && merchantCheck.data.merchant) {
                console.log("✅ Merchant exists, attempting login again...")
                // Try login again - maybe the signature was the issue
                await authService.login(walletAddress)
              } else {
                console.log("❌ Merchant not registered, showing registration modal")
                setShowMerchantRegistration(true)
                return
              }
            } finally {
              setIsAuthenticating(false)
            }
          } else {
            console.log("✅ User already authenticated")
          }
        } catch (error: any) {
          console.error("❌ Failed to check merchant registration:", error)
          
          // Show error message to user
          if (error.message && error.message.includes("Merchant already registered")) {
            toast({
              title: "Wallet Already Registered",
              description: error.message,
              variant: "destructive",
            })
          } else {
            // For other errors, show generic message and registration modal
            toast({
              title: "Registration Error",
              description: "Failed to check merchant status. Please try registering again.",
              variant: "destructive",
            })
            setShowMerchantRegistration(true)
          }
        } finally {
          setCheckingMerchant(false)
          console.log("=== Finished merchant registration check ===")
          console.log("📊 Final merchantData:", merchantData)
          console.log("📊 Final showMerchantRegistration:", showMerchantRegistration)
        }
      }
    }

    checkMerchantRegistration()
  }, [walletAddress, userType]) // Removed checkingMerchant and isAuthenticating from dependencies

  const handleDisconnect = () => {
    authService.logout()
    disconnectWallet()
    setIsUserInfoModalOpen(false)
  }

  const handleMerchantRegistrationSuccess = async (merchantData: any) => {
    console.log("Merchant registration successful:", merchantData)
    setMerchantData(merchantData)
    setShowMerchantRegistration(false)
    
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
    console.log("✅ Merchant data exists, proceeding to main app")
  }

  console.log("🔍 Modal check - showMerchantRegistration:", showMerchantRegistration, "merchantFound:", merchantFound, "merchantData:", merchantData)

  if (showMerchantRegistration && !merchantFound && !merchantData) {
    console.log("❌ Showing registration modal - no merchant data")
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
        <div className="flex h-screen w-full min-h-screen">
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
              <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0">
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
