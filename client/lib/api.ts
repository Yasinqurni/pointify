// Real API calls to the NestJS server
// This replaces the mock API calls with actual HTTP requests

import { v4 as uuidv4 } from "uuid"
import { authService } from "./auth"

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

export interface Redemption {
  id: string
  userId: string
  rewardId: string
  rewardTitle: string
  merchantName: string
  redeemedPoints: number
  redeemedDate: string // YYYY-MM-DD HH:MM:SS
  claimCode: string
  status: "pending" | "claimed" | "expired"
}

export interface PointReception {
  id: string
  userId: string
  merchantName: string
  pointsReceived: number
  receivedDate: string // YYYY-MM-DD HH:MM:SS
  transactionHash: string // Mock transaction hash
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

export interface RegisterUserRequest {
  walletAddress: string
  signature: string
  message: string
  name?: string
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
  console.log(`🌐 Making API call to: ${url}`)
  
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

// Helper function for authenticated API calls
async function authenticatedApiCall<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
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
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.warn(`Server unavailable for authenticated call: ${endpoint}`, error)
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
  console.log(`Logging in with wallet: ${loginData.walletAddress}`)
  try {
    const response = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData)
    })
    console.log(response, 'disini auth response')
    return { data: response };
  } catch (error) {
    console.error('Failed to login:', error)
    throw new Error('Login failed. Please try again.')
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
 * Register new user with wallet signature
 * @param registerData User registration data with signature
 * @returns Authentication response
 */
export async function registerUser(registerData: RegisterUserRequest): Promise<{ data: AuthResponse }> {
  console.log(`Registering new user: ${registerData.walletAddress}`)
  try {
    const response = await apiCall<AuthResponse>('/auth/register/user', {
      method: 'POST',
      body: JSON.stringify(registerData)
    })
    return { data: response }
  } catch (error) {
    console.error('Failed to register user:', error)
    throw new Error('User registration failed. Please try again.')
  }
}

/**
 * Check if user exists
 * @param walletAddress The wallet address to check
 * @returns User existence status
 */
export async function checkUser(walletAddress: string): Promise<{ exists: boolean; user?: any }> {
  console.log(`Checking if user exists: ${walletAddress}`)
  try {
    return await apiCall<{ exists: boolean; user?: any }>('/auth/check/user', {
      method: 'POST',
      body: JSON.stringify({ walletAddress })
    })
  } catch (error) {
    console.error('Failed to check user:', error)
    return { exists: false }
  }
}

/**
 * Get user by wallet address
 * @param walletAddress The wallet address
 * @returns User data
 */
export async function getUserByAddress(walletAddress: string): Promise<any> {
  console.log(`Getting user by address: ${walletAddress}`)
  try {
    return await apiCall<any>(`/auth/user/${walletAddress}`)
  } catch (error) {
    console.error('Failed to get user:', error)
    throw new Error('Failed to get user data.')
  }
}

/**
 * Register new merchant with wallet signature
 * @param registerData Merchant registration data with signature
 * @returns Authentication response
 */
export async function registerMerchant(registerData: RegisterMerchantRequest): Promise<{ data: AuthResponse }> {
  console.log(`Registering new merchant: ${registerData.walletAddress}`)
  try {
    const response = await apiCall<AuthResponse>('/auth/register/merchant', {
      method: 'POST',
      body: JSON.stringify(registerData)
    })
    return { data: response }
  } catch (error) {
    console.error('Failed to register merchant:', error)
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
      throw new Error('No authentication token available')
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
 * A user redeeming a reward.
 * @param userId The user's wallet address.
 * @param rewardId The ID of the reward to redeem.
 * @returns A promise that resolves with the new Redemption object.
 */
export async function redeemReward(userId: string, rewardId: string): Promise<Redemption> {
  console.log(`Redeeming reward ${rewardId} by user ${userId}`)
  try {
    return await apiCall<Redemption>('/redemptions', {
      method: 'POST',
      body: JSON.stringify({ userId, rewardId }),
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
export async function createReward(newRewardData: Omit<Reward, "id">): Promise<Reward> {
  console.log("Creating new reward:", newRewardData)
  try {
    return await apiCall<Reward>('/rewards', {
      method: 'POST',
      body: JSON.stringify(newRewardData),
    })
  } catch (error) {
    console.error('Failed to create reward:', error)
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
  console.log(`Verifying claim code: ${claimCode}`)
  try {
    return await apiCall<Redemption | null>(`/redemptions/verify/${claimCode}`)
  } catch (error) {
    console.error('Failed to verify claim code:', error)
    throw new Error('Server is unavailable. Please try again later.')
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
  try {
    return await apiCall<Redemption[]>('/redemptions/merchant')
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
export async function fetchMerchantData(merchantId: string) {
  console.log(`Fetching data for merchant: ${merchantId}`)
  try {
    return await apiCall(`/rewards/merchant/${merchantId}`)
  } catch (error) {
    console.error('Failed to fetch merchant data:', error)
    return {
      name: "Unknown Merchant",
      address: "",
      loyaltyProgram: "",
      rewards: [],
    }
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
 * Verifies a claim code via API before blockchain processing.
 * @param claimCode The claim code to verify.
 * @returns A promise that resolves with redemption details or null if invalid.
 */
export async function verifyClaimCodeAPI(claimCode: string): Promise<any> {
  console.log(`Verifying claim code via API: ${claimCode}`)
  try {
    return await apiCall<any>('/redemptions/verify', {
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
