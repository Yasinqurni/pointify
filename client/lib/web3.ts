import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

export interface WalletProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (...args: any[]) => void) => void
  removeListener: (event: string, callback: (...args: any[]) => void) => void
  isMetaMask?: boolean
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
    
    return { address, provider: this.provider }
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

    this.ethereum.on('chainChanged', callback)
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
}

// Create a singleton instance
export const web3Service = new Web3Service() 