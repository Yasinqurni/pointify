"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"

export default function MissionsPage() {
  return (
    <main className="flex flex-1 flex-col items-center p-4 md:p-8">
      <Card className="w-full max-w-4xl bg-card shadow-lg">
        {" "}
        {/* Added shadow-lg */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award className="h-6 w-6" /> Missions
          </CardTitle>
          <CardDescription>Create and manage gamified tasks or seasonal events for your customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page will display a list of active mission campaigns, with options to create, activate, or expire
            missions. You'll also see stats on how many customers joined and completed each mission.
          </p>
          {/* Placeholder for missions list and management UI */}
          <div className="h-48 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
            {" "}
            {/* Added shadow-inner */}
            Missions Management UI Coming Soon!
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
