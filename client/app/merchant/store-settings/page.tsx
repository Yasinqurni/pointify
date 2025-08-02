"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Save, Store, MapPin, Phone, Mail, ArrowLeft, Loader2 } from "lucide-react"
import { useWalletStore } from "@/lib/store"
import { fetchMerchantData } from "@/lib/api"
import { authService } from "@/lib/auth"


export default function StoreSettingsPage() {
  const { toast } = useToast()
  const { walletAddress, userType } = useWalletStore()
  const [loading, setLoading] = useState(true)
  const [storeData, setStoreData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    website: "",
    hours: ""
  })

  // Load merchant data on component mount
  useEffect(() => {
    const loadMerchantData = async () => {
      if (!walletAddress || userType !== "merchant") return

      setLoading(true)
      try {
        const merchantData = await fetchMerchantData()
        setStoreData({
          name: merchantData.name || "",
          address: merchantData.address || "",
          phone: merchantData.phone || "",
          email: merchantData.email || "",
          description: merchantData.description || "",
          website: merchantData.website || "",
          hours: merchantData.hours || ""
        })
      } catch (error: any) {
        console.error("Failed to load merchant data:", error)
        
        // If it's an authentication error, redirect to login
        if (error.message?.includes("Authentication required") || 
            error.message?.includes("authentication token") ||
            error.message?.includes("401")) {
          console.log("🔍 Authentication error in store settings, redirecting to login")
          authService.logout()
          // Add guard to prevent infinite redirects
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.href = '/'
          }
          return
        }
        
        // For other errors, show toast
        let errorMessage = "Failed to load merchant data. Please try again."
        
        if (error.message?.includes("403")) {
          errorMessage = "Access denied. Only merchants can access this page."
        } else if (error.message?.includes("404")) {
          errorMessage = "Merchant profile not found."
        } else if (error.message?.includes("500")) {
          errorMessage = "Server error. Please try again later."
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMerchantData()
  }, [walletAddress, userType]) // Remove toast from dependencies to prevent infinite re-renders

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your store settings have been updated successfully.",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8 space-y-8 pt-32">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading merchant data...</p>
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
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {storeData.name ? `${storeData.name} Settings` : "Store Settings"}
              </h1>
              <p className="text-sm text-muted-foreground">Manage your store information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card className="shadow-xl glass-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeData.name}
                onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                placeholder="Enter store name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={storeData.description}
                onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                placeholder="Describe your store"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={storeData.website}
                onChange={(e) => setStoreData({ ...storeData, website: e.target.value })}
                placeholder="https://yourstore.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-xl glass-card border-2 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Phone className="h-6 w-6 text-blue-500" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={storeData.address}
                onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                placeholder="Enter store address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={storeData.phone}
                onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={storeData.email}
                onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Business Hours</Label>
              <Input
                id="hours"
                value={storeData.hours}
                onChange={(e) => setStoreData({ ...storeData, hours: e.target.value })}
                placeholder="Mon-Fri: 9AM-6PM"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3">
          <Save className="h-5 w-5" />
          Save Settings
        </Button>
      </div>


    </div>
  )
}
