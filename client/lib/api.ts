// Real API calls to the NestJS server
// This replaces the mock API calls with actual HTTP requests

import { authService, getAccessTokenSafely } from "./auth"
import { useWalletStore } from "./store"

// --- Data Models ---
export interface Reward {
  id: string
  title: string
  description: string
  imageUrl: string
  merchantName: string
  merchantLogoUrl: string
  requiredPoints: number
  expiryDate: string // YYYY-MM-DD
}

// Type for creating rewards (only fields that should be sent to server)
export interface CreateRewardRequest {
  title: string
  description: string
  imageUrl: string
  requiredPoints: number
  expiryDate: string
  isActive?: boolean
}

// Loyalty Settings types
export interface LoyaltySettings {
  id: string
  pointsPerDollar: number
  pointsPerRupiah: number
  autoCalculate: boolean
  minimumPurchase: number
  defaultRewardPoints: number
  expirationDays: number
  allowNegativeBalance: boolean
  merchantId: string
  createdAt: string
  updatedAt: string
}

export interface UpdateLoyaltySettingsRequest {
  pointsPerDollar?: number
  pointsPerRupiah?: number
  autoCalculate?: boolean
  minimumPurchase?: number
  defaultRewardPoints?: number
  expirationDays?: number
  allowNegativeBalance?: boolean
}

export interface Redemption {
  id: string
  userId: string
  rewardId: string
  rewardTitle: string
  merchantName: string
  redeemedPoints: number
  redeemedDate: string
  claimCode: string
  status: "pending" | "claimed" | "expired"
}

export interface PointReception {
  id: string
  userId: string
  merchantName: string
  pointsReceived: number
  receivedDate: string
  transactionHash: string
}

// Authentication interfaces
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    walletAddress: string
    userType: 'user' | 'merchant'
    name?: string
    description?: string
    logoUrl?: string
  }
}

export interface LoginRequest {
  walletAddress: string
  signature: string
  message: string
}

export interface RegisterMerchantRequest {
  walletAddress: string
  signature: string
  message: string
  name: string
  description?: string
  logoUrl?: string
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    console.log(`📡 Response status: ${response.status}`)
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    const jsonResponse = await response.json()
    console.log(`📦 Raw JSON response:`, jsonResponse)
    console.log(`📦 Response type:`, typeof jsonResponse)
    console.log(`📦 Response keys:`, Object.keys(jsonResponse))
    
    return jsonResponse
  } catch (error) {
    console.warn(`Server unavailable, falling back to mock data for: ${endpoint}`, error)
    throw error // Re-throw to let individual functions handle with mock data
  }
}

// Helper function to handle authentication redirects
function handleAuthRedirect() {
  console.log('Authentication required, redirecting to login')
  authService.logout()
  
  // Add a guard to prevent infinite redirects
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    console.log('Redirecting to login page')
    window.location.href = '/'
  } else {
    console.log('Already on login page, not redirecting')
  }
}

// Helper function for authenticated API calls
async function authenticatedApiCall<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Validate token before making request
  if (!token || token.trim() === '') {
    console.error("❌ authenticatedApiCall: No access token provided for", endpoint)
    throw new Error("Authentication required: No access token available")
  }

  console.log(`🔍 authenticatedApiCall: Making request to ${endpoint}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`❌ API call failed: ${response.status} ${response.statusText} - ${errorText}`)
      
      // If unauthorized, the token might be invalid
      if (response.status === 401) {
        console.error("❌ 401 Unauthorized - token may be invalid or expired")
      }
      
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`✅ authenticatedApiCall: Success for ${endpoint}`)
    return result
  } catch (error) {
    console.error(`❌ Authenticated API call failed for ${endpoint}:`, error)
    throw error
  }
}

// --- Authentication API Functions ---

/**
 * Login with wallet signature
 * @param loginData Wallet address, signature, and message
 * @returns Authentication response with tokens
 */
export async function loginWithWallet(loginData: LoginRequest): Promise<{ data: AuthResponse }> {
  console.log("🔍 API: loginWithWallet called with:", loginData.walletAddress)
  
  try {
    console.log("🔍 API: Sending login request for merchant")
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })

    console.log("🔍 API: Login response status:", response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ API: Login failed:", errorData)
      throw new Error(errorData.message || `Login failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ API: Login successful:", data)
    return { data }
  } catch (error) {
    console.error("❌ API: Login error:", error)
    throw error
  }
}

