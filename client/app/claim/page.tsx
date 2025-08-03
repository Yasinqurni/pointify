'use client'

import { motion } from 'framer-motion'
import { ClaimIDRXButton } from '@/components/claim-idrx-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Coins, Clock, Info } from 'lucide-react'
import Link from 'next/link'

export default function ClaimPage() {
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
              Connect your wallet and claim 10000 IDRX tokens once per day.
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-2">
          {/* Main Claim Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Coins className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Claim IDRX Dummy</CardTitle>
                <CardDescription>
                  Get 10000 IDRX dummy tokens for testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClaimIDRXButton />
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  How it Works
                </CardTitle>
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
                    <p className="text-xs text-gray-600">Click the claim button to get 10000 IDRX tokens</p>
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

            {/* Important Notes */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Important Notes
                </CardTitle>
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
                  • You can only claim once every 24 hours
                </p>
                <p className="text-sm">
                  • Get free Lisk Sepolia ETH from faucet if needed
                </p>
              </CardContent>
            </Card>

            {/* Network Info */}
            <Card>
              <CardHeader>
                <CardTitle>Network Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Network:</span>
                  <span className="text-sm font-medium">Lisk Sepolia Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Chain ID:</span>
                  <span className="text-sm font-medium">4202</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">RPC URL:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    https://rpc.sepolia.lisk.com
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Block Explorer:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    https://sepolia-blockscout.lisk.com
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 