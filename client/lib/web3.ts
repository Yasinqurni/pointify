import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

export interface WalletProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (...args: any[]) => void) => void
  removeListener: (event: string, callback: (...args: any[]) => void) => void
  isMetaMask?: boolean
}

// Lisk Sepolia testnet configuration
export const LISK_SEPOLIA_CONFIG = {
  chainId: 4202,
  chainName: 'Lisk Sepolia Testnet',
  nativeCurrency: {
    name: 'Lisk',
    symbol: 'LSK',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
  blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
}

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null
  private ethereum: WalletProvider | null = null

  async connect(): Promise<{ address: string; provider: ethers.providers.Web3Provider }> {
    // Detect MetaMask or other wallet provider
    const ethereum = await detectEthereumProvider()
    
    if (!ethereum) {
      throw new Error('No Ethereum wallet detected. Please install MetaMask or another wallet.')
    }

    this.ethereum = ethereum as WalletProvider

    // Request account access
    const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' })
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.')
    }

    const address = accounts[0]

    // Create ethers provider
    this.provider = new ethers.providers.Web3Provider(this.ethereum)
    
    // Check and switch to Lisk Sepolia if needed
    await this.ensureCorrectNetwork()
    
    return { address, provider: this.provider }
  }

  async ensureCorrectNetwork(): Promise<void> {
    if (!this.ethereum) {
      throw new Error('Ethereum provider not available')
    }

    try {
      // Get current chain ID
      const chainId = await this.ethereum.request({ method: 'eth_chainId' })
      const currentChainId = parseInt(chainId, 16)

      // If not on Lisk Sepolia, switch to it
      if (currentChainId !== LISK_SEPOLIA_CONFIG.chainId) {
        await this.switchToLiskSepolia()
      }
    } catch (error) {
      console.error('Error checking/switching network:', error)
      throw new Error('Failed to switch to Lisk Sepolia testnet. Please switch manually.')
    }
  }

  async switchToLiskSepolia(): Promise<void> {
    if (!this.ethereum) {
      throw new Error('Ethereum provider not available')
    }

    try {
      // Try to switch to Lisk Sepolia
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${LISK_SEPOLIA_CONFIG.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await this.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${LISK_SEPOLIA_CONFIG.chainId.toString(16)}`,
                chainName: LISK_SEPOLIA_CONFIG.chainName,
                nativeCurrency: LISK_SEPOLIA_CONFIG.nativeCurrency,
                rpcUrls: LISK_SEPOLIA_CONFIG.rpcUrls,
                blockExplorerUrls: LISK_SEPOLIA_CONFIG.blockExplorerUrls,
              },
            ],
          })
        } catch (addError) {
          console.error('Error adding Lisk Sepolia network:', addError)
          throw new Error('Failed to add Lisk Sepolia network to your wallet. Please add it manually.')
        }
      } else {
        throw new Error('Failed to switch to Lisk Sepolia testnet. Please switch manually.')
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized. Please connect wallet first.')
    }

    const balance = await this.provider.getBalance(address)
    return ethers.utils.formatEther(balance)
  }

  async getNetwork(): Promise<ethers.providers.Network> {
    if (!this.provider) {
      throw new Error('Provider not initialized. Please connect wallet first.')
    }

    return await this.provider.getNetwork()
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized. Please connect wallet first.')
    }

    const signer = this.provider.getSigner()
    return await signer.signMessage(message)
  }

  onAccountsChanged(callback: (accounts: string[]) => void) {
    if (!this.ethereum) return

    this.ethereum.on('accountsChanged', callback)
  }

  onChainChanged(callback: (chainId: string) => void) {
    if (!this.ethereum) return

    this.ethereum.on('chainChanged', async (chainId: string) => {
      const newChainId = parseInt(chainId, 16)
      
      // If user switched to wrong network, try to switch back
      if (newChainId !== LISK_SEPOLIA_CONFIG.chainId) {
        try {
          await this.switchToLiskSepolia()
        } catch (error) {
          console.error('Failed to switch back to Lisk Sepolia:', error)
        }
      }
      
      callback(chainId)
    })
  }

  removeListeners() {
    if (!this.ethereum) return

    this.ethereum.removeListener('accountsChanged', () => {})
    this.ethereum.removeListener('chainChanged', () => {})
  }

  isConnected(): boolean {
    return this.provider !== null
  }

  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider
  }

  isOnLiskSepolia(): boolean {
    if (!this.provider) return false
    try {
      const network = this.provider.network
      return network.chainId === LISK_SEPOLIA_CONFIG.chainId
    } catch {
      return false
    }
  }
}

// Create a singleton instance
export const web3Service = new Web3Service() 