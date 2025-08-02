"use client"

import { Loader2, Sparkles, Users, Award, Wallet } from "lucide-react"
import { motion } from "framer-motion"

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  type?: "merchant" | "user" | "general"
}

export function LoadingOverlay({ isVisible, message, type = "general" }: LoadingOverlayProps) {
  if (!isVisible) return null

  const getLoadingContent = () => {
    switch (type) {
      case "merchant":
        return {
          icon: <Sparkles className="h-12 w-12 text-primary animate-pulse" />,
          title: "Loading Merchant Dashboard",
          subtitle: "Setting up your loyalty program...",
          steps: [
          ]
        }
      case "user":
        return {
          icon: <Users className="h-12 w-12 text-primary animate-pulse" />,
          title: "Loading User Dashboard",
          subtitle: "Preparing your rewards...",
          steps: [
          ]
        }
      default:
        return {
          icon: <Loader2 className="h-12 w-12 text-primary animate-spin" />,
          title: "Loading...",
          subtitle: message || "Please wait while we prepare everything",
          steps: []
        }
    }
  }

  const content = getLoadingContent()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-card border rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            {content.icon}
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold text-foreground">
              {content.title}
            </h2>
            <p className="text-muted-foreground">
              {content.subtitle}
            </p>
          </motion.div>

          {/* Loading Steps */}
          {content.steps.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="space-y-2">
                {content.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full bg-muted rounded-full h-2 overflow-hidden"
          >
            <div className="h-full bg-primary rounded-full animate-pulse" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 