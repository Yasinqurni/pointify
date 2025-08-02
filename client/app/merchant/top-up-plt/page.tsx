"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { balanceService } from "@/lib/balance-service"
import { topUpPlt, getPltBalance, checkApprovedMerchant, SwapStatus } from "@/lib/plt-swap-contract"
import { approveMerchant } from "@/lib/merchant-approval"
import { ethers } from "ethers"

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowUpCircle, ArrowLeft } from "lucide-react"
import { TopUpConfirmationModal } from "@/components/top-up-confirmation-modal"

export default function TopUpPltPage() {
  const { walletAddress, userType, merchantIDRXBalance, setMerchantIDRXBalance, setMerchantLoyalBalance } =
    useWalletStore()
  const { toast } = useToast()

  const [topUpAmount, setTopUpAmount] = useState("")
  const [loadingIDRX, setLoadingIDRX] = useState(true)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [isToppingUp, setIsToppingUp] = useState(false)
  const [swapStatus, setSwapStatus] = useState<SwapStatus | null>(null)
  const [pltBalance, setPltBalance] = useState<number>(0)
  const [loadingPltBalance, setLoadingPltBalance] = useState(true)

  const [isApprovedMerchant, setIsApprovedMerchant] = useState<boolean | null>(null)
  const [loadingApproval, setLoadingApproval] = useState(true)
  const [isApproving, setIsApproving] = useState(false)

  useEffect(() => {
    const loadBalances = async () => {
      if (walletAddress && userType === "merchant") {
        setLoadingIDRX(true)
        setLoadingPltBalance(true)
        
        try {
          // Load IDRX balance
          await balanceService.refreshBalances(walletAddress, 'merchant')
          
          // Load PLT balance
          const pltBal = await getPltBalance(walletAddress)
          setPltBalance(pltBal)
          
          // Check merchant approval status
          const approved = await checkApprovedMerchant(walletAddress)
          setIsApprovedMerchant(approved)
          
        } catch (error) {
          console.error("Failed to fetch balances:", error)
          setMerchantIDRXBalance(0)
          setPltBalance(0)
          toast({
            title: "Error",
            description: "Failed to load balances. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoadingIDRX(false)
          setLoadingPltBalance(false)
          setLoadingApproval(false)
        }
      }
    }

    loadBalances()
  }, [walletAddress, userType, setMerchantIDRXBalance, toast])



  const handleTopUpClick = () => {
    const amount = Number.parseFloat(topUpAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount to top up.",
        variant: "destructive",
      })
      return
    }
    if (merchantIDRXBalance === null || amount > merchantIDRXBalance) {
      toast({
        title: "Insufficient IDRX",
        description: "You do not have enough IDRX to complete this top-up.",
        variant: "destructive",
      })
      return
    }
    setIsTopUpModalOpen(true)
  }

  const handleManualApproval = async () => {
    if (!walletAddress) return

    setIsApproving(true)
    try {
      // Get wallet signer
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask or another wallet.")
      }
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      
      // Approve merchant
      const txHash = await approveMerchant(walletAddress, signer)
      
      toast({
        title: "Merchant Approved!",
        description: `You are now an approved merchant. Transaction: ${txHash.slice(0, 10)}...`,
      })
      
      // Refresh approval status
      const approved = await checkApprovedMerchant(walletAddress)
      setIsApprovedMerchant(approved)
      
    } catch (error: any) {
      console.error("Manual approval failed:", error)
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve merchant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleConfirmTopUp = async () => {
    if (!walletAddress) return

    setIsToppingUp(true)
    setSwapStatus({ status: 'pending' })
    
    try {
      const amount = Number.parseFloat(topUpAmount)
      
      // Get wallet signer
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask or another wallet.")
      }
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      
      // Perform the swap
      const result = await topUpPlt(walletAddress, amount, signer)
      
      if (result.status === 'success') {
        // Update balances
        setMerchantIDRXBalance((merchantIDRXBalance || 0) - amount)
        const newPltBalance = await getPltBalance(walletAddress)
        setPltBalance(newPltBalance)
        setMerchantLoyalBalance(newPltBalance)
        
        toast({
          title: "Top-Up Successful!",
          description: `${amount} IDRX swapped to PLT. Transaction: ${result.transactionHash?.slice(0, 10)}...`,
        })
        setTopUpAmount("") // Clear input
        setSwapStatus({ status: 'success', transactionHash: result.transactionHash })
      } else {
        throw new Error(result.error || 'Swap failed')
      }
    } catch (error: any) {
      console.error("Failed to top up PLT:", error)
      setSwapStatus({ status: 'error', error: error.message })
      toast({
        title: "Top-Up Failed",
        description: error.message || "Could not top up PLT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsToppingUp(false)
      setIsTopUpModalOpen(false)
    }
  }

  if (!walletAddress || userType !== "merchant") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please connect your wallet as a merchant to access this page.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <>
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 pt-32">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10" onClick={() => window.history.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ArrowUpCircle className="h-6 w-6" /> Top Up PLT
            </CardTitle>
            <CardDescription>Convert your IDRX tokens into Pointify Tokens (PLT) for your loyalty program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Merchant Approval Status */}
            {loadingApproval ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">Checking merchant approval status...</span>
              </div>
            ) : isApprovedMerchant === false ? (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-red-800">Not Approved Merchant</span>
                </div>
                <p className="text-xs text-red-700 mb-3">
                  You need to complete your merchant registration on the blockchain before you can top up PLT tokens.
                </p>
                <Button 
                  onClick={handleManualApproval}
                  disabled={isApproving}
                  size="sm"
                  className="w-full"
                >
                  {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve Merchant (Test)
                </Button>
              </div>
            ) : isApprovedMerchant === true ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-800">Approved Merchant</span>
                </div>
              </div>
            ) : null}
            
            <div className="flex items-center justify-between rounded-md bg-muted p-4">
              <span className="text-lg font-medium">Your IDRX Balance:</span>
              {loadingIDRX ? (
                <div className="h-6 w-20 animate-pulse rounded-md bg-gray-200" />
              ) : (
                <span className="text-2xl font-bold text-primary">{merchantIDRXBalance?.toFixed(2) || "0.00"}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between rounded-md bg-green-50 p-4 border border-green-200">
              <span className="text-lg font-medium text-green-800">Your PLT Balance:</span>
              {loadingPltBalance ? (
                <div className="h-6 w-20 animate-pulse rounded-md bg-gray-200" />
              ) : (
                <span className="text-2xl font-bold text-green-600">{pltBalance.toFixed(2)}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-up-amount">Amount to Top Up (IDRX)</Label>
              <Input
                id="top-up-amount"
                type="number"
                placeholder="e.g., 100"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
              <CardDescription className="text-sm">
                This amount of IDRX will be converted to PLT tokens.
              </CardDescription>
            </div>
            

            <Button 
              onClick={handleTopUpClick} 
              className="w-full" 
              disabled={isToppingUp || loadingIDRX || isApprovedMerchant === false}
            >
              {isToppingUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isApprovedMerchant === false ? "Not Approved Merchant" : "Proceed to Top Up"}
            </Button>
            
            {/* Transaction Status */}
            {swapStatus && (
              <div className={`p-4 rounded-lg border ${
                swapStatus.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                swapStatus.status === 'success' ? 'bg-green-50 border-green-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {swapStatus.status === 'pending' && (
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                  )}
                  {swapStatus.status === 'success' && (
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                  )}
                  {swapStatus.status === 'error' && (
                    <div className="h-4 w-4 rounded-full bg-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    swapStatus.status === 'pending' ? 'text-yellow-800' :
                    swapStatus.status === 'success' ? 'text-green-800' :
                    'text-red-800'
                  }`}>
                    {swapStatus.status === 'pending' && 'Transaction Pending...'}
                    {swapStatus.status === 'success' && 'Transaction Successful!'}
                    {swapStatus.status === 'error' && 'Transaction Failed'}
                  </span>
                </div>
                {swapStatus.transactionHash && (
                  <p className="text-xs text-muted-foreground mt-1">
                    TX: {swapStatus.transactionHash}
                  </p>
                )}
                {swapStatus.error && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {swapStatus.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <TopUpConfirmationModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          onConfirm={handleConfirmTopUp}
          amount={Number.parseFloat(topUpAmount) || 0}
          isLoading={isToppingUp}
        />
      </main>
    </>
  )
} 