/**
 * Refresh authentication token
 * @param refreshToken The refresh token
 * @returns New authentication response
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  console.log('Refreshing authentication token')
  try {
    return await apiCall<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  } catch (error) {
    console.error('Failed to refresh token:', error)
    throw new Error('Token refresh failed. Please login again.')
  }
}

/**
 * Logout and invalidate token
 * @param accessToken The current access token
 */
export async function logout(accessToken: string): Promise<void> {
  console.log('Logging out')
  try {
    await authenticatedApiCall('/auth/logout', accessToken, {
      method: 'POST'
    })
  } catch (error) {
    console.error('Failed to logout:', error)
    // Don't throw error for logout failure
  }
}

/**
 * Register new merchant with wallet signature
 * @param registerData Merchant registration data with signature
 * @returns Authentication response
 */
export async function registerMerchant(registerData: RegisterMerchantRequest): Promise<{ data: AuthResponse }> {
  console.log(`🔐 Registering merchant: ${registerData.walletAddress}`)
  try {
    return await apiCall<AuthResponse>('/auth/register/merchant', {
      method: 'POST',
      body: JSON.stringify(registerData)
    })
  } catch (error) {
    console.error('❌ Merchant registration failed:', error)
    throw new Error('Merchant registration failed. Please try again.')
  }
}

/**
 * Register new merchant with existing authentication token
 * @param registerData Merchant registration data
 * @param token Existing authentication token
 * @returns Authentication response
 */
export async function registerMerchantWithToken(registerData: any, token: string): Promise<{ data: AuthResponse }> {
  console.log(`🔐 Registering merchant with token: ${registerData.walletAddress}`)
  try {
    return await authenticatedApiCall<AuthResponse>('/auth/register/merchant-with-token', token, {
      method: 'POST',
      body: JSON.stringify(registerData)
    })
  } catch (error) {
    console.error('❌ Merchant registration with token failed:', error)
    throw new Error('Merchant registration failed. Please try again.')
  }
}

/**
 * Check if merchant exists
 * @param walletAddress The wallet address to check
 * @returns Merchant existence status
 */
export async function checkMerchant(walletAddress: string): Promise<{ data: { exists: boolean; merchant?: any } }> {
  console.log(`Checking if merchant exists: ${walletAddress}`)
  try {
    const response = await apiCall<{ exists: boolean; merchant?: any }>('/auth/check/merchant', {
      method: 'POST',
      body: JSON.stringify({ walletAddress })
    })
    return { data: response }
  } catch (error: any) {
    console.error('Failed to check merchant:', error)
    
    // If it's a 401 error saying merchant already exists, show proper error
    if (error.message && error.message.includes("Merchant already exists")) {
      throw new Error("Merchant already registered. Please use a different wallet address.")
    }
    
    // For other errors, re-throw the original error
    throw error
  }
}

/**
 * Get merchant by wallet address
 * @param walletAddress The wallet address
 * @returns Merchant data
 */
export async function getMerchantByWallet(walletAddress: string): Promise<any> {
  console.log(`Getting merchant by address: ${walletAddress}`)
  try {
    return await apiCall<any>(`/auth/merchant/${walletAddress}`)
  } catch (error) {
    console.error('Failed to get merchant:', error)
    throw new Error('Failed to get merchant data.')
  }
}

