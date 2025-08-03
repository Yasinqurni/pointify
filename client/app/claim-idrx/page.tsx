'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClaimIDRXForm } from '@/components/claim-idrx-form'
import { XellarConnect } from '@/components/xellar-connect'
import { useWalletStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { canMintIDRX, getIDRXContractInfo } from '@/lib/idrx-claim-contract'

export default function ClaimIDRXPage() {
  const { walletAddress, isConnected } = useWalletStore()
  const [canMint, setCanMint] = useState<boolean | null>(null)
  const [contractInfo, setContractInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPermissions = async () => {
      if (isConnected && walletAddress) {
        try {
          const [mintPermission, info] = await Promise.all([
            canMintIDRX(walletAddress),
            getIDRXContractInfo()
          ])
          setCanMint(mintPermission)
          setContractInfo(info)
        } catch (error) {
          console.error('Error checking permissions:', error)
          setCanMint(false)
        }
      } else {
        setCanMint(null)
        setContractInfo(null)
      }
      setIsLoading(false)
    }

    checkPermissions()
  }, [isConnected, walletAddress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Claim IDRX Dummy Tokens
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get free IDRX dummy tokens for testing the Pointify platform. 
              Connect your wallet and claim 10000 IDRX tokens instantly.
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-2">
          {/* Main Claim Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {!isConnected ? (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Connect Your Wallet</CardTitle>
                  <CardDescription>
                    Connect your wallet to claim IDRX Mock tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <XellarConnect userType="user">
                    <span>Connect to claim IDRX Mock tokens</span>
                  </XellarConnect>
                </CardContent>
              </Card>
            ) : (
              <ClaimIDRXForm onSuccess={() => {
                // Refresh permissions after successful claim
                if (walletAddress) {
                  canMintIDRX(walletAddress).then(setCanMint)
                }
              }} />
            )}
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contract Info */}
            {contractInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Token Name:</span>
                    <span className="text-sm font-medium">{contractInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Symbol:</span>
                    <span className="text-sm font-medium">{contractInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Decimals:</span>
                    <span className="text-sm font-medium">{contractInfo.decimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Owner:</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {contractInfo.owner.slice(0, 6)}...{contractInfo.owner.slice(-4)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permission Status */}
            {isConnected && !isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Mint Permission</CardTitle>
                </CardHeader>
                <CardContent>
                  {canMint === true ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">You can mint IDRX tokens</span>
                    </div>
                  ) : canMint === false ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">You cannot mint IDRX tokens</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium">Checking permissions...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connect Wallet</p>
                    <p className="text-xs text-gray-600">Connect your wallet to Lisk Sepolia network</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click Claim</p>
                    <p className="text-xs text-gray-600">Click the claim button to mint 1000 IDRX tokens</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Confirm Transaction</p>
                    <p className="text-xs text-gray-600">Confirm the transaction in your wallet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-medium">Receive Tokens</p>
                    <p className="text-xs text-gray-600">IDRX tokens will be added to your wallet</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-700 space-y-2">
                <p className="text-sm">
                  • These are dummy tokens for testing purposes only
                </p>
                <p className="text-sm">
                  • Make sure you're connected to Lisk Sepolia testnet
                </p>
                <p className="text-sm">
                  • You need some ETH for gas fees
                </p>
                <p className="text-sm">
                  • Only contract owner can mint new tokens
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}