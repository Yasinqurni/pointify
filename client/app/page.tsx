"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useWalletStore } from "@/lib/store"
import { WalletConnect } from "@/components/wallet-connect"
import { motion } from "framer-motion"
import { User, Store } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()
  const { isConnected, userType } = useWalletStore()

  useEffect(() => {
    if (isConnected && userType === "merchant") {
      router.push("/dashboard") // Redirect to the original merchant dashboard
    } else if (isConnected && userType === "user") {
      router.push("/user-dashboard") // Redirect to user's rewards dashboard
    }
  }, [isConnected, userType, router])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 text-foreground relative overflow-hidden p-4">
      {/* Background animated blobs/particles simulation */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
        animate={{ x: [-50, 50, -50], y: [-50, 50, -50] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"
        animate={{ x: [50, -50, 50], y: [50, -50, 50] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"
        animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <motion.div
        className="relative z-10 text-center mb-12 max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="text-6xl md:text-7xl font-bold text-primary drop-shadow-lg mb-4" variants={itemVariants}>
          Pointify
        </motion.h1>
        <motion.p className="text-2xl md:text-3xl text-foreground font-medium mb-4" variants={itemVariants}>
          Turn Loyalty Into Real Rewards
        </motion.p>
        <motion.p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto" variants={itemVariants}>
          A Web3 loyalty system for modern merchants and customers.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="w-full max-w-md bg-card rounded-xl shadow-xl border border-border p-6 md:p-8 z-20"
      >
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">Choose Your Role</h2>
        <div className="flex flex-col gap-4">
          <WalletConnect userType="merchant">
            <Store className="mr-2 h-5 w-5" /> Enter as Merchant
          </WalletConnect>
          <WalletConnect userType="user">
            <User className="mr-2 h-5 w-5" /> Enter as Customer
          </WalletConnect>
        </div>
      </motion.div>

      <footer className="relative z-10 mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Pointify. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link
            href="https://github.com/vercel/v0"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="https://t.me/vercel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Telegram
          </Link>
        </div>
      </footer>
    </div>
  )
}
