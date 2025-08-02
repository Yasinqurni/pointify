import { getIDRXBalance, IDRX_CONTRACT_ADDRESS } from './idrx-contract'
import { mockGetMerchantLoyalBalance, mockGetUserLoyalBalance, mockGetTotalLoyalRewarded } from './ethers'
import { useWalletStore } from './store'
import { web3Service } from './web3'

export interface BalanceData {
  idrxBalance: number
  loyalBalance: number
  totalLoyalRewarded?: number // Only for merchants
  ethBalance?: string
}

// Cache for balance data
const balanceCache = new Map<string, { data: BalanceData; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

// Debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export class BalanceService {
  
  /**
   * Get cached balance data if available and not expired
   */
  private getCachedBalance(address: string, userType: 'user' | 'merchant'): BalanceData | null {
    const cacheKey = `${address}-${userType}`
    const cached = balanceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    
    return null
  }

  /**
   * Cache balance data
   */
  private cacheBalance(address: string, userType: 'user' | 'merchant', data: BalanceData): void {
    const cacheKey = `${address}-${userType}`
    balanceCache.set(cacheKey, { data, timestamp: Date.now() })
  }

  /**
   * Clear cache for a specific address
   */
  clearCache(address?: string): void {
    if (address) {
      // Clear specific address cache
      for (const key of balanceCache.keys()) {
        if (key.startsWith(address)) {
          balanceCache.delete(key)
        }
      }
    } else {
      // Clear all cache
      balanceCache.clear()
    }
    console.log('🗑️ Cleared balance cache')
  }
  
  /**
   * Fetch IDRX balance from contract 0x7222435AC83D6c44052eB635112842Da458AEfD8
   * Uses ethers.js to read balance and decimals
   */
  async getIDRXBalance(address: string): Promise<number> {
    console.log('BalanceService: About to call getIDRXBalance for', address)
    const result = await getIDRXBalance(address)
    console.log('BalanceService: getIDRXBalance returned', result)
    return result
  }

  /**
   * Fetch LOYAL balance (still using mock for now)
   */
  async getLoyalBalance(address: string, userType: 'user' | 'merchant'): Promise<number> {
    try {
      if (userType === 'merchant') {
        return await mockGetMerchantLoyalBalance(address)
      } else {
        return await mockGetUserLoyalBalance(address)
      }
    } catch (error) {
      console.error('❌ Failed to fetch LOYAL balance:', error)
      return 0
    }
  }

  /**
   * Fetch total LOYAL rewarded (for merchants only)
   */
  async getTotalLoyalRewarded(address: string): Promise<number> {
    try {
      return await mockGetTotalLoyalRewarded(address)
    } catch (error) {
      console.error('❌ Failed to fetch total LOYAL rewarded:', error)
      return 0
    }
  }

  /**
   * Fetch ETH balance
   */
  async getETHBalance(address: string): Promise<string> {
    try {
      if (!web3Service.isConnected()) {
        return '0'
      }
      return await web3Service.getBalance(address)
    } catch (error) {
      console.error('❌ Failed to fetch ETH balance:', error)
      return '0'
    }
  }

  /**
   * Fetch all balances for a user/merchant with caching
   */
  async getAllBalances(address: string, userType: 'user' | 'merchant'): Promise<BalanceData> {
    // Check cache first
    const cached = this.getCachedBalance(address, userType)
    if (cached) {
      return cached
    }
    
    try {
      const [idrxBalance, loyalBalance, ethBalance] = await Promise.all([
        this.getIDRXBalance(address),
        this.getLoyalBalance(address, userType),
        this.getETHBalance(address)
      ])

      let totalLoyalRewarded: number | undefined
      if (userType === 'merchant') {
        totalLoyalRewarded = await this.getTotalLoyalRewarded(address)
      }

      const balanceData: BalanceData = {
        idrxBalance,
        loyalBalance,
        ethBalance,
        ...(totalLoyalRewarded !== undefined && { totalLoyalRewarded })
      }

      // Cache the result
      this.cacheBalance(address, userType, balanceData)

      return balanceData
    } catch (error) {
      console.error('❌ Failed to fetch all balances:', error)
      
      // Return default values on error
      return {
        idrxBalance: 0,
        loyalBalance: 0,
        ethBalance: '0',
        ...(userType === 'merchant' && { totalLoyalRewarded: 0 })
      }
    }
  }

  /**
   * Refresh balances and update store with debouncing
   */
  refreshBalances: ReturnType<typeof debounce> = debounce(async (address: string, userType: 'user' | 'merchant'): Promise<void> => {
    try {
      const balances = await this.getAllBalances(address, userType)
      const store = useWalletStore.getState()

      // Update store with new balances
      if (userType === 'merchant') {
        store.setMerchantIDRXBalance(balances.idrxBalance)
        store.setMerchantLoyalBalance(balances.loyalBalance)
        if (balances.totalLoyalRewarded !== undefined) {
          store.setTotalLoyalRewarded(balances.totalLoyalRewarded)
        }
      } else {
        store.setUserLoyalBalance(balances.loyalBalance)
      }

      if (balances.ethBalance) {
        store.setEthBalance(balances.ethBalance)
      }
    } catch (error) {
      console.error('❌ Failed to refresh balances:', error)
    }
  }, 1000) // 1 second debounce

  /**
   * Refresh balances immediately (no debouncing) for initial loads
   */
  async refreshBalancesImmediate(address: string, userType: 'user' | 'merchant'): Promise<void> {
    try {
      const balances = await this.getAllBalances(address, userType)
      const store = useWalletStore.getState()

      // Update store with new balances
      if (userType === 'merchant') {
        store.setMerchantIDRXBalance(balances.idrxBalance)
        store.setMerchantLoyalBalance(balances.loyalBalance)
        if (balances.totalLoyalRewarded !== undefined) {
          store.setTotalLoyalRewarded(balances.totalLoyalRewarded)
        }
      } else {
        store.setUserLoyalBalance(balances.loyalBalance)
      }

      if (balances.ethBalance) {
        store.setEthBalance(balances.ethBalance)
      }
    } catch (error) {
      console.error('❌ Failed to refresh balances:', error)
    }
  }

  /**
   * Get IDRX token info
   */
  async getIDRXTokenInfo(): Promise<{
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    contractAddress: string
  }> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        idrxContract.getName(),
        idrxContract.getSymbol(),
        idrxContract.getDecimals(),
        idrxContract.getTotalSupply()
      ])

      return {
        name,
        symbol,
        decimals,
        totalSupply,
        contractAddress: IDRX_CONTRACT_ADDRESS
      }
    } catch (error) {
      console.error('❌ Failed to get IDRX token info:', error)
      
      // Return default info
      return {
        name: 'Indonesian Rupiah Token',
        symbol: 'IDRX',
        decimals: 18,
        totalSupply: '0',
        contractAddress: IDRX_CONTRACT_ADDRESS
      }
    }
  }

  /**
   * Watch balance changes (for real-time updates)
   */
  async startBalanceWatcher(address: string, userType: 'user' | 'merchant', intervalMs: number = 30000): Promise<void> {
    console.log(`👀 Starting balance watcher for ${userType}: ${address}`)
    
    // Initial load
    await this.refreshBalances(address, userType)
    
    // Set up periodic refresh
    const interval = setInterval(async () => {
      try {
        await this.refreshBalances(address, userType)
      } catch (error) {
        console.error('❌ Balance watcher error:', error)
      }
    }, intervalMs)

    // Store interval ID for cleanup
    ;(globalThis as any).balanceWatcherInterval = interval
  }

  /**
   * Stop balance watcher
   */
  stopBalanceWatcher(): void {
    if ((globalThis as any).balanceWatcherInterval) {
      clearInterval((globalThis as any).balanceWatcherInterval)
      ;(globalThis as any).balanceWatcherInterval = null
      console.log('⏹️ Balance watcher stopped')
    }
  }
}

// Create singleton instance
export const balanceService = new BalanceService() 