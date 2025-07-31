"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Save, Store, MapPin, Phone, Mail, ArrowLeft } from "lucide-react"

export default function StoreSettingsPage() {
  const { toast } = useToast()
  const [storeData, setStoreData] = useState({
    name: "Pointify Cafe",
    address: "123 Main St, Anytown, CA 90210",
    phone: "+1 (555) 123-4567",
    email: "contact@pointifycafe.com",
    description: "A cozy cafe serving great coffee and pastries.",
    website: "https://pointifycafe.com",
    hours: "Mon-Fri: 7AM-7PM, Sat-Sun: 8AM-6PM"
  })

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your store settings have been updated successfully.",
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
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Store Settings</h1>
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
