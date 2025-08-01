"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth"
import { checkIDRXBalance, registerMerchantOnContract } from "@/lib/merchant-registry-contract"
import { updateMerchantStatus } from "@/lib/api"
import { ethers } from "ethers"

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

interface MerchantRegistrationModalProps {
  walletAddress: string
  onSuccess: (merchantData: any) => void
  onCancel: () => void
}

export function MerchantRegistrationModal({ walletAddress, onSuccess, onCancel }: MerchantRegistrationModalProps) {
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: ""
  })
  const [balanceCheck, setBalanceCheck] = useState<{hasEnough: boolean; balance: number; required: number} | null>(null)
  const [checkingBalance, setCheckingBalance] = useState(false)

  // Check IDRX balance when component mounts
  useEffect(() => {
    if (walletAddress) {
      checkBalance()
    }
  }, [walletAddress])

  const checkBalance = async () => {
    setCheckingBalance(true)
    try {
      const result = await checkIDRXBalance(walletAddress)
      setBalanceCheck(result)
      
      if (!result.hasEnough) {
        toast({
          title: "Insufficient IDRX Balance",
          description: `You need at least ${result.required} IDRX to register as a merchant. You have ${result.balance} IDRX.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Balance check failed:", error)
      toast({
        title: "Balance Check Failed",
        description: "Could not verify your IDRX balance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCheckingBalance(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a merchant name.",
        variant: "destructive",
      })
      return
    }

    // Check IDRX balance requirement
    if (!balanceCheck?.hasEnough) {
      toast({
        title: "Insufficient IDRX Balance",
        description: `You need at least ${balanceCheck?.required || 1000} IDRX to register as a merchant.`,
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)

    try {
      // Step 1: Register in database (creates merchant with PENDING status)
      const authResponse = await authService.registerMerchant(
        walletAddress,
        formData.name.trim(),
        formData.description.trim() || undefined,
        formData.logoUrl.trim() || undefined
      )

      // Step 2: Register on smart contract
      try {
        console.log("🔄 Registering merchant on smart contract...")
        
        // Get user's wallet signer for blockchain transaction
        let signerProvider: ethers.providers.Web3Provider | undefined
        
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            signerProvider = new ethers.providers.Web3Provider(window.ethereum)
            console.log("✅ Wallet signer obtained")
          } catch (walletError) {
            console.error("Failed to get wallet signer:", walletError)
            throw new Error("Please connect your wallet to complete registration")
          }
        } else {
          throw new Error("No wallet detected. Please install MetaMask or another wallet.")
        }
        
        const transactionHash = await registerMerchantOnContract(
          walletAddress,
          true, // approved
          signerProvider
        )
        
        console.log("✅ Smart contract registration successful:", transactionHash)
        
        // Step 3: Update merchant status to APPROVED with transaction hash
        try {
          await updateMerchantStatus(walletAddress, 'APPROVED', transactionHash)
          console.log("✅ Merchant status updated to APPROVED")
          
          toast({
            title: "Registration Successful!",
            description: `Merchant registered on blockchain. Transaction: ${transactionHash.slice(0, 10)}...`,
          })
        } catch (statusUpdateError) {
          console.error("Failed to update merchant status:", statusUpdateError)
          // Status update failed, but registration was successful
          toast({
            title: "Registration Partially Complete",
            description: `Merchant registered on blockchain but status update failed. Transaction: ${transactionHash.slice(0, 10)}...`,
          })
        }

        onSuccess(authResponse.user)
      } catch (smartContractError: any) {
        console.error("Smart contract registration failed:", smartContractError)
        
        // Registration in database succeeded, but smart contract failed
        // Keep status as PENDING - user can retry later
        toast({
          title: "Registration Partially Complete",
          description: "Merchant registered in database but smart contract registration failed. Status: PENDING. You can retry later.",
        })

        onSuccess(authResponse.user)
      }
    } catch (error: any) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register merchant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Register Your Business
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create your merchant profile to start accepting Pointify Tokens (PLT)
            <br />
            <strong>Requires: 1000+ IDRX tokens</strong>
          </p>
        </CardHeader>

        {/* IDRX Balance Check */}
        {checkingBalance ? (
          <div className="mx-6 mb-4 flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking IDRX balance...</span>
          </div>
        ) : balanceCheck ? (
          <div className={`mx-6 mb-4 flex items-center gap-2 p-3 rounded-lg ${
            balanceCheck.hasEnough ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {balanceCheck.hasEnough ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium">
                Balance: {balanceCheck.balance} IDRX
              </div>
              <div className="text-xs text-muted-foreground">
                Required: {balanceCheck.required} IDRX
              </div>
            </div>
            <Badge variant={balanceCheck.hasEnough ? "default" : "destructive"}>
              {balanceCheck.hasEnough ? "Eligible" : "Insufficient"}
            </Badge>
          </div>
        ) : null}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-name">Business Name *</Label>
              <Input
                id="merchant-name"
                placeholder="Enter your business name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant-description">Description</Label>
              <Textarea
                id="merchant-description"
                placeholder="Tell us about your business..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant-logo">Logo URL (Optional)</Label>
              <Input
                id="merchant-logo"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                type="url"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Wallet Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>

            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
              <strong>Note:</strong> You will be asked to sign a message with your wallet to verify your identity and approve a blockchain transaction to complete the registration. After approval, you can top up your PLT balance.
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isRegistering || checkingBalance || !balanceCheck?.hasEnough}
              >
                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {checkingBalance ? "Checking Balance..." :
                 !balanceCheck?.hasEnough ? "Insufficient IDRX Balance" :
                 isRegistering ? "Waiting for Wallet Approval..." :
                 "Register Business"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isRegistering}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 