export async function updateMerchantStatus(
  walletAddress: string, 
  status: 'APPROVED' | 'REJECTED', 
  transactionHash?: string
): Promise<any> {
  console.log(`Updating merchant status: ${walletAddress} -> ${status}`)
  try {
    const token = await getAccessTokenSafely()
    if (!token) {
      throw new Error('No authentication token available')
    }
    
    return await authenticatedApiCall<any>('/auth/merchant/status', token, {
      method: 'PUT',
      body: JSON.stringify({
        walletAddress,
        status,
        transactionHash
      })
    })
  } catch (error) {
    console.error('Failed to update merchant status:', error)
    throw new Error('Failed to update merchant status.')
  }
}

// --- Existing API Functions ---

/**
 * Fetches all available rewards from the server.
 * @returns A promise that resolves with an array of Reward objects.
 */
export async function fetchRewards(): Promise<{ data: Reward[] }> {
  console.log("Fetching all rewards from server...")
  try {
    const response = await apiCall<Reward[]>('/rewards')
    return { data: response }
  } catch (error) {
    console.error('Failed to fetch rewards:', error)
    throw new Error('Server is unavailable. Please try again later.')
  }
}

/**
 * Fetches rewards for the authenticated merchant.
 * @returns A promise that resolves with an array of Reward objects.
 */
export async function fetchMerchantRewards(): Promise<{ data: Reward[] }> {
  console.log("🔍 Fetching rewards for authenticated merchant...")
  try {
    const token = authService.getAccessToken()
    console.log("🔍 Token available:", !!token)
    
    if (!token) {
      console.log("🔍 No token available, trying to authenticate first...")
      // Try to get the wallet address from the store
      const { walletAddress } = useWalletStore.getState()
      if (!walletAddress) {
        throw new Error('No wallet connected')
      }
      
      // Try to login first
      try {
        await authService.login(walletAddress)
        console.log("🔍 Successfully authenticated, retrying fetch...")
        // Retry the fetch after authentication
        const newToken = authService.getAccessToken()
        if (!newToken) {
          throw new Error('Authentication failed')
        }
        const result = await authenticatedApiCall<Reward[]>('/rewards/merchant', newToken)
        console.log("🔍 API call result:", result)
        return { data: result }
      } catch (authError) {
        console.error('❌ Authentication failed:', authError)
        throw new Error('Please login first to view your rewards.')
      }
    }
    
    console.log("🔍 Making authenticated API call to /rewards/merchant")
    const result = await authenticatedApiCall<Reward[]>('/rewards/merchant', token)
    console.log("🔍 API call result:", result)
    return { data: result }
  } catch (error) {
    console.error('❌ Failed to fetch merchant rewards:', error)
    throw new Error('Server is unavailable. Please try again later.')
  }
}

/**
 * Fetches rewards for a specific merchant by wallet address.
 * @param walletAddress The merchant's wallet address
 * @returns A promise that resolves with an array of Reward objects.
 */
export async function fetchMerchantRewardsByAddress(walletAddress: string): Promise<{ data: Reward[] }> {
  console.log("🔍 Fetching rewards for merchant by address:", walletAddress)
  try {
    const result = await apiCall<Reward[]>(`/rewards/merchant/${walletAddress}`)
    console.log("🔍 API call result:", result)
    return { data: result }
  } catch (error) {
    console.error('❌ Failed to fetch merchant rewards by address:', error)
    throw new Error('Failed to load rewards. Please try again.')
  }
}

export async function fetchMerchantRewardsProtected(): Promise<{ data: Reward[] }> {
  console.log("🔍 Fetching authenticated merchant rewards")
  try {
    // Get the auth token safely from localStorage
    const token = authService.getAccessToken()
    
    if (!token) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in.')
    }

    const result = await authenticatedApiCall<Reward[]>(`/rewards/merchant`, token)
    console.log("🔍 Protected API call result:", result)
    return { data: result }
  } catch (error) {
    console.error('❌ Failed to fetch authenticated merchant rewards:', error)
    
    // If it's an authentication error, redirect to login
    if (error instanceof Error && (
      error.message.includes('401') || 
      error.message.includes('authentication') ||
      error.message.includes('token')
    )) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in.')
    }
    
    throw new Error('Failed to load rewards. Please try again.')
  }
}

