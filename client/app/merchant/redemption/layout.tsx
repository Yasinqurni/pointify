"use client"

import type React from "react"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QrCode } from "lucide-react"

export default function RedemptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const segment = useSelectedLayoutSegment()

  return (
    <main className="flex flex-1 flex-col items-center p-4 md:p-8">
      <Card className="w-full max-w-4xl bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <QrCode className="h-6 w-6" /> Redemption
          </CardTitle>
          <CardDescription>Scan QR codes to verify and claim rewards.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            {children}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
