"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { fetchMerchantRedemptionLogs, type Redemption } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ListChecks } from "lucide-react"

export default function RedeemLogsPage() {
  const { walletAddress, userType } = useWalletStore()
  const [redemptionLogs, setRedemptionLogs] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRedemptionLogs = async () => {
      if (walletAddress && userType === "merchant") {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchMerchantRedemptionLogs()
          setRedemptionLogs(data)
        } catch (err) {
          console.error("Failed to fetch merchant redemption logs:", err)
          setError("Failed to load redemption logs. Please try again.")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        setError("Please connect your wallet as a merchant to view redemption logs.")
      }
    }

    loadRedemptionLogs()
  }, [walletAddress, userType])

  return (
    <>
      <main className="flex flex-1 flex-col items-center p-4 md:p-8">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ListChecks className="h-6 w-6" /> Redemption Logs
            </CardTitle>
            <CardDescription>A comprehensive list of all redeemed rewards at your establishment.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading logs...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : redemptionLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No redemption logs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reward</TableHead>
                      <TableHead>User Address</TableHead>
                      <TableHead>Points Redeemed</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Claim Code</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptionLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.rewardTitle}</TableCell>
                        <TableCell>{`${log.userId.slice(0, 6)}...${log.userId.slice(-4)}`}</TableCell>
                        <TableCell>{log.redeemedPoints}</TableCell>
                        <TableCell>{new Date(log.redeemedDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{log.claimCode}</TableCell>
                        <TableCell className="capitalize">{log.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
