"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Users, Loader2 } from "lucide-react"
import { fetchMerchantLoyaltyProgram } from "@/lib/api"

const MerchantLoyalCustomersPage: React.FC = () => {
  const { walletAddress, userType } = useWalletStore()
  const { toast } = useToast()

  const [loyaltyProgram, setLoyaltyProgram] = useState<any>(null)
  const [loadingLoyalty, setLoadingLoyalty] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLoyaltyProgram = async () => {
      if (walletAddress && userType === "merchant") {
        setLoadingLoyalty(true)
        setError(null)
        try {
          const data = await fetchMerchantLoyaltyProgram(walletAddress)
          setLoyaltyProgram(data)
        } catch (err) {
          console.error("Failed to fetch loyalty program:", err)
          setError("Failed to load loyalty program. Please try again.")
        } finally {
          setLoadingLoyalty(false)
        }
      }
    }

    loadLoyaltyProgram()
  }, [walletAddress, userType])

  if (!walletAddress || userType !== "merchant") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please connect your wallet as a merchant to access this page.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <>
      <main className="flex flex-1 flex-col items-center p-4 md:p-8">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" /> Your Loyal Customers
            </CardTitle>
            <CardDescription>A list of customers with LOYAL points from your program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingLoyalty ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading loyal customers...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : loyaltyProgram?.loyalCustomers.length === 0 ? (
              <p className="text-muted-foreground">No loyal customers yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border bg-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 pr-4 font-semibold">Address</th>
                      <th className="py-2 pr-4 font-semibold">Name (Mock)</th>
                      <th className="py-2 font-semibold">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loyaltyProgram?.loyalCustomers.map((customer: any) => (
                      <tr key={customer.address} className="border-b last:border-b-0">
                        <td className="py-2 pr-4 font-mono text-xs">
                          {`${customer.address.slice(0, 6)}...${customer.address.slice(-4)}`}
                        </td>
                        <td className="py-2 pr-4">{customer.name}</td>
                        <td className="py-2 font-medium">{customer.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

export default MerchantLoyalCustomersPage
