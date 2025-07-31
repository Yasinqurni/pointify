"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppMerchantSidebar } from "@/components/app-merchant-sidebar"
import { Button } from "@/components/ui/button"
import { UserInfoModal } from "@/components/user-info-modal"
import { useToast } from "@/components/ui/use-toast"
import {
  mockGetMerchantIDRXBalance,
  mockGetMerchantLoyalBalance,
  mockGetTotalLoyalRewarded,
  mockGetUserLoyalBalance,
} from "@/lib/ethers"
import { LogOut, Wallet, User, Shield, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

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

  useEffect(() => {
    const loadBalances = async () => {
      if (walletAddress) {
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
          setMerchantIDRXBalance(null)
          setMerchantLoyalBalance(null)
          setTotalLoyalRewarded(null)
          setUserLoyalBalance(null)
        } finally {
          setLoadingBalances(false)
        }
      }
    }
    loadBalances()
  }, [
    walletAddress,
    userType,
    setMerchantIDRXBalance,
    setMerchantLoyalBalance,
    setTotalLoyalRewarded,
    setUserLoyalBalance,
    toast,
  ])

  let headerTitle = "Pointify"
  let headerSubtitle = "Loyalty Platform"
  if (isConnected) {
    if (userType === "merchant") {
      headerTitle = "Merchant Dashboard"
      headerSubtitle = "Manage your loyalty program"
    } else if (userType === "user") {
      headerTitle = ""
      headerSubtitle = ""
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    })
  }

  if (!isConnected) {
    return <>{children}</>
  }

  // Conditional rendering based on userType
  if (userType === "merchant") {
    return (
      <SidebarProvider>
        <AppMerchantSidebar />
        <SidebarInset>
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="z-30 flex h-16 sm:h-20 items-center gap-3 sm:gap-6 border-b border-border/50 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 shadow-sm"
          >
            <SidebarTrigger className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20 hover:bg-primary/20 transition-all duration-200" />
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 rounded-full bg-green-500 border-2 border-background shadow-sm"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{headerTitle}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">{headerSubtitle}</p>
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setIsUserInfoModalOpen(true)} 
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 text-xs sm:text-sm"
                >
                  <Wallet className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Wallet Info</span>
                  <span className="sm:hidden">Wallet</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleDisconnect}
                  className="rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 text-red-600 hover:from-red-500/20 hover:to-red-600/20 hover:border-red-500/30 transition-all duration-200 text-xs sm:text-sm"
                >
                  <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 
                  <span className="hidden sm:inline">Disconnect</span>
                  <span className="sm:hidden">Disconnect</span>
                </Button>
              </motion.div>
            </div>
          </motion.header>
          
          <main className="flex flex-1 flex-col gap-4 p-4 pt-8 md:gap-8 md:p-8 md:pt-12">{children}</main>
        </SidebarInset>

        {walletAddress && (
          <UserInfoModal
            isOpen={isUserInfoModalOpen}
            onClose={() => setIsUserInfoModalOpen(false)}
            walletAddress={walletAddress}
            userType={userType || "merchant"}
            loyalBalance={userType === "user" ? userLoyalBalance : merchantLoyalBalance}
            idrxBalance={userType === "merchant" ? merchantIDRXBalance : null}
            totalLoyalRewarded={userType === "merchant" ? totalLoyalRewarded : null}
          />
        )}
      </SidebarProvider>
    )
  }

  // For userType === "user" or null (if connected but type not set yet, though useEffect handles this)
  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-30 flex h-20 items-center gap-6 border-b border-border/50 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm px-6 py-4 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background shadow-sm"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{headerTitle}</h1>
            <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setIsUserInfoModalOpen(true)} 
              variant="outline"
              className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallet Info
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="secondary" 
              onClick={handleDisconnect}
              className="rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 text-red-600 hover:from-red-500/20 hover:to-red-600/20 hover:border-red-500/30 transition-all duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" /> 
              Disconnect
            </Button>
          </motion.div>
        </div>
      </motion.header>
      
      <main className="flex flex-1 flex-col gap-4 p-4 pt-8 md:gap-8 md:p-8 md:pt-12">{children}</main>

      {walletAddress && (
        <UserInfoModal
          isOpen={isUserInfoModalOpen}
          onClose={() => setIsUserInfoModalOpen(false)}
          walletAddress={walletAddress}
          userType={userType || "user"}
          loyalBalance={userType === "user" ? userLoyalBalance : merchantLoyalBalance}
          idrxBalance={userType === "merchant" ? merchantIDRXBalance : null}
          totalLoyalRewarded={userType === "merchant" ? totalLoyalRewarded : null}
        />
      )}
    </>
  )
}
