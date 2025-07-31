"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Home, Gift, QrCode, ListChecks, Wallet, ArrowUpCircle, Menu, LogOut, User, Store } from "lucide-react"
import { useWalletStore } from "@/lib/store"
import { UserInfoModal } from "@/components/user-info-modal"
import { useToast } from "@/components/ui/use-toast"
import { mockGetMerchantIDRXBalance, mockGetMerchantLoyalBalance, mockGetTotalLoyalRewarded } from "@/lib/ethers"
import { useEffect } from "react"

// Sidebar Context and Provider
import type React from "react"
import { createContext, useContext } from "react"

interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  return <SidebarContext.Provider value={{ isOpen, setIsOpen }}>{children}</SidebarContext.Provider>
}

const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// SidebarTrigger component
export const SidebarTrigger = () => {
  const { setIsOpen } = useSidebar()
  return (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(true)}>
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

// SidebarInset component
export const SidebarInset = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, setIsOpen } = useSidebar()
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <MerchantSidebarContent />
        </SheetContent>
      </Sheet>
      <div className="flex-1 md:ml-64">{children}</div>
    </>
  )
}

// Main Sidebar Content (reusable for Sheet and desktop)
const MerchantSidebarContent = () => {
  const pathname = usePathname()
  const {
    walletAddress,
    userType,
    disconnectWallet,
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

  const handleDisconnect = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    })
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/merchant/create-reward", icon: Gift, label: "Create Reward" },
    { href: "/merchant/scan-qr", icon: QrCode, label: "Scan QR" },
    { href: "/merchant/redeem-logs", icon: ListChecks, label: "Redemption Logs" },
    { href: "/merchant/loyal-dashboard", icon: User, label: "Loyalty Dashboard" },
    { href: "/merchant/top-up-loyal", icon: ArrowUpCircle, label: "Top Up LOYAL" },
  ]

  return (
    <div className="flex h-full flex-col border-r bg-background md:fixed md:inset-y-0 md:w-64">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Store className="h-6 w-6" />
          <span>Merchant Panel</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid items-start gap-2 px-4 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  {
                    "bg-muted text-primary": pathname === item.href,
                  },
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto border-t p-4">
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">IDRX Balance:</span>
            {loadingBalances ? (
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <span className="font-medium">{merchantIDRXBalance?.toFixed(2) || "0.00"}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">LOYAL Balance:</span>
            {loadingBalances ? (
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <span className="font-medium">{merchantLoyalBalance?.toFixed(2) || "0.00"}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Rewarded:</span>
            {loadingBalances ? (
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <span className="font-medium">{totalLoyalRewarded?.toFixed(2) || "0.00"}</span>
            )}
          </div>
        </div>
        <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsUserInfoModalOpen(true)}>
          <Wallet className="mr-2 h-4 w-4" /> Wallet Info
        </Button>
        <Button variant="secondary" className="mt-2 w-full" onClick={handleDisconnect}>
          <LogOut className="mr-2 h-4 w-4" /> Disconnect
        </Button>
      </div>

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
    </div>
  )
}

export function MerchantSidebar() {
  const { isOpen, setIsOpen } = useSidebar()
  return (
    <>
      <div className="hidden md:block">
        <MerchantSidebarContent />
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <MerchantSidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
