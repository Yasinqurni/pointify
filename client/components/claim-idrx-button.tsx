'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Coins, ArrowRight, Loader2 } from 'lucide-react'
import { useWalletStore } from '@/lib/store'
import { claimIDRXTokensSimple, testContractConnection, checkClaimEligibility } from '@/lib/idrx-claim-contract'
import { useToast } from '@/hooks/use-toast'
import { XellarConnect } from '@/components/xellar-connect'

export function ClaimIDRXButton() {
  const { walletAddress, isConnected } = useWalletStore()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleClaim = async () => {
    if (!isConnected || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first to claim IDRX tokens",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('Starting IDRX claim process...')
      
      // First check if user can claim
      const eligibility = await checkClaimEligibility(walletAddress)
      
      if (!eligibility.canClaim) {
        if (eligibility.timeRemaining) {
          const hoursRemaining = Math.ceil(eligibility.timeRemaining / 3600)
          toast({
            title: "Daily Limit Reached",
            description: `You can only claim once every 24 hours. Please wait ${hoursRemaining} hours before claiming again.`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Cannot Claim",
            description: "You have already claimed today. Please wait 24 hours before claiming again.",
            variant: "destructive",
          })
        }
        return
      }
      
      // First test the contract connection
      await testContractConnection()
      
      // Claim IDRX tokens using the simplified function
      const txHash = await claimIDRXTokensSimple(10000)
      
      console.log('Claim transaction successful:', txHash)
      
      toast({
        title: "Claim Successful!",
        description: `Successfully claimed 10000 IDRX tokens! Transaction: ${txHash.slice(0, 10)}...`,
      })
      
    } catch (err: any) {
      console.error('Claim failed:', err)
      
      // Handle specific error cases
      if (err.message?.includes('already claimed') || err.message?.includes('cooldown') || err.message?.includes('limit')) {
        toast({
          title: "Daily Limit Reached",
          description: "You have already claimed today. Please wait 24 hours before claiming again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Claim Failed",
          description: err.message || 'Failed to claim IDRX tokens',
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <XellarConnect userType="user" disableRedirect={true}>
        <div className="flex items-center justify-center space-x-2 md:space-x-3 w-full">
          <Coins className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          <span>Connect Wallet to Claim IDRX</span>
          <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-auto text-blue-600" />
        </div>
      </XellarConnect>
    )
  }

  return (
    <Button 
      variant="outline" 
      className="w-full h-10 md:h-12 text-sm md:text-base border-blue-200 hover:border-blue-300 hover:bg-blue-50"
      onClick={handleClaim}
      disabled={isLoading}
    >
      <div className="flex items-center justify-center space-x-2 md:space-x-3 w-full">
        {isLoading ? (
          <Loader2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 animate-spin" />
        ) : (
          <Coins className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
        )}
        <span>
          {isLoading ? 'Claiming...' : 'Claim 10000 IDRX Dummy'}
        </span>
        <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-auto text-blue-600" />
      </div>
    </Button>
  )
} 