import { ethers } from 'ethers'
import { 
  loginWithWallet, 
  registerUser, 
  registerMerchant, 
  refreshToken, 
  logout,
  checkUser,
  checkMerchant,
  getUserByAddress,
  getMerchantByWallet,
  type AuthResponse,
  type LoginRequest,
  type RegisterUserRequest,
  type RegisterMerchantRequest
} from './api'

// Token storage keys
const ACCESS_TOKEN_KEY = 'pointify_access_token'
const REFRESH_TOKEN_KEY = 'pointify_refresh_token'
const USER_DATA_KEY = 'pointify_user_data'

// Authentication service
export class AuthService {
  private static instance: AuthService
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private userData: any = null

  private constructor() {
    this.loadTokensFromStorage()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Load tokens from localStorage
  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      const userDataStr = localStorage.getItem(USER_DATA_KEY)
      if (userDataStr) {
        this.userData = JSON.parse(userDataStr)
      }
      console.log("🔍 Loaded tokens from storage:", {
        accessToken: !!this.accessToken,
        refreshToken: !!this.refreshToken,
        userData: !!this.userData
      })
    }
  }

  // Save tokens to localStorage
  private saveTokensToStorage(accessToken: string, refreshToken: string, userData: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    }
  }

  // Clear tokens from localStorage
  private clearTokensFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_DATA_KEY)
    }
  }

  // Generate signature message
  private generateSignatureMessage(walletAddress: string, timestamp: number): string {
    return `Welcome to Pointify!\n\nPlease sign this message to authenticate with your wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will be used to verify your identity and authenticate your session.`
  }

  // Sign message with wallet
  private async signMessage(walletAddress: string): Promise<{ signature: string; message: string }> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    
    // Verify the signer address matches
    const signerAddress = await signer.getAddress()
    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Wallet address mismatch. Please use the correct wallet.')
    }

    const timestamp = Date.now()
    const message = this.generateSignatureMessage(walletAddress, timestamp)
    const signature = await signer.signMessage(message)

    return { signature, message }
  }

  // Login with wallet
  async login(walletAddress: string): Promise<AuthResponse> {
    try {
      const { signature, message } = await this.signMessage(walletAddress)
      
      const loginData: LoginRequest = {
        walletAddress,
        signature,
        message
      }

      const response = await loginWithWallet(loginData)
      
      console.log("🔍 Login response received:", {
        accessToken: !!response.data.accessToken,
        refreshToken: !!response.data.refreshToken,
        userData: !!response.data.user
      })
      
      // Save tokens and user data
      this.accessToken = response.data.accessToken
      this.refreshToken = response.data.refreshToken
      this.userData = response.data.user
      this.saveTokensToStorage(response.data.accessToken, response.data.refreshToken, response.data.user)

      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // Register user with wallet
  async registerUser(walletAddress: string, name?: string): Promise<AuthResponse> {
    try {
      const { signature, message } = await this.signMessage(walletAddress)
      
      const registerData: RegisterUserRequest = {
        walletAddress,
        signature,
        message,
        name
      }

      const response = await registerUser(registerData)
      
      // Save tokens and user data
      this.accessToken = response.data.accessToken
      this.refreshToken = response.data.refreshToken
      this.userData = response.data.user
      this.saveTokensToStorage(response.data.accessToken, response.data.refreshToken, response.data.user)

      return response.data
    } catch (error) {
      console.error('User registration failed:', error)
      throw error
    }
  }

  // Register merchant with wallet
  async registerMerchant(walletAddress: string, name: string, description?: string, logoUrl?: string): Promise<AuthResponse> {
    try {
      const { signature, message } = await this.signMessage(walletAddress)
      
      const registerData: RegisterMerchantRequest = {
        walletAddress,
        signature,
        message,
        name,
        description,
        logoUrl
      }

      const response = await registerMerchant(registerData)
      
      // Save tokens and user data
      this.accessToken = response.data.accessToken
      this.refreshToken = response.data.refreshToken
      this.userData = response.data.user
      this.saveTokensToStorage(response.data.accessToken, response.data.refreshToken, response.data.user)

      return response.data
    } catch (error) {
      console.error('Merchant registration failed:', error)
      throw error
    }
  }

  // Refresh token
  async refresh(): Promise<AuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await refreshToken(this.refreshToken)
      
      // Update tokens and user data
      this.accessToken = response.accessToken
      this.refreshToken = response.refreshToken
      this.userData = response.user
      this.saveTokensToStorage(response.accessToken, response.refreshToken, response.user)

      return response
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      throw error
    }
  }

  // Logout
  async logout(): Promise<void> {
    if (this.accessToken) {
      try {
        await logout(this.accessToken)
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }

    this.clearTokensFromStorage()
    this.accessToken = null
    this.refreshToken = null
    this.userData = null
  }

  // Check if user exists
  async checkUser(walletAddress: string): Promise<{ exists: boolean; user?: any }> {
    return await checkUser(walletAddress)
  }

  // Check if merchant exists
  async checkMerchant(walletAddress: string): Promise<{ data: { exists: boolean; merchant?: any } }> {
    return await checkMerchant(walletAddress)
  }

  // Get user by address
  async getUserByAddress(walletAddress: string): Promise<any> {
    return await getUserByAddress(walletAddress)
  }

  // Get merchant by address
  async getMerchantByAddress(walletAddress: string): Promise<any> {
    return await getMerchantByWallet(walletAddress)
  }

  // Get current access token
  getAccessToken(): string | null {
    console.log("🔍 Getting access token:", this.accessToken ? "Token exists" : "No token")
    return this.accessToken
  }

  // Get current user data
  getUserData(): any {
    return this.userData
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    console.log("🔍 Checking authentication - accessToken:", !!this.accessToken)
    console.log("🔍 Checking authentication - userData:", !!this.userData)
    return !!this.accessToken
  }

  // Get user type
  getUserType(): 'user' | 'merchant' | null {
    return this.userData?.userType || null
  }

  // Get wallet address
  getWalletAddress(): string | null {
    return this.userData?.walletAddress || null
  }
}

// Export singleton instance
export const authService = AuthService.getInstance() 