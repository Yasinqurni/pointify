"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Save, Gift, Calculator, Settings, ArrowLeft } from "lucide-react"

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

  const handleSave = () => {
    toast({
      title: "Loyalty Rules Saved",
      description: "Your loyalty program rules have been updated successfully.",
    })
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
        <Button onClick={handleSave} className="flex items-center gap-2 px-8 py-3">
          <Save className="h-5 w-5" />
          Save Loyalty Rules
        </Button>
      </div>
    </div>
  )
} 