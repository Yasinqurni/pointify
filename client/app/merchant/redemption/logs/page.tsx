"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/store"
import { fetchMerchantRedemptionLogs, type Redemption } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    const matchesDate = !filterDate || log.redeemedDate.includes(filterDate)
    const matchesUser = !filterUser || log.userId.toLowerCase().includes(filterUser.toLowerCase())
    const matchesReward = !filterReward || log.rewardTitle.toLowerCase().includes(filterReward.toLowerCase())
    const matchesStatus = filterStatus === "all" || log.status === filterStatus
    return matchesDate && matchesUser && matchesReward && matchesStatus
  })

  const handleExport = () => {
    const csvContent = [
      ["Date", "User", "Reward", "Points", "Status", "Claim Code"],
      ...filteredLogs.map((log) => [
        log.redeemedDate,
        log.userId,
        log.rewardTitle,
        log.redeemedPoints.toString(),
        log.status,
        log.claimCode,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `redemption-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading redemption logs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Input
          placeholder="Filter by date..."
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <Input
          placeholder="Filter by user..."
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        <Input
          placeholder="Filter by reward..."
          value={filterReward}
          onChange={(e) => setFilterReward(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Claim Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No redemption logs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.redeemedDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {`${log.userId.slice(0, 6)}...${log.userId.slice(-4)}`}
                  </TableCell>
                  <TableCell>{log.rewardTitle}</TableCell>
                  <TableCell>{log.redeemedPoints} LOYAL</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        log.status === "claimed"
                          ? "bg-green-100 text-green-800"
                          : log.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.claimCode}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 