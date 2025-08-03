'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Coins, CheckCircle, AlertCircle, Wallet } from 'lucide-react'
import { useWalletStore } from '@/lib/store'
import { claimIDRXTokens, getIDRXBalance } from '@/lib/idrx-contract'
import { ethers } from 'ethers'

interface ClaimIDRXFormProps {
  onSuccess?: () => void
}

export function ClaimIDRXForm({ onSuccess }: ClaimIDRXFormProps) {
  const { walletAddress, isConnected } = useWalletStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [gasEstimate, setGasEstimate] = useState<string | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)

  const CLAIM_AMOUNT = 1000

  const handleClaim = async () => {
    if (!isConnected || !walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('Starting IDRX claim process...')
      
      // Get current balance before claim
      const balanceBefore = await getIDRXBalance(walletAddress)
      setCurrentBalance(balanceBefore)
      
      // Claim IDRX tokens
      const txHash = await claimIDRXTokens(walletAddress, CLAIM_AMOUNT)
      
      console.log('Claim transaction successful:', txHash)
      
      // Wait a bit for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Get updated balance
      const balanceAfter = await getIDRXBalance(walletAddress)
      setCurrentBalance(balanceAfter)
      
      setSuccess(`Successfully claimed ${CLAIM_AMOUNT} IDRX tokens! Transaction: ${txHash}`)
      
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (err: any) {
      console.error('Claim failed:', err)
      setError(err.message || 'Failed to claim IDRX tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckBalance = async () => {
    if (!isConnected || !walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    try {
      const balance = await getIDRXBalance(walletAddress)
      setCurrentBalance(balance)
    } catch (err: any) {
      console.error('Failed to get balance:', err)
      setError('Failed to get current balance')
    }
  }

  const estimateGasCost = async () => {
    if (!isConnected || !walletAddress) {
      return
    }

    setIsEstimating(true)
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      
      // Simple gas estimation for display purposes
      const gasPrice = await provider.getGasPrice()
      const optimizedGasPrice = ethers.utils.parseUnits('1', 'gwei') // Use 1 gwei for Lisk Sepolia
      const estimatedGasLimit = ethers.BigNumber.from('50000') // Conservative estimate
      
      const estimatedCost = estimatedGasLimit.mul(optimizedGasPrice)
      const costInEth = ethers.utils.formatEther(estimatedCost)
      
      setGasEstimate(`~${parseFloat(costInEth).toFixed(6)} ETH`)
    } catch (err) {
      console.error('Failed to estimate gas:', err)
      setGasEstimate('Unable to estimate')
    } finally {
      setIsEstimating(false)
    }
  }

  // Estimate gas when wallet connects
  React.useEffect(() => {
    if (isConnected && walletAddress) {
      estimateGasCost()
      handleCheckBalance()
    }
  }, [isConnected, walletAddress])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-blue-100">
            <Coins className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Claim IDRX Dummy</CardTitle>
        <CardDescription>
          Get {CLAIM_AMOUNT} IDRX dummy tokens for testing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Wallet Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium">Wallet Status</span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Not Connected</span>
              </>
            )}
          </div>
        </div>

        {/* Current Balance */}
        {isConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
              <span className="text-sm font-medium">Current IDRX Balance</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {currentBalance !== null ? `${currentBalance.toFixed(2)} IDRX` : '---'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckBalance}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Gas Estimate */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
              <span className="text-sm font-medium">Estimated Gas Cost</span>
              <div className="flex items-center gap-2">
                {isEstimating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-sm text-green-600">Calculating...</span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-green-600">
                    {gasEstimate || 'Click to estimate'}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={estimateGasCost}
                  disabled={isLoading || isEstimating}
                >
                  Estimate
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Claim Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleClaim}
            disabled={!isConnected || isLoading}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Claiming...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                <span>Claim {CLAIM_AMOUNT} IDRX</span>
              </div>
            )}
          </Button>
        </motion.div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>This will mint {CLAIM_AMOUNT} IDRX dummy tokens to your wallet</p>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-800 font-medium">⚠️ Important:</p>
            <ul className="text-yellow-700 text-xs mt-1 space-y-1">
              <li>• Make sure you're connected to <strong>Lisk Sepolia</strong> testnet</li>
              <li>• Gas cost should be very low (~0.00005 ETH or less)</li>
              <li>• If gas cost is high (&gt;0.01 ETH), check your network</li>
              <li>• Get free Lisk Sepolia ETH from faucet if needed</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}