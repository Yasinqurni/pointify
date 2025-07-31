import { create } from "zustand"
import { persist } from "zustand/middleware"
import { web3Service } from "./web3"

type UserType = "user" | "merchant" | null

interface WalletState {
  walletAddress: string | null
  isConnected: boolean
  userType: UserType
  networkId: number | null
  ethBalance: string | null
  merchantIDRXBalance: number | null // Merchant's IDRX balance
  merchantLoyalBalance: number | null // Merchant's LOYAL balance (formerly merchantQuota)
  totalLoyalRewarded: number | null // Total LOYAL rewarded by merchant (formerly totalPointsIssued)
  userLoyalBalance: number | null // User's LOYAL balance
  connectWallet: (address: string, type: UserType, networkId?: number, ethBalance?: string) => void
  disconnectWallet: () => void
  setMerchantIDRXBalance: (balance: number) => void
  setMerchantLoyalBalance: (balance: number) => void // Renamed from setMerchantQuota
  setTotalLoyalRewarded: (total: number) => void // Renamed from setTotalPointsIssued
  setUserLoyalBalance: (balance: number) => void
  setNetworkId: (networkId: number) => void
  setEthBalance: (balance: string) => void
  restoreConnection: () => Promise<boolean>
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      walletAddress: null,
      isConnected: false,
      userType: null,
      networkId: null,
      ethBalance: null,
      merchantIDRXBalance: null,
      merchantLoyalBalance: null, // Initialize
      totalLoyalRewarded: null, // Initialize
      userLoyalBalance: null,
      connectWallet: (address: string, type: UserType, networkId?: number, ethBalance?: string) =>
        set({ 
          walletAddress: address, 
          isConnected: true, 
          userType: type,
          networkId: networkId || null,
          ethBalance: ethBalance || null
        }),
      disconnectWallet: () => {
        web3Service.removeListeners()
        set({
          walletAddress: null,
          isConnected: false,
          userType: null,
          networkId: null,
          ethBalance: null,
          merchantIDRXBalance: null,
          merchantLoyalBalance: null,
          totalLoyalRewarded: null,
          userLoyalBalance: null,
        })
      },
      setMerchantIDRXBalance: (balance: number) => set({ merchantIDRXBalance: balance }),
      setMerchantLoyalBalance: (balance: number) => set({ merchantLoyalBalance: balance }),
      setTotalLoyalRewarded: (total: number) => set({ totalLoyalRewarded: total }),
      setUserLoyalBalance: (balance: number) => set({ userLoyalBalance: balance }),
      setNetworkId: (networkId: number) => set({ networkId }),
      setEthBalance: (balance: string) => set({ ethBalance }),
      restoreConnection: async () => {
        const state = get()
        if (!state.walletAddress || !state.isConnected) {
          return false
        }

        try {
          // Try to reconnect to the wallet
          const { address, provider } = await web3Service.connect()
          
          if (address.toLowerCase() === state.walletAddress.toLowerCase()) {
            // Same wallet, restore connection
            const network = await web3Service.getNetwork()
            const balance = await web3Service.getBalance(address)
            
            set({
              isConnected: true,
              networkId: network.chainId,
              ethBalance: balance
            })
            
            // Set up listeners
            web3Service.onAccountsChanged((accounts: string[]) => {
              if (accounts.length === 0) {
                get().disconnectWallet()
              } else if (accounts[0].toLowerCase() !== state.walletAddress?.toLowerCase()) {
                get().disconnectWallet()
              }
            })
            
            web3Service.onChainChanged((chainId: string) => {
              set({ networkId: parseInt(chainId, 16) })
            })
            
            return true
          } else {
            // Different wallet, disconnect
            get().disconnectWallet()
            return false
          }
        } catch (error) {
          console.error("Failed to restore wallet connection:", error)
          get().disconnectWallet()
          return false
        }
      }
    }),
    {
      name: "wallet-storage",
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        isConnected: state.isConnected,
        userType: state.userType,
        networkId: state.networkId,
        ethBalance: state.ethBalance,
        merchantIDRXBalance: state.merchantIDRXBalance,
        merchantLoyalBalance: state.merchantLoyalBalance,
        totalLoyalRewarded: state.totalLoyalRewarded,
        userLoyalBalance: state.userLoyalBalance,
      }),
    }
  )
)
