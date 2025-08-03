"use client"

import { motion } from "framer-motion"
import { Sparkles, Wallet, Shield, CheckCircle } from "lucide-react"

interface FancyLoaderProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function FancyLoader({ message = "Connecting Wallet...", size = "md" }: FancyLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main animated container */}
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          className={`${sizeClasses[size]} border-2 border-blue-200 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulsing circle */}
        <motion.div
          className={`${sizeClasses[size]} absolute inset-0 border-2 border-blue-500 rounded-full`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Wallet className={`${iconSizes[size]} text-blue-600`} />
        </motion.div>
        
        {/* Floating sparkles */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-2 -left-2"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        >
          <Shield className="w-4 h-4 text-green-400" />
        </motion.div>
      </div>

      {/* Message with typing effect */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <motion.p
          className="text-sm font-medium text-gray-600"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.2 
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Success animation component
export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="flex flex-col items-center justify-center space-y-4"
    >
      <motion.div
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
        animate={{ 
          scale: [1, 1.2, 1],
          boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.4)", "0 0 0 20px rgba(34, 197, 94, 0)"]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <CheckCircle className="w-8 h-8 text-white" />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold text-green-600"
      >
        Connected Successfully!
      </motion.p>
    </motion.div>
  )
} 