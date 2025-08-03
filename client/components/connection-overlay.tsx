"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FancyLoader, SuccessAnimation } from "./fancy-loader"

interface ConnectionOverlayProps {
  isVisible: boolean
  userType: "user" | "merchant"
  isSuccess?: boolean
}

export function ConnectionOverlay({ isVisible, userType, isSuccess = false }: ConnectionOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="text-center space-y-6">
              {isSuccess ? (
                <SuccessAnimation />
              ) : (
                <>
                  <FancyLoader 
                    message={`Connecting as ${userType}...`} 
                    size="lg" 
                  />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Connecting Your Wallet
                    </h3>
                    <p className="text-sm text-gray-600">
                      Please approve the connection in your wallet
                    </p>
                  </div>
                  
                  {/* Connection steps */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Detecting wallet...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Requesting connection...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-400">Setting up account...</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 