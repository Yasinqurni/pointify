"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Smartphone } from "lucide-react"

interface MobileDeepLinksProps {
  className?: string
}

export function MobileDeepLinks({ className = "" }: MobileDeepLinksProps) {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return null // Don't render on server-side
  }
  
  const currentUrl = window.location.href
  const host = window.location.host
  const pathname = window.location.pathname
  
  const deepLinks = [
    {
      name: "MetaMask",
      url: `https://metamask.app.link/dapp/${host}${pathname}`,
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      name: "Trust Wallet", 
      url: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(currentUrl)}`,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "Coinbase Wallet",
      url: `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(currentUrl)}`,
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ]

  const isMobile = () => {
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  if (!isMobile()) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Smartphone className="h-4 w-4" />
        <span>Open in wallet app:</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {deepLinks.map(link => (
          <Button
            key={link.name}
            variant="outline"
            size="sm"
            onClick={() => window.location.href = link.url}
            className={`${link.color} text-white border-0 text-xs`}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {link.name.split(' ')[0]}
          </Button>
        ))}
      </div>
    </div>
  )
} 