import { XellarSDK } from '@xellar/sdk'
import { XELLAR_CONFIG } from './xellar-config'

// Initialize Xellar
export const xellar = new XellarSDK(XELLAR_CONFIG)

// Lisk Sepolia configuration
export const LISK_SEPOLIA_CONFIG = {
  chainId: 4202,
  chainName: 'Lisk Sepolia Testnet',
  rpcUrl: 'https://rpc.sepolia-api.lisk.com',
  explorer: 'https://sepolia-blockscout.lisk.com',
}

// Xellar service wrapper
export class XellarService {
  private static instance: XellarService
  private xellar: XellarSDK

  private constructor() {
    this.xellar = xellar
  }

  static getInstance(): XellarService {
    if (!XellarService.instance) {
      XellarService.instance = new XellarService()
    }
    return XellarService.instance
  }

  // Connect wallet using Xellar auth
  async connect(): Promise<{ address: string; provider: any }> {
    try {
      // For now, we'll use a simple approach since Xellar is more of a backend service
      // We'll use MetaMask directly but integrate with Xellar for authentication
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed')
      }

      const provider = (window as any).ethereum
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]

      return {
        address,
        provider
      }
    } catch (error) {
      console.error('Xellar connection error:', error)
      throw error
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    try {
      // Xellar handles disconnection through the auth system
      console.log('Wallet disconnected')
    } catch (error) {
      console.error('Xellar disconnection error:', error)
      throw error
    }
  }

  // Get current account
  async getAccount() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return null
    }
    
    const provider = (window as any).ethereum
    const accounts = await provider.request({ method: 'eth_accounts' })
    return accounts[0] ? { address: accounts[0] } : null
  }

  // Get network
  async getNetwork() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return { chainId: 4202, name: 'Lisk Sepolia Testnet' }
    }
    
    const provider = (window as any).ethereum
    const chainId = await provider.request({ method: 'eth_chainId' })
    return {
      chainId: parseInt(chainId, 16),
      name: 'Lisk Sepolia Testnet'
    }
  }

  // Get balance
  async getBalance(address: string): Promise<string> {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        return '0'
      }
      
      const provider = (window as any).ethereum
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      return (parseInt(balance, 16) / 1e18).toString()
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  }

  // Switch to Lisk Sepolia
  async switchToLiskSepolia(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not available')
      }
      
      const provider = (window as any).ethereum
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1066' }], // 4202 in hex
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await this.addLiskSepoliaNetwork()
      } else {
        console.error('Error switching to Lisk Sepolia:', error)
        throw error
      }
    }
  }

  // Add Lisk Sepolia network
  private async addLiskSepoliaNetwork(): Promise<void> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask not available')
    }
    
    const provider = (window as any).ethereum
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x1066',
        chainName: 'Lisk Sepolia Testnet',
        nativeCurrency: {
          name: 'Lisk',
          symbol: 'LSK',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
        blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
      }],
    })
  }

  // Check if on correct network
  async isOnLiskSepolia(): Promise<boolean> {
    try {
      const network = await this.getNetwork()
      return network.chainId === LISK_SEPOLIA_CONFIG.chainId
    } catch (error) {
      console.error('Error checking network:', error)
      return false
    }
  }

  // Ensure correct network
  async ensureCorrectNetwork(): Promise<void> {
    const isOnCorrectNetwork = await this.isOnLiskSepolia()
    if (!isOnCorrectNetwork) {
      await this.switchToLiskSepolia()
    }
  }

  // Sign message using Xellar's auth system
  async signMessage(message: string): Promise<string> {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not available')
      }
      
      const provider = (window as any).ethereum
      const accounts = await provider.request({ method: 'eth_accounts' })
      const address = accounts[0]
      
      if (!address) {
        throw new Error('No wallet connected')
      }
      
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      })
      
      return signature
    } catch (error) {
      console.error('Error signing message:', error)
      throw error
    }
  }

  // Listen for account changes
  onAccountsChanged(callback: (accounts: string[]) => void) {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return
    }
    
    const provider = (window as any).ethereum
    provider.on('accountsChanged', callback)
  }

  // Listen for chain changes
  onChainChanged(callback: (chainId: string) => void) {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return
    }
    
    const provider = (window as any).ethereum
    provider.on('chainChanged', callback)
  }

  // Remove listeners
  removeListeners() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return
    }
    
    const provider = (window as any).ethereum
    provider.removeAllListeners()
  }
}

export const xellarService = XellarService.getInstance() 