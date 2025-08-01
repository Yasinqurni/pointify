"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  Wallet, 
  ChevronRight,
  CheckCircle,
  AlertCircle 
} from "lucide-react"

interface MobileWalletGuideProps {
  onClose?: () => void
}

export function MobileWalletGuide({ onClose }: MobileWalletGuideProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [detectedWallets, setDetectedWallets] = useState<string[]>([])
  const [mobileWallets, setMobileWallets] = useState<any[]>([])
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return
    }

    // Detect if user is on mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobile(mobile)

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Set up mobile wallets with current location
    const wallets = [
      {
        name: "MetaMask",
        description: "Most popular Ethereum wallet",
        downloadUrl: {
          ios: "https://apps.apple.com/us/app/metamask/id1438144202",
          android: "https://play.google.com/store/apps/details?id=io.metamask"
        },
        deepLink: "https://metamask.app.link/dapp/" + window.location.host,
        color: "bg-orange-500"
      },
      {
        name: "Trust Wallet",
        description: "Secure & decentralized",
        downloadUrl: {
          ios: "https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/id1288339409",
          android: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp"
        },
        deepLink: "https://link.trustwallet.com/open_url?coin_id=60&url=" + encodeURIComponent(window.location.href),
        color: "bg-blue-500"
      },
      {
        name: "Coinbase Wallet",
        description: "From Coinbase exchange",
        downloadUrl: {
          ios: "https://apps.apple.com/us/app/coinbase-wallet/id1278383455",
          android: "https://play.google.com/store/apps/details?id=org.toshi"
        },
        deepLink: "https://go.cb-w.com/dapp?cb_url=" + encodeURIComponent(window.location.href),
        color: "bg-indigo-500"
      }
    ]
    setMobileWallets(wallets)

    // Detect available wallet providers
    const detectedWalletsList: string[] = []
    if ((window as any).ethereum) detectedWalletsList.push('MetaMask')
    if ((window as any).trustwallet) detectedWalletsList.push('Trust Wallet')
    if ((window as any).coinbaseWalletExtension) detectedWalletsList.push('Coinbase Wallet')
    if ((window as any).web3) detectedWalletsList.push('Web3 Provider')
    
    setDetectedWallets(detectedWalletsList)
  }, [])

  if (!isMobile) {
    return null // Don't show on desktop
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your mobile wallet to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Detected Wallets */}
        {detectedWallets.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Detected Wallets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedWallets.map(wallet => (
                <Badge key={wallet} variant="secondary" className="bg-green-100 text-green-800">
                  {wallet}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to connect:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Install a wallet app (see options below)</li>
                <li>Open the app and create/import your wallet</li>
                <li>Use the "Browser" or "DApps" tab in the wallet app</li>
                <li>Navigate to this website from within the wallet app</li>
              </ol>
            </div>
          </div>

          {/* Wallet Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommended Mobile Wallets:</h4>
            {mobileWallets.map(wallet => (
              <div key={wallet.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${wallet.color} flex items-center justify-center`}>
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">{wallet.description}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(wallet.downloadUrl[isIOS ? 'ios' : 'android'], '_blank')}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = wallet.deepLink}
                    title="Open in wallet app"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            {onClose && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 