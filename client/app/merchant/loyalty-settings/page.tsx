"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Save, Gift, Calculator, Settings, ArrowLeft, Loader2, CheckCircle, AlertCircle, X } from "lucide-react"
import { getLoyaltySettings, updateLoyaltySettings, type LoyaltySettings, type UpdateLoyaltySettingsRequest } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

export default function LoyaltySettingsPage() {
  const { toast } = useToast()
  const [loyaltyRules, setLoyaltyRules] = useState({
    pointsPerDollar: 1,
    pointsPerRupiah: 10000,
    autoCalculate: true,
    defaultRewardPoints: 10,
    minimumPurchase: 5,
    expirationDays: 365,
    allowNegativeBalance: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState("")
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load loyalty settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      // Prevent duplicate loads
      if (hasLoaded || loading) return
      
      setLoading(true)
      
      try {
        const settings = await getLoyaltySettings()
        setLoyaltyRules({
          pointsPerDollar: settings.pointsPerDollar,
          pointsPerRupiah: settings.pointsPerRupiah,
          autoCalculate: settings.autoCalculate,
          defaultRewardPoints: settings.defaultRewardPoints,
          minimumPurchase: settings.minimumPurchase,
          expirationDays: settings.expirationDays,
          allowNegativeBalance: settings.allowNegativeBalance,
        })
        setHasLoaded(true)
      } catch (error: any) {
        console.error("Failed to load loyalty settings:", error)
        setErrorDetails(error?.message || "Failed to load loyalty settings. Using default values.")
        setShowErrorModal(true)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, []) // Empty dependency array - only run once on mount

  const handleSave = async () => {
    setSaving(true)
    try {
      const updateData: UpdateLoyaltySettingsRequest = {
        pointsPerDollar: loyaltyRules.pointsPerDollar,
        pointsPerRupiah: loyaltyRules.pointsPerRupiah,
        autoCalculate: loyaltyRules.autoCalculate,
        defaultRewardPoints: loyaltyRules.defaultRewardPoints,
        minimumPurchase: loyaltyRules.minimumPurchase,
        expirationDays: loyaltyRules.expirationDays,
        allowNegativeBalance: loyaltyRules.allowNegativeBalance,
      }

      await updateLoyaltySettings(updateData)
      setShowSuccessModal(true)
      
    } catch (error: any) {
      console.error("Failed to save loyalty settings:", error)
      setErrorDetails(error?.message || "Failed to save loyalty settings. Please try again.")
      setShowErrorModal(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8 space-y-8 pt-32">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading loyalty settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-8 pt-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Loyalty Rules</h1>
              <p className="text-sm text-muted-foreground">Configure your loyalty program</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Points Calculation */}
        <Card className="shadow-lg border border-border">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-full bg-green-500/10">
                <Calculator className="h-6 w-6 text-green-500" />
              </div>
              Points Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
              <Input
                id="pointsPerDollar"
                type="number"
                value={loyaltyRules.pointsPerDollar}
                onChange={(e) => setLoyaltyRules({ ...loyaltyRules, pointsPerDollar: Number(e.target.value) })}
                placeholder="1"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsPerRupiah">Points per Rupiah (IDR)</Label>
              <Input
                id="pointsPerRupiah"
                type="number"
                value={loyaltyRules.pointsPerRupiah}
                onChange={(e) => setLoyaltyRules({ ...loyaltyRules, pointsPerRupiah: Number(e.target.value) })}
                placeholder="10000"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumPurchase">Minimum Purchase for Points</Label>
              <Input
                id="minimumPurchase"
                type="number"
                value={loyaltyRules.minimumPurchase}
                onChange={(e) => setLoyaltyRules({ ...loyaltyRules, minimumPurchase: Number(e.target.value) })}
                placeholder="5"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-4 bg-muted/50">
              <Label htmlFor="autoCalculate" className="flex flex-col space-y-1">
                <span className="text-base font-medium leading-none">Auto-Calculate Points</span>
                <span className="text-sm text-muted-foreground">
                  Automatically calculate points based on purchase amount
                </span>
              </Label>
              <Switch 
                id="autoCalculate" 
                checked={loyaltyRules.autoCalculate} 
                onCheckedChange={(checked) => setLoyaltyRules({ ...loyaltyRules, autoCalculate: checked })} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Reward Settings */}
        <Card className="shadow-lg border border-border">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Gift className="h-6 w-6 text-purple-500" />
              </div>
              Reward Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="defaultRewardPoints">Default Reward Points</Label>
              <Input
                id="defaultRewardPoints"
                type="number"
                value={loyaltyRules.defaultRewardPoints}
                onChange={(e) => setLoyaltyRules({ ...loyaltyRules, defaultRewardPoints: Number(e.target.value) })}
                placeholder="10"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDays">Points Expiration (Days)</Label>
              <Input
                id="expirationDays"
                type="number"
                value={loyaltyRules.expirationDays}
                onChange={(e) => setLoyaltyRules({ ...loyaltyRules, expirationDays: Number(e.target.value) })}
                placeholder="365"
                min="0"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-4 bg-muted/50">
              <Label htmlFor="allowNegative" className="flex flex-col space-y-1">
                <span className="text-base font-medium leading-none">Allow Negative Balance</span>
                <span className="text-sm text-muted-foreground">
                  Allow customers to redeem more points than they have
                </span>
              </Label>
              <Switch 
                id="allowNegative" 
                checked={loyaltyRules.allowNegativeBalance} 
                onCheckedChange={(checked) => setLoyaltyRules({ ...loyaltyRules, allowNegativeBalance: checked })} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="shadow-lg border border-border">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-full bg-orange-500/10">
              <Settings className="h-6 w-6 text-orange-500" />
            </div>
            Current Rules Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="font-bold text-green-600 mb-1">Points Rate</div>
              <div className="text-sm text-muted-foreground">
                {loyaltyRules.pointsPerDollar} point per ${loyaltyRules.pointsPerRupiah.toLocaleString()} IDR
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="font-bold text-blue-600 mb-1">Minimum Purchase</div>
              <div className="text-sm text-muted-foreground">${loyaltyRules.minimumPurchase} for points</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="font-bold text-purple-600 mb-1">Points Expiration</div>
              <div className="text-sm text-muted-foreground">{loyaltyRules.expirationDays} days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? "Saving..." : "Save Loyalty Rules"}
        </Button>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              Success!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-muted-foreground mb-6">
                Your loyalty program rules have been updated successfully!
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-8"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600">
              Error
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-muted-foreground mb-4">
                Failed to save loyalty settings:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-700 text-center">
                  {errorDetails}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowErrorModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowErrorModal(false)
                    handleSave()
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Retrying...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 