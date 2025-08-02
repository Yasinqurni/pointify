"use client"

import { useNetworkValidation } from "@/hooks/use-network-validation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface NetworkWarningProps {
  className?: string
}

export function NetworkWarning({ className = "" }: NetworkWarningProps) {
  const { isOnCorrectNetwork, isValidating, switchToCorrectNetwork, correctNetworkName } = useNetworkValidation()

  if (isOnCorrectNetwork) {
    return null
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Wrong Network Detected
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            This app requires {correctNetworkName}. Please switch to the correct network to continue.
          </p>
          <div className="mt-3">
            <Button
              onClick={switchToCorrectNetwork}
              disabled={isValidating}
              size="sm"
              variant="outline"
              className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Switch to {correctNetworkName}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 