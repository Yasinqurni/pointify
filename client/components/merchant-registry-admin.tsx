"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Wallet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { registerMerchantOnContract, checkIDRXBalance, MERCHANT_REGISTRY_ADDRESS } from "@/lib/merchant-registry-contract"
import { web3Service } from "@/lib/web3"

export function MerchantRegistryAdmin() {
  const { toast } = useToast()
  const [merchantAddress, setMerchantAddress] = useState("")
  const [approval, setApproval] = useState<"true" | "false">("true")
  const [loading, setLoading] = useState(false)
  const [balanceCheck, setBalanceCheck] = useState<{hasEnough: boolean; balance: number; required: number} | null>(null)
  const [checkingBalance, setCheckingBalance] = useState(false)

  const handleCheckBalance = async () => {
    if (!merchantAddress) {
      toast({
        title: "Missing Address",
        description: "Please enter a merchant address first",
        variant: "destructive",
      })
      return
    }

    if (!ethers.utils.isAddress(merchantAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      })
      return
    }

    setCheckingBalance(true)
    try {
      const result = await checkIDRXBalance(merchantAddress)
      setBalanceCheck(result)
      
      toast({
        title: result.hasEnough ? "Balance Check Passed" : "Insufficient Balance",
        description: `${result.balance} IDRX (${result.required} required)`,
        variant: result.hasEnough ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Balance check failed:", error)
      toast({
        title: "Balance Check Failed",
        description: "Could not verify IDRX balance",
        variant: "destructive",
      })
    } finally {
      setCheckingBalance(false)
    }
  }

  const handleRegisterMerchant = async () => {
    if (!merchantAddress) {
      toast({
        title: "Missing Address",
        description: "Please enter a merchant address",
        variant: "destructive",
      })
      return
    }

    if (!ethers.utils.isAddress(merchantAddress)) {
      toast({
        title: "Invalid Address", 
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      })
      return
    }

    // Check balance first if not already checked
    if (!balanceCheck) {
      await handleCheckBalance()
      return
    }

    if (!balanceCheck.hasEnough) {
      toast({
        title: "Insufficient IDRX",
        description: `Merchant needs ${balanceCheck.required} IDRX, has ${balanceCheck.balance}`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Get wallet provider for signing
      const provider = web3Service.getProvider()
      if (!provider) {
        throw new Error("Please connect your wallet to sign the transaction")
      }

      const txHash = await registerMerchantOnContract(
        merchantAddress,
        approval === "true",
        provider
      )

      toast({
        title: "Registration Successful",
        description: `Merchant ${approval === "true" ? "approved" : "rejected"}. TX: ${txHash.slice(0, 10)}...`,
        variant: "default",
      })

      // Reset form
      setMerchantAddress("")
      setApproval("true")
      setBalanceCheck(null)

    } catch (error: any) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register merchant",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Merchant Registry Admin
        </CardTitle>
        <CardDescription>
          Register merchants on contract {MERCHANT_REGISTRY_ADDRESS.slice(0, 10)}...
          <br />
          Requires minimum 1000 IDRX balance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Merchant Address Input */}
        <div className="space-y-2">
          <Label htmlFor="merchant-address">Merchant Address</Label>
          <div className="flex gap-2">
            <Input
              id="merchant-address"
              placeholder="0x..."
              value={merchantAddress}
              onChange={(e) => {
                setMerchantAddress(e.target.value)
                setBalanceCheck(null) // Reset balance check when address changes
              }}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleCheckBalance}
              disabled={checkingBalance || !merchantAddress}
            >
              {checkingBalance ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Check Balance"
              )}
            </Button>
          </div>
        </div>

        {/* Balance Check Result */}
        {balanceCheck && (
          <div className="flex items-center gap-2 p-3 rounded-lg border">
            {balanceCheck.hasEnough ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <div className="font-medium">
                {balanceCheck.balance} IDRX
              </div>
              <div className="text-sm text-muted-foreground">
                Required: {balanceCheck.required} IDRX
              </div>
            </div>
            <Badge variant={balanceCheck.hasEnough ? "default" : "destructive"}>
              {balanceCheck.hasEnough ? "Eligible" : "Insufficient"}
            </Badge>
          </div>
        )}

        {/* Approval Selection */}
        <div className="space-y-2">
          <Label htmlFor="approval">Registration Decision</Label>
          <Select value={approval} onValueChange={(value: "true" | "false") => setApproval(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select approval status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">✅ Approve Merchant</SelectItem>
              <SelectItem value="false">❌ Reject Merchant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Register Button */}
        <Button 
          onClick={handleRegisterMerchant}
          disabled={loading || !merchantAddress || !balanceCheck?.hasEnough}
          className="w-full"
          variant={approval === "true" ? "default" : "destructive"}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : approval === "true" ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          {loading 
            ? "Processing..." 
            : `${approval === "true" ? "Approve" : "Reject"} Merchant Registration`
          }
        </Button>

        {/* Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Merchant must have at least 1000 IDRX tokens</p>
          <p>• Registration writes to Lisk Sepolia contract</p>
          <p>• Requires wallet signature for transaction</p>
        </div>
      </CardContent>
    </Card>
  )
} 