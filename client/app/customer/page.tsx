"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Search, Gift, Store, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CustomerPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [walletAddress, setWalletAddress] = useState("")

  const handleSearchMerchants = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a location or merchant name to search.",
        variant: "destructive",
      })
      return
    }

    // For now, just show a demo message
    toast({
      title: "Search Feature",
      description: "This feature will show nearby merchants and their loyalty programs.",
    })
  }

  const handleCheckBalance = () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Wallet Address Required",
        description: "Please enter your wallet address to check your loyalty balance.",
        variant: "destructive",
      })
      return
    }

    // For now, just show a demo message
    toast({
      title: "Balance Check",
      description: `Checking loyalty balance for ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Search Merchants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Merchants
              </CardTitle>
              <CardDescription>
                Search for merchants in your area and discover their loyalty programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Location or Merchant Name</Label>
                <Input
                  id="search"
                  placeholder="Enter city, zip code, or merchant name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleSearchMerchants} className="w-full">
                Search Merchants
              </Button>
            </CardContent>
          </Card>

          {/* Check Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Check Loyalty Balance
              </CardTitle>
              <CardDescription>
                Enter your wallet address to check your loyalty points balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
              <Button onClick={handleCheckBalance} className="w-full">
                Check Balance
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access common customer features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/redeem">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Gift className="h-6 w-6" />
                    <span>Redeem Reward</span>
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Store className="h-6 w-6" />
                  <span>Browse Rewards</span>
                </Button>
                
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Gift className="h-6 w-6" />
                  <span>My Rewards</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Merchants */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Featured Merchants</CardTitle>
              <CardDescription>
                Discover loyalty programs from popular merchants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Coffee Shop</h4>
                  <p className="text-sm text-gray-600">Earn points on every purchase</p>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Restaurant</h4>
                  <p className="text-sm text-gray-600">Dining rewards program</p>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Store className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold">Retail Store</h4>
                  <p className="text-sm text-gray-600">Shopping loyalty points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 