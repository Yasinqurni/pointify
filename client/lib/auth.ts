// Cleaned AuthService.ts - Simplified version
import { xellarService } from './xellar'
import { 
  loginWithWallet, 
  registerMerchant, 
  registerMerchantWithToken, 
  refreshToken, 
  logout, 
  checkMerchant, 
  getMerchantByWallet, 
  type AuthResponse, 
  type LoginRequest, 
  type RegisterMerchantRequest 
} from './api'
import { useWalletStore } from './store'

const ACCESS_TOKEN_KEY = 'pointify_access_token'
const REFRESH_TOKEN_KEY = 'pointify_refresh_token'
const USER_DATA_KEY = 'pointify_user_data'

export class AuthService {
  private static instance: AuthService
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private userData: any = null

  private constructor() {
    this.loadTokens()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService()
    return AuthService.instance
  }

  private loadTokens() {
    if (typeof window === 'undefined') return
    this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const userData = localStorage.getItem(USER_DATA_KEY)
    if (userData) {
      try { this.userData = JSON.parse(userData) } catch { this.userData = null }
    }
  }

  private saveTokens(accessToken: string, refreshToken: string, userData: any) {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.userData = userData
    
    // Force reload to ensure tokens are properly loaded
    this.loadTokens()
  }

  private clearTokens() {
    if (typeof window === 'undefined') return
    
    // Clear all localStorage
    localStorage.clear()
    
    // Reset memory state
    this.accessToken = null
    this.refreshToken = null
    this.userData = null
    
    console.log("✅ All tokens and localStorage cleared")
  }

  private async signMessage(walletAddress: string): Promise<{ signature: string; message: string }> {
    const account = await xellarService.getAccount()
    if (!account || account.address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Wallet mismatch or not connected')
    }
    const timestamp = Date.now()
    const message = `Welcome to Pointify!\n\nPlease sign to authenticate.\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`
    const signature = await xellarService.signMessage(message)
    return { signature, message }
  }

  async login(walletAddress: string): Promise<AuthResponse> {
    const { signature, message } = await this.signMessage(walletAddress)
    const response = await loginWithWallet({ walletAddress, signature, message })
    if (!response.data?.accessToken || !response.data?.refreshToken) throw new Error('Missing tokens')
    
    // Force user type to merchant if we're connecting as merchant
    const userData = response.data.user || null
    if (userData && userData.userType === 'user') {
      // Check if we should be merchant instead
      const { userType } = useWalletStore.getState()
      if (userType === 'merchant') {
        userData.userType = 'merchant'
        console.log("🔍 Forcing user type to merchant")
      }
    }
    
    this.saveTokens(response.data.accessToken, response.data.refreshToken, userData)
    return response.data
  }

  async registerMerchant(walletAddress: string, name: string, description?: string, logoUrl?: string): Promise<AuthResponse> {
    const { signature, message } = await this.signMessage(walletAddress)
    const response = await registerMerchant({ walletAddress, signature, message, name, description, logoUrl })
    if (!response.data?.accessToken || !response.data?.refreshToken) throw new Error('Missing tokens')
    
    this.saveTokens(response.data.accessToken, response.data.refreshToken, response.data.user)
    return response.data
  }

  async refresh(): Promise<AuthResponse> {
    if (!this.refreshToken) throw new Error('No refresh token')
    const response = await refreshToken(this.refreshToken)
    if (!response.accessToken || !response.refreshToken) throw new Error('Missing tokens')
    
    this.saveTokens(response.accessToken, response.refreshToken, response.user)
    return response
  }

  async logout(): Promise<void> {
    this.clearTokens()
    return Promise.resolve()
  }

  // Force clear all tokens and localStorage - useful for debugging
  forceClearAll(): void {
    console.log("🧹 Force clearing all tokens and localStorage")
    this.clearTokens()
    // Also clear any other potential auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pointify_access_token')
      localStorage.removeItem('pointify_refresh_token')
      localStorage.removeItem('pointify_user_data')
      console.log("✅ All auth data cleared")
    }
  }

  getAccessToken(): string | null { return this.accessToken }
  getUserData(): any { return this.userData }
  isAuthenticated(): boolean { return !!this.accessToken }
  getUserType(): 'user' | 'merchant' | null { return this.userData?.userType || null }
  getWalletAddress(): string | null { return this.userData?.walletAddress || null }

  // Debug method to check JWT token contents
  debugToken(): void {
    if (!this.accessToken) {
      console.log("🔍 No access token found")
      return
    }
    
    try {
      // Decode JWT token (without verification for debugging)
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]))
      console.log("🔍 JWT Token payload:", payload)
      console.log("🔍 User data from localStorage:", this.userData)
      console.log("🔍 getUserType() result:", this.getUserType())
    } catch (error) {
      console.error("❌ Failed to decode JWT token:", error)
    }
  }

  async checkMerchant(walletAddress: string) { return await checkMerchant(walletAddress) }
  async getMerchantByAddress(walletAddress: string) { return await getMerchantByWallet(walletAddress) }
}

export const authService = AuthService.getInstance()
export const getAccessTokenSafely = (): string | null => {
  console.log("🔍 getAccessTokenSafely: Attempting to get access token...")
  
  try {
    // First try to get from memory/storage
    let token = authService.getAccessToken()
    
    if (token) {
      console.log("✅ getAccessTokenSafely: Token retrieved successfully")
      return token
    } else {
      console.log("❌ getAccessTokenSafely: No token available")
      return null
    }
  } catch (error) {
    console.error("❌ getAccessTokenSafely: Error retrieving token:", error)
    return null
  }
}
