"use client"

import { motion } from "framer-motion"
import { User, Store, Wallet } from "lucide-react"
import { XellarConnect } from "@/components/xellar-connect"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
            Pointify
          </h1>
          <p className="text-2xl font-semibold text-gray-800 mb-2">
            Turn Loyalty Into Real Rewards
          </p>
          <p className="text-lg text-gray-600">
            A Web3 loyalty system for modern merchants and customers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Choose Your Role
          </h2>
          
          <div className="space-y-4">
            <XellarConnect userType="merchant">
              <Store className="h-5 w-5" />
              Enter as Merchant
            </XellarConnect>
            
            <XellarConnect userType="user">
              <User className="h-5 w-5" />
              Enter as Customer
            </XellarConnect>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>© 2025 Pointify. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="text-blue-600 hover:text-blue-800">GitHub</a>
            <a href="#" className="text-blue-600 hover:text-blue-800">Telegram</a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
