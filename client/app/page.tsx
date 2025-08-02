"use client"

import { motion } from "framer-motion"
import { User, Store, Wallet, Sparkles, Star, Award, Zap, Shield, ArrowRight, CheckCircle } from "lucide-react"
import { XellarConnect } from "@/components/xellar-connect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Instant Rewards",
      description: "Real-time PLT token rewards for customer loyalty"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Blockchain",
      description: "Built on Lisk Sepolia for maximum security"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Quick transactions with minimal gas fees"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Merchant Benefits",
      description: "Increase customer retention and engagement"
    }
  ]

  const stats = [
    { number: "1000+", label: "Active Users" },
    { number: "50+", label: "Merchants" },
    { number: "10K+", label: "Rewards Issued" },
    { number: "99.9%", label: "Uptime" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pointify
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600"
          >
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </motion.div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 md:px-8">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Web3 Loyalty Platform
                  </motion.div>
                  
                  <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Turn Loyalty
                    </span>
                    <br />
                    <span className="text-gray-900">Into Real Rewards</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                    A revolutionary Web3 loyalty system that transforms customer engagement 
                    with instant blockchain rewards and seamless merchant tools.
                  </p>
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-blue-600">
                        {stat.number}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Column - Action Cards */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-6"
              >
                <Card className="glass-card border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-gray-900">
                          Choose Your Role
                        </h2>
                        <p className="text-gray-600">
                          Connect your wallet and start earning or rewarding
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <XellarConnect userType="merchant">
                          <div className="flex items-center justify-center space-x-3 w-full">
                            <Store className="h-5 w-5" />
                            <span>Enter as Merchant</span>
                            <ArrowRight className="h-4 w-4 ml-auto" />
                          </div>
                        </XellarConnect>
                        
                        <XellarConnect userType="user">
                          <div className="flex items-center justify-center space-x-3 w-full">
                            <User className="h-5 w-5" />
                            <span>Enter as Customer</span>
                            <ArrowRight className="h-4 w-4 ml-auto" />
                          </div>
                        </XellarConnect>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <Shield className="h-4 w-4" />
                          <span>Secure • Fast • Reliable</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="py-20 px-4 md:px-8"
          id="features"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Pointify?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the future of loyalty programs with blockchain technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="group"
                >
                  <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="py-8 px-4 md:px-8 border-t border-gray-200/50"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Pointify</span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <a href="#" className="hover:text-blue-600 transition-colors">GitHub</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Telegram</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
              </div>
              
              <div className="text-sm text-gray-500">
                © 2025 Pointify. All rights reserved.
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
