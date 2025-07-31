"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, Award, Settings, Sparkles, RefreshCcw, Package, Gift, Wallet, Coins, TrendingUp } from "lucide-react" // Updated icons
import { useWalletStore } from "@/lib/store"
import { UserInfoModal } from "@/components/user-info-modal"
import { useToast } from "@/components/ui/use-toast"
import { mockGetMerchantIDRXBalance, mockGetMerchantLoyalBalance, mockGetTotalLoyalRewarded } from "@/lib/ethers"
import { motion } from "framer-motion"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const MerchantSidebarContent = () => {
  const pathname = usePathname()
  const {
    walletAddress,
    userType,
    merchantIDRXBalance,
    merchantLoyalBalance,
    totalLoyalRewarded,
    setMerchantIDRXBalance,
    setMerchantLoyalBalance,
    setTotalLoyalRewarded,
  } = useWalletStore()
  const { toast } = useToast()
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false)
  const [loadingBalances, setLoadingBalances] = useState(true)

  useEffect(() => {
    const loadBalances = async () => {
      if (walletAddress && userType === "merchant") {
        setLoadingBalances(true)
        try {
          const idrx = await mockGetMerchantIDRXBalance(walletAddress)
          const loyal = await mockGetMerchantLoyalBalance(walletAddress)
          const totalRewarded = await mockGetTotalLoyalRewarded(walletAddress)
          setMerchantIDRXBalance(idrx)
          setMerchantLoyalBalance(loyal)
          setTotalLoyalRewarded(totalRewarded)
        } catch (error) {
          console.error("Failed to load merchant balances:", error)
          toast({
            title: "Error",
            description: "Failed to load merchant balances. Please refresh.",
            variant: "destructive",
          })
          setMerchantIDRXBalance(null)
          setMerchantLoyalBalance(null)
          setTotalLoyalRewarded(null)
        } finally {
          setLoadingBalances(false)
        }
      }
    }
    loadBalances()
  }, [walletAddress, userType, setMerchantIDRXBalance, setMerchantLoyalBalance, setTotalLoyalRewarded, toast])

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/merchant/reward-customer", icon: Sparkles, label: "Reward Customer" },
    { href: "/merchant/redemption/scan", icon: RefreshCcw, label: "Redeem Reward" },
    { href: "/merchant/rewards", icon: Package, label: "Manage Rewards" },
    { href: "/merchant/store-settings", icon: Settings, label: "Store Settings" },
    { href: "/merchant/loyalty-settings", icon: Gift, label: "Loyalty Rules" },
  ]

  return (
    <>
      <SidebarHeader className="border-b border-border/50 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-accent/50 transition-colors">
          <div className="relative">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-background shadow-sm"></div>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Merchant</span>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 sm:px-3 py-2 sm:py-4">
        <SidebarMenu>
          {navItems.map((item, index) => (
            <SidebarMenuItem key={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname.startsWith(item.href)}
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 active:scale-95"
                >
                  <Link href={item.href} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
                    <div className="relative">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 group-hover:scale-110" />
                      {pathname.startsWith(item.href) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 rounded-lg bg-primary/20"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                    <span className="font-medium text-sm sm:text-base">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/50 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {/* Quick Stats */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Wallet Balance</span>
              <span className="sm:hidden">Balance</span>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-muted-foreground">IDRX</span>
                </div>
                {loadingBalances ? (
                  <div className="h-2.5 w-8 sm:h-3 sm:w-12 animate-pulse rounded bg-muted" />
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-blue-600">{merchantIDRXBalance?.toFixed(2) || "0.00"}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">LOYAL</span>
                </div>
                {loadingBalances ? (
                  <div className="h-2.5 w-8 sm:h-3 sm:w-12 animate-pulse rounded bg-muted" />
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-green-600">{merchantLoyalBalance?.toFixed(2) || "0.00"}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Total Rewarded */}
          <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground">Total Rewarded</span>
            </div>
            {loadingBalances ? (
              <div className="h-3 w-12 sm:h-4 sm:w-16 animate-pulse rounded bg-muted" />
            ) : (
              <span className="text-sm sm:text-lg font-bold text-purple-600">{totalLoyalRewarded?.toFixed(2) || "0.00"}</span>
            )}
          </div>
        </div>
      </SidebarFooter>

      {walletAddress && (
        <UserInfoModal
          isOpen={isUserInfoModalOpen}
          onClose={() => setIsUserInfoModalOpen(false)}
          walletAddress={walletAddress}
          userType={userType || "merchant"}
          loyalBalance={merchantLoyalBalance}
          idrxBalance={merchantIDRXBalance}
          totalLoyalRewarded={totalLoyalRewarded}
        />
      )}
    </>
  )
}

export function AppMerchantSidebar() {
  return (
    <Sidebar className="border-r border-border/50 bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-sm">
      <MerchantSidebarContent />
      <SidebarRail />
    </Sidebar>
  )
}
