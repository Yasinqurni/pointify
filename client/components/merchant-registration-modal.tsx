"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Store, CheckCircle } from "lucide-react"
import { authService } from "@/lib/auth"

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

    setIsRegistering(true)

    try {
      const authResponse = await authService.registerMerchant(
        walletAddress,
        formData.name.trim(),
        formData.description.trim() || undefined,
        formData.logoUrl.trim() || undefined
      )

      toast({
        title: "Merchant Registered!",
        description: "Your merchant account has been created successfully.",
      })

      onSuccess(authResponse.user)
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
        </CardHeader>
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
              <strong>Note:</strong> You will be asked to sign a message with your wallet to verify your identity and complete the registration.
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isRegistering}
              >
                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Business
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