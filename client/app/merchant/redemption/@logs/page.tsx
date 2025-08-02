"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { fetchMerchantRedemptionLogs, type Redemption } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download } from "lucide-react" // Added Download icon
import { Input } from "@/components/ui/input" // For date filter
import { Button } from "@/components/ui/button" // For export button
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // For status filter
import { toast } from "@/components/ui/toast" // Import toast for displaying notifications

export default function RedeemLogsPage() {
  const { walletAddress, userType } = useWalletStore()
  const [redemptionLogs, setRedemptionLogs] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterDate, setFilterDate] = useState<string>("")
  const [filterUser, setFilterUser] = useState<string>("")
  const [filterReward, setFilterReward] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

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

  const filteredLogs = redemptionLogs.filter((log) => {
    const logDate = new Date(log.redeemedDate).toISOString().split("T")[0]
    const matchesDate = filterDate ? logDate === filterDate : true
    const matchesUser = filterUser
      ? log.userId.toLowerCase().includes(filterUser.toLowerCase()) ||
        `${log.userId.slice(0, 6)}...${log.userId.slice(-4)}`.toLowerCase().includes(filterUser.toLowerCase())
      : true
    const matchesReward = filterReward ? log.rewardTitle.toLowerCase().includes(filterReward.toLowerCase()) : true
    const matchesStatus = filterStatus === "all" ? true : log.status === filterStatus

    return matchesDate && matchesUser && matchesReward && matchesStatus
  })

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no logs matching your current filters to export.",
        variant: "info",
      })
      return
    }

    const headers = ["Reward", "User Address", "Points Redeemed", "Date", "Claim Code", "Status"]
    const csvRows = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          `"${log.rewardTitle.replace(/"/g, '""')}"`,
          log.userId,
          log.redeemedPoints,
          new Date(log.redeemedDate).toLocaleDateString(),
          log.claimCode,
          log.status,
        ].join(","),
      ),
    ]

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "redemption_logs.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Export Successful",
        description: "Redemption logs exported to CSV.",
      })
    }
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading logs...</p>
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">{error}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-md bg-muted/50 glass-card">
            <div className="flex flex-wrap items-center gap-4">
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-[180px] bg-background/50 backdrop-blur-sm"
                placeholder="Filter by Date"
              />
              <Input
                type="text"
                placeholder="Filter by User Address"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-[200px] bg-background/50 backdrop-blur-sm"
              />
              <Input
                type="text"
                placeholder="Filter by Reward Name"
                value={filterReward}
                onChange={(e) => setFilterReward(e.target.value)}
                className="w-[200px] bg-background/50 backdrop-blur-sm"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExportCsv} variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No redemption logs found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border bg-muted/50 shadow-md glass-card">
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
                  {filteredLogs.map((log) => (
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
        </>
      )}
    </div>
  )
}
