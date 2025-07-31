"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scan } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MockAddressScannerProps {
  onScan: (data: string) => void
  label?: string
  placeholder?: string
}

export function MockAddressScanner({
  onScan,
  label = "Enter Wallet Address Manually (for demo)",
  placeholder = "e.g., 0xabc...123",
}: MockAddressScannerProps) {
  const [mockInput, setMockInput] = useState("")
  const { toast } = useToast()

  const handleMockScan = () => {
    if (mockInput.trim()) {
      onScan(mockInput.trim())
      setMockInput("")
    } else {
      toast({
        title: "Error",
        description: "Please enter a mock wallet address.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center h-32 w-full rounded-md border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600">
        <Scan className="h-10 w-10" />
        <span className="ml-2 text-lg">Simulated QR Scan</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mock-address-input">{label}</Label>
        <Input
          id="mock-address-input"
          placeholder={placeholder}
          value={mockInput}
          onChange={(e) => setMockInput(e.target.value)}
        />
      </div>
      <Button onClick={handleMockScan} className="w-full">
        Simulate Scan / Use Entered Address
      </Button>
    </div>
  )
}
