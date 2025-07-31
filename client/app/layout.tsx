import type React from "react"
import "./globals.css"
import { Plus_Jakarta_Sans } from "next/font/google" // Changed font
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { AppLayoutWrapper } from "@/components/app-layout-wrapper"

const plusJakartaSans = Plus_Jakarta_Sans({
  // Changed font variable name
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans", // Changed font variable name
  display: "swap",
})

export const metadata = {
  title: "Pointify - Web3 Loyalty",
  description: "Reward your customers with blockchain-powered loyalty",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-plus-jakarta-sans antialiased", plusJakartaSans.variable)}>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
        <Toaster />
      </body>
    </html>
  )
}