/**
 * A user redeeming a reward.
 * @param rewardId The ID of the reward to redeem.
 * @returns A promise that resolves with the new Redemption object.
 */
export async function redeemReward(rewardId: string): Promise<Redemption> {
  console.log(`Redeeming reward ${rewardId} (user identified by JWT token)`)
  
  // Get access token for authentication (with retry logic)
  const accessToken = authService.getAccessToken()
  if (!accessToken) {
    throw new Error('No access token available. Please log in again.')
  }
  
  try {
    return await authenticatedApiCall<Redemption>('/redemptions', accessToken, {
      method: 'POST',
      body: JSON.stringify({ rewardId }), // Only send rewardId, userId comes from JWT
    })
  } catch (error) {
    console.error('Failed to redeem reward:', error)
    throw error
  }
}

/**
 * Creating a new reward.
 * @param newRewardData The data for the new reward.
 * @returns A promise that resolves with the created Reward object.
 */
export async function createReward(newRewardData: CreateRewardRequest): Promise<Reward> {
  console.log("Creating new reward:", newRewardData)
  try {
    // Get the auth token safely from localStorage
    const token = authService.getAccessToken()
    
    if (!token) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in.')
    }

    return await authenticatedApiCall<Reward>('/rewards', token, {
      method: 'POST',
      body: JSON.stringify(newRewardData),
    })
  } catch (error) {
    console.error('Failed to create reward:', error)
    
    // If it's an authentication error, redirect to login
    if (error instanceof Error && (
      error.message.includes('401') || 
      error.message.includes('authentication') ||
      error.message.includes('token')
    )) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in.')
    }
    
    throw error
  }
}

/**
 * Verifying a claim code for redemption.
 * @param claimCode The unique claim code generated when user redeems a reward.
 * @returns A promise that resolves with the redemption details or null if invalid.
 * 
 * REDEMPTION METADATA STRUCTURE:
 * - claimCode: Unique code (e.g., "ABC123XYZ") generated when user redeems
 * - redemptionId: Database ID of the redemption record
 * - userId: Customer's wallet address (e.g., "0x1234...5678")
 * - rewardId: ID of the reward being redeemed
 * - rewardTitle: Name of the reward (e.g., "Free Coffee")
 * - merchantName: Merchant's business name
 * - redeemedPoints: Number of LOYAL points spent
 * - status: "pending" | "claimed" | "expired"
 * - redeemedDate: When the redemption was created
 */
export async function verifyClaimCode(claimCode: string): Promise<Redemption | null> {
  // Get access token for authentication (with retry logic)
  const accessToken = authService.getAccessToken()
  if (!accessToken) {
    throw new Error('No access token available. Please log in again.')
  }
  
  try {
    return await authenticatedApiCall<Redemption | null>(`/redemptions/verify/${claimCode}`, accessToken)
  } catch (error) {
    console.error('Failed to verify claim code:', error)
    throw new Error('Invalid claim code or code does not belong to your store.')
  }
}

/**
 * Marking a redemption as claimed by a merchant.
 * @param redemptionId The ID of the redemption to mark as claimed.
 * @returns A promise that resolves when the status is updated.
 */
export async function confirmClaim(redemptionId: string): Promise<void> {
  console.log(`Confirming claim for redemption: ${redemptionId}`)
  try {
    await apiCall(`/redemptions/${redemptionId}/confirm`, {
      method: 'PUT',
    })
  } catch (error) {
    console.error('Failed to confirm claim:', error)
    throw new Error('Server is unavailable. Please try again later.')
  }
}

