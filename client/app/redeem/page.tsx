"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Gift, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RedeemPage() {
  const { toast } = useToast()
  const [claimCode, setClaimCode] = useState("")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemResult, setRedeemResult] = useState<any>(null)

  const handleRedeem = async () => {
    if (!claimCode.trim()) {
      toast({
        title: "Claim Code Required",
        description: "Please enter a valid claim code.",
        variant: "destructive",
      })
      return
    }

    setIsRedeeming(true)
    setRedeemResult(null)

    try {
      // For now, simulate a redeem process
      // In a real implementation, this would call your API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Simulate successful redemption
      const result = {
        success: true,
        rewardTitle: "Free Coffee",
        merchantName: "Coffee Shop",
        redeemedPoints: 50,
        claimCode: claimCode,
        redeemedDate: new Date().toISOString(),
      }
      
      setRedeemResult(result)
      
      toast({
        title: "Redemption Successful!",
        description: `You've successfully redeemed: ${result.rewardTitle}`,
      })
      
    } catch (error) {
      console.error("Redemption failed:", error)
      
      toast({
        title: "Redemption Failed",
        description: "Invalid claim code or reward already redeemed.",
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Redeem Reward
          </h1>
          <p className="text-gray-600">
            Enter your claim code to redeem your reward instantly
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-2 border-purple-100">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                Claim Your Reward
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="claimCode">Claim Code</Label>
                <Input
                  id="claimCode"
                  placeholder="Enter your claim code..."
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  className="text-center font-mono text-lg"
                  disabled={isRedeeming}
                />
              </div>
              
              <Button 
                onClick={handleRedeem}
                disabled={isRedeeming || !claimCode.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
              >
                {isRedeeming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redeeming...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Redeem Now
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Result */}
        {redeemResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Redemption Successful!
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <p><strong>Reward:</strong> {redeemResult.rewardTitle}</p>
                  <p><strong>Merchant:</strong> {redeemResult.merchantName}</p>
                  <p><strong>Points Used:</strong> {redeemResult.redeemedPoints}</p>
                  <p><strong>Claim Code:</strong> {redeemResult.claimCode}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    Show this to the merchant to complete your redemption
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">How it works</span>
            </div>
            <p className="text-xs text-blue-700">
              Enter your claim code to instantly redeem your reward. No wallet connection required!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 