/**
 * Fetching a user's redemption history.
 * @param userId The user's wallet address.
 * @returns A promise that resolves with an array of Redemption objects.
 */
export async function fetchUserRedemptions(userId: string): Promise<Redemption[]> {
  console.log(`Fetching redemption history for user: ${userId}`)
  try {
    return await apiCall<Redemption[]>(`/redemptions/user/${userId}`)
  } catch (error) {
    console.error('Failed to fetch user redemptions:', error)
    return []
  }
}

/**
 * Fetching a user's point reception history.
 * @param userId The user's wallet address.
 * @returns A promise that resolves with an array of PointReception objects.
 */
export async function fetchUserPointReceptionLogs(userId: string): Promise<PointReception[]> {
  console.log(`Fetching point reception history for user: ${userId}`)
  try {
    return await apiCall<PointReception[]>(`/points/user/${userId}`)
  } catch (error) {
    console.error('Failed to fetch user point reception logs:', error)
    return []
  }
}

/**
 * Fetching all redemption logs for merchants.
 * @returns A promise that resolves with an array of Redemption objects.
 */
export async function fetchMerchantRedemptionLogs(): Promise<Redemption[]> {
  console.log("Fetching all merchant redemption logs...")
  
  // Get access token for authentication (with retry logic)
  const accessToken = getAccessTokenSafely()
  if (!accessToken) {
    throw new Error('No access token available. Please log in again.')
  }
  
  try {
    return await authenticatedApiCall<Redemption[]>('/redemptions/merchant', accessToken)
  } catch (error) {
    console.error('Failed to fetch merchant redemption logs:', error)
    return []
  }
}

/**
 * Fetching dashboard-specific data for a merchant.
 * @param merchantId The merchant's ID.
 * @returns A promise that resolves with the merchant's dashboard data.
 */
export async function fetchMerchantDashboardData(merchantId: string) {
  console.log(`Fetching dashboard data for merchant: ${merchantId}`)
  try {
    return await apiCall(`/rewards/merchant/${merchantId}/dashboard`)
  } catch (error) {
    console.error('Failed to fetch merchant dashboard data:', error)
    return { totalCustomers: 0 }
  }
}

/**
 * Fetching data for a merchant.
 * @param merchantId The merchant's ID.
 * @returns A promise that resolves with the merchant's data.
 */
export async function fetchMerchantData(merchantId?: string) {
  console.log(`Fetching authenticated merchant data`)
  try {
    // Get the auth token safely from localStorage 
    const token = getAccessTokenSafely()
    
    console.log("🔍 fetchMerchantData - token check:", token ? "Token exists" : "No token")
    
    // Check for authentication token
    if (!token) {
      console.log("🔍 No token found, authentication required")
      throw new Error('Authentication required. Please log in.')
    }

    const merchantData = await authenticatedApiCall(`/auth/merchant/profile`, token)
    console.log('✅ Merchant data fetched:', merchantData)
    return merchantData
  } catch (error) {
    console.error('Failed to fetch merchant data:', error)
    
    // If it's an authentication error, redirect to login
    if (error instanceof Error && (
      error.message.includes('401') || 
      error.message.includes('authentication') ||
      error.message.includes('token')
    )) {
      throw new Error('Authentication required. Please log in.')
    }
    
    throw error
  }
}

/**
 * Fetching rewards for a user.
 * @param userAddress The user's wallet address.
 * @returns A promise that resolves with an array of user rewards.
 */
export async function fetchUserRewards(userAddress: string) {
  console.log(`Fetching rewards for user: ${userAddress}`)
  try {
    return await apiCall(`/rewards/user/${userAddress}`)
  } catch (error) {
    console.error('Failed to fetch user rewards:', error)
    return []
  }
}

/**
 * Fetching redeem logs for a merchant.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with an array of redeem logs.
 */
export async function fetchRedeemLogs(merchantAddress: string) {
  console.log(`Fetching redeem logs for merchant: ${merchantAddress}`)
  try {
    return await apiCall(`/redemptions/merchant/${merchantAddress}`)
  } catch (error) {
    console.error('Failed to fetch redeem logs:', error)
    return []
  }
}

/**
 * Fetching a merchant's loyalty program details.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the loyalty program data.
 */
export async function fetchMerchantLoyaltyProgram(merchantAddress: string) {
  console.log(`Fetching loyalty program for merchant: ${merchantAddress}`)
  try {
    return await apiCall(`/rewards/merchant/${merchantAddress}/loyalty-program`)
  } catch (error) {
    console.error('Failed to fetch merchant loyalty program:', error)
    return {
      loyalCustomers: [],
      totalLoyaltyPoints: 0,
    }
  }
}

/**
 * Fetching a user's loyalty details for a specific merchant.
 * @param userAddress The user's wallet address.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the user's loyalty details for that merchant.
 */
export async function fetchUserLoyaltyDetails(userAddress: string, merchantAddress: string) {
  console.log(`Fetching user loyalty details for user: ${userAddress} at merchant: ${merchantAddress}`)
  try {
    return await apiCall(`/points/user/${userAddress}/merchant/${merchantAddress}`)
  } catch (error) {
    console.error('Failed to fetch user loyalty details:', error)
    return null
  }
}

/**
 * Fetching a user's LOYAL token balance from blockchain.
 * @param userAddress The user's wallet address.
 * @returns A promise that resolves with the user's LOYAL balance.
 */
export async function mockGetUserLoyalBalance(userAddress: string): Promise<number> {
  console.log(`Fetching LOYAL balance for user: ${userAddress}`)
  try {
    return await apiCall<number>(`/blockchain/balance/${userAddress}`)
  } catch (error) {
    console.error('Failed to fetch user LOYAL balance:', error)
    return 0
  }
}

/**
 * Verifies a claim code via API before blockchain processing (merchant only).
 * @param claimCode The claim code to verify.
 * @returns A promise that resolves with redemption details or null if invalid.
 */
export async function verifyClaimCodeAPI(claimCode: string): Promise<any> {
  // Get access token for authentication
  const accessToken = await getAccessTokenSafely()
  if (!accessToken) {
    throw new Error('No access token available. Please log in again.')
  }
  
  try {
    return await authenticatedApiCall<any>('/redemptions/verify', accessToken, {
      method: 'POST',
      body: JSON.stringify({ claimCode })
    })
  } catch (error) {
    console.error('Failed to verify claim code via API:', error)
    throw new Error('Failed to verify claim code. Please try again.')
  }
}

// Simulates fetching some data from the API.
export async function fetchSomeData() {
  try {
    return await apiCall('/health')
  } catch (error) {
    console.error('Failed to fetch health data:', error)
    return { message: "API unavailable" }
  }
}

// === Loyalty Settings API ===

/**
 * Gets the loyalty settings for the authenticated merchant.
 * @returns A promise that resolves with the loyalty settings.
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  try {
    const token = await getAccessTokenSafely()
    
    if (!token) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in.')
    }

    return await authenticatedApiCall<LoyaltySettings>('/loyalty-settings', token)
  } catch (error) {
    console.error("Failed to get loyalty settings:", error)
    throw error
  }
}

/**
 * Updates the loyalty settings for the authenticated merchant.
 * @param settings The updated loyalty settings.
 * @returns A promise that resolves with the updated loyalty settings.
 */
export async function updateLoyaltySettings(settings: UpdateLoyaltySettingsRequest): Promise<LoyaltySettings> {
  try {
    const token = await getAccessTokenSafely()
    
    if (!token) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in.')
    }

    return await authenticatedApiCall<LoyaltySettings>('/loyalty-settings', token, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  } catch (error) {
    console.error("Failed to update loyalty settings:", error)
    throw error
  }
}
