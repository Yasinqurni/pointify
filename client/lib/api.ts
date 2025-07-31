// This file simulates backend API calls for rewards, redemptions, and reward creation.
// In a real application, these would be actual HTTP requests to your server.

import { v4 as uuidv4 } from "uuid"

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

// --- Mock Data Store ---
const mockRewards: Reward[] = [
  {
    id: "reward-1",
    title: "Free Donut",
    description: "Enjoy a delicious donut on us!",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop&crop=center",
    merchantName: "Sweet Treats Bakery",
    merchantLogoUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop&crop=center",
    requiredPoints: 25,
    expiryDate: "2025-12-31",
  },
  {
    id: "reward-2",
    title: "20% Off Coffee",
    description: "Get 20% off any coffee beverage.",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&crop=center",
    merchantName: "Daily Grind Cafe",
    merchantLogoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&h=80&fit=crop&crop=center",
    requiredPoints: 50,
    expiryDate: "2025-11-15",
  },
  {
    id: "reward-3",
    title: "Free Movie Ticket",
    description: "Your next movie night is on us!",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=200&fit=crop&crop=center",
    merchantName: "Cineplex Grand",
    merchantLogoUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=80&h=80&fit=crop&crop=center",
    requiredPoints: 100,
    expiryDate: "2026-01-31",
  },
  {
    id: "reward-4",
    title: "Buy One Get One Pizza",
    description: "Grab a friend and enjoy two pizzas for the price of one!",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center",
    merchantName: "Pizza Palace",
    merchantLogoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop&crop=center",
    requiredPoints: 75,
    expiryDate: "2025-10-01",
  },
  {
    id: "reward-5",
    title: "Free Ice Cream Cone",
    description: "Cool down with a delicious ice cream cone!",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop&crop=center",
    merchantName: "Frozen Delights",
    merchantLogoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center",
    requiredPoints: 30,
    expiryDate: "2025-09-30",
  },
  {
    id: "reward-6",
    title: "50% Off Burger",
    description: "Half price on any burger of your choice!",
    imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=200&fit=crop&crop=center",
    merchantName: "Burger Joint",
    merchantLogoUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=80&h=80&fit=crop&crop=center",
    requiredPoints: 60,
    expiryDate: "2025-12-15",
  },
]

const mockRedemptions: Redemption[] = [
  {
    id: "redemption-1",
    userId: "0xabc...123",
    rewardId: "reward-1",
    rewardTitle: "Free Donut",
    merchantName: "Sweet Treats Bakery",
    redeemedPoints: 25,
    redeemedDate: "2025-07-20 10:30:00",
    claimCode: "DONUT-XYZ789",
    status: "claimed",
  },
  {
    id: "redemption-2",
    userId: "0xdef...456",
    rewardId: "reward-2",
    rewardTitle: "20% Off Coffee",
    merchantName: "Daily Grind Cafe",
    redeemedPoints: 50,
    redeemedDate: "2025-07-25 14:00:00",
    claimCode: "COFFEE-ABC123",
    status: "pending",
  },
]

const mockPointReceptionLogs: PointReception[] = [
  {
    id: "reception-1",
    userId: "0xabc...123",
    merchantName: "Sweet Treats Bakery",
    pointsReceived: 50,
    receivedDate: "2025-07-19 09:00:00",
    transactionHash: "0xmocktx1",
  },
  {
    id: "reception-2",
    userId: "0xdef...456",
    merchantName: "Daily Grind Cafe",
    pointsReceived: 30,
    receivedDate: "2025-07-24 11:00:00",
    transactionHash: "0xmocktx2",
  },
]

// Mock user LOYAL balances (from lib/store.ts, but updated here for API context)
const mockUserLoyalBalances: { [address: string]: number } = {
  "0xabc...123": 150, // Example User 1 LOYAL balance
  "0xdef...456": 70, // Example User 2 LOYAL balance
}

// --- API Functions ---

/**
 * Simulates fetching all available rewards.
 * @returns A promise that resolves with an array of Reward objects.
 */
export async function fetchRewards(): Promise<Reward[]> {
  console.log("Simulating fetching all rewards...")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRewards)
    }, 100) // Reduced delay for faster loading
  })
}

/**
 * Simulates a user redeeming a reward.
 * @param userId The user's wallet address.
 * @param rewardId The ID of the reward to redeem.
 * @returns A promise that resolves with the new Redemption object.
 */
export async function redeemReward(userId: string, rewardId: string): Promise<Redemption> {
  console.log(`Simulating redemption of reward ${rewardId} by user ${userId}`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const reward = mockRewards.find((r) => r.id === rewardId)
      if (!reward) {
        return reject(new Error("Reward not found."))
      }
      if ((mockUserLoyalBalances[userId] || 0) < reward.requiredPoints) {
        return reject(new Error("Insufficient LOYAL points."))
      }

      // Deduct points
      mockUserLoyalBalances[userId] = (mockUserLoyalBalances[userId] || 0) - reward.requiredPoints

      // Generate unique claim code
      const claimCode = `${reward.title.split(" ")[0].toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`

      const newRedemption: Redemption = {
        id: `redemption-${uuidv4()}`,
        userId,
        rewardId,
        rewardTitle: reward.title,
        merchantName: reward.merchantName,
        redeemedPoints: reward.requiredPoints,
        redeemedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        claimCode,
        status: "pending", // Pending until claimed by merchant
      }
      mockRedemptions.push(newRedemption)
      console.log("Redemption successful:", newRedemption)
      resolve(newRedemption)
    }, 200) // Reduced delay for faster loading
  })
}

/**
 * Simulates creating a new reward.
 * @param newRewardData The data for the new reward.
 * @returns A promise that resolves with the created Reward object.
 */
export async function createReward(newRewardData: Omit<Reward, "id">): Promise<Reward> {
  console.log("Simulating creating new reward:", newRewardData)
  return new Promise((resolve) => {
    setTimeout(() => {
      const reward: Reward = {
        id: `reward-${uuidv4()}`,
        ...newRewardData,
      }
      mockRewards.push(reward)
      console.log("Reward created:", reward)
      resolve(reward)
    }, 200) // Reduced delay for faster loading
  })
}

/**
 * Simulates verifying a claim code by a merchant.
 * @param claimCode The claim code to verify.
 * @returns A promise that resolves with the Redemption object if valid and pending, or null if not found/invalid.
 */
export async function verifyClaimCode(claimCode: string): Promise<Redemption | null> {
  console.log(`Simulating verifying claim code: ${claimCode}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      const redemption = mockRedemptions.find((r) => r.claimCode === claimCode && r.status === "pending")
      if (redemption) {
        console.log("Claim code verified:", redemption)
        resolve(redemption)
      } else {
        console.log("Claim code not found or already claimed.")
        resolve(null)
      }
    }, 150) // Reduced delay for faster loading
  })
}

/**
 * Simulates marking a redemption as claimed by a merchant.
 * @param redemptionId The ID of the redemption to mark as claimed.
 * @returns A promise that resolves when the status is updated.
 */
export async function confirmClaim(redemptionId: string): Promise<void> {
  console.log(`Simulating confirming claim for redemption: ${redemptionId}`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const redemptionIndex = mockRedemptions.findIndex((r) => r.id === redemptionId)
      if (redemptionIndex > -1) {
        mockRedemptions[redemptionIndex].status = "claimed"
        console.log("Claim confirmed:", mockRedemptions[redemptionIndex])
        resolve()
      } else {
        reject(new Error("Redemption not found."))
      }
    }, 150) // Reduced delay for faster loading
  })
}

/**
 * Simulates fetching a user's redemption history.
 * @param userId The user's wallet address.
 * @returns A promise that resolves with an array of Redemption objects.
 */
export async function fetchUserRedemptions(userId: string): Promise<Redemption[]> {
  console.log(`Simulating fetching redemption history for user: ${userId}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRedemptions.filter((r) => r.userId === userId))
    }, 100) // Reduced delay for faster loading
  })
}

/**
 * Simulates fetching a user's point reception history.
 * @param userId The user's wallet address.
 * @returns A promise that resolves with an array of PointReception objects.
 */
export async function fetchUserPointReceptionLogs(userId: string): Promise<PointReception[]> {
  console.log(`Simulating fetching point reception history for user: ${userId}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPointReceptionLogs.filter((log) => log.userId === userId))
    }, 100) // Reduced delay for faster loading
  })
}

/**
 * Simulates fetching all redemption logs for merchants.
 * @returns A promise that resolves with an array of Redemption objects.
 */
export async function fetchMerchantRedemptionLogs(): Promise<Redemption[]> {
  console.log("Simulating fetching all merchant redemption logs...")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRedemptions)
    }, 100) // Reduced delay for faster loading
  })
}

// New mock data for dashboard
const mockDashboardData = {
  totalCustomers: 150,
  // Add other dashboard metrics here if needed
}

// Mock data for merchant loyalty program
const mockLoyaltyProgramData = {
  loyalCustomers: [
    { address: "0xabc...123", name: "Alice", points: 150 },
    { address: "0xdef...456", name: "Bob", points: 70 },
    { address: "0x123...789", name: "Charlie", points: 200 },
  ],
  totalLoyaltyPoints: 420, // Sum of all loyalCustomers points
}

// Mock data for user loyalty details for a specific merchant
const mockUserLoyaltyDetailsData = {
  "0xabc...123": {
    // user address
    "0xMerchant123": {
      // merchant address
      merchantName: "Pointify Cafe",
      userPoints: 150, // User's points with this specific merchant
      rewards: [
        {
          id: "reward-1",
          name: "Free Coffee",
          pointsRequired: 10,
          description: "A free cup of coffee.",
          imageUrl: "/placeholder.svg?height=100&width=100",
        },
        {
          id: "reward-2",
          name: "Pastry Discount",
          pointsRequired: 5,
          description: "20% off any pastry.",
          imageUrl: "/placeholder.svg?height=100&width=100",
        },
      ],
    },
  },
}

// Add this function after `fetchMerchantRedemptionLogs`
/**
 * Simulates fetching dashboard-specific data for a merchant.
 * @param merchantId The merchant's ID.
 * @returns A promise that resolves with the merchant's dashboard data.
 */
export async function fetchMerchantDashboardData(merchantId: string) {
  console.log(`Fetching dashboard data for merchant: ${merchantId}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDashboardData)
    }, 100) // Reduced delay for faster loading
  })
}

// --- New API Functions ---
/**
 * Simulates fetching data for a merchant.
 * @param merchantId The merchant's ID.
 * @returns A promise that resolves with the merchant's data.
 */
export async function fetchMerchantData(merchantId: string) {
  console.log(`Fetching data for merchant: ${merchantId}`)
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "Pointify Cafe",
        address: "123 Main St, Anytown",
        loyaltyProgram: "1 point per $10 spent",
        rewards: [
          { id: "1", name: "Free Coffee", points: 10 },
          { id: "2", name: "Pastry Discount", points: 5 },
        ],
      })
    }, 100) // Reduced delay for faster loading
  })
}

/**
 * Simulates fetching rewards for a user.
 * @param userAddress The user's wallet address.
 * @returns A promise that resolves with an array of user rewards.
 */
export async function fetchUserRewards(userAddress: string) {
  console.log(`Fetching rewards for user: ${userAddress}`)
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "r1",
          merchantName: "Pointify Cafe",
          rewardName: "Free Coffee",
          pointsCost: 10,
          dateRedeemed: "2025-07-20",
        },
        { id: "r2", merchantName: "Book Nook", rewardName: "10% Off Book", pointsCost: 15, dateRedeemed: "2025-07-15" },
      ])
    }, 100) // Reduced delay for faster loading
  })
}

/**
 * Simulates fetching redeem logs for a merchant.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with an array of redeem logs.
 */
export async function fetchRedeemLogs(merchantAddress: string) {
  console.log(`Fetching redeem logs for merchant: ${merchantAddress}`)
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "log1", userAddress: "0xabc...123", rewardName: "Free Coffee", pointsRedeemed: 10, date: "2025-07-25" },
        {
          id: "log2",
          userAddress: "0xdef...456",
          rewardName: "Pastry Discount",
          pointsRedeemed: 5,
          date: "2025-07-24",
        },
      ])
    }, 100) // Reduced delay for faster loading
  })
}

// Add this function after `fetchRedeemLogs`
/**
 * Simulates fetching a merchant's loyalty program details.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the loyalty program data.
 */
export async function fetchMerchantLoyaltyProgram(merchantAddress: string) {
  console.log(`Fetching loyalty program for merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockLoyaltyProgramData)
    }, 100) // Reduced delay for faster loading
  })
}

// Add this function after `fetchMerchantLoyaltyProgram`
/**
 * Simulates fetching a user's loyalty details for a specific merchant.
 * @param userAddress The user's wallet address.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the user's loyalty details for that merchant.
 */
export async function fetchUserLoyaltyDetails(userAddress: string, merchantAddress: string) {
  console.log(`Fetching user loyalty details for user: ${userAddress} at merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserLoyaltyDetailsData[userAddress]?.[merchantAddress] || null)
    }, 100) // Reduced delay for faster loading
  })
}

// --- Mock LOYAL Token Functions (for balance display, not core logic) ---
// These are kept separate from the main API functions as they represent direct token interactions
// which might still be relevant for displaying balances, even if rewards are API-driven.

/**
 * Simulates fetching a user's LOYAL token balance.
 * @param userAddress The user's wallet address.
 * @returns A promise that resolves with the user's LOYAL balance.
 */
export async function mockGetUserLoyalBalance(userAddress: string): Promise<number> {
  console.log(`Simulating fetching LOYAL balance for user: ${userAddress}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserLoyalBalances[userAddress] || 0)
    }, 100) // Reduced delay for faster loading
  })
}

// Simulates fetching some data from the API.
export async function fetchSomeData() {
  return new Promise((resolve) => setTimeout(() => resolve({ message: "Data from API" }), 100)) // Reduced delay for faster loading
}

// Note: Merchant LOYAL balance and related functions (top-up, withdraw, reward)
// are now handled by the API layer for rewards. The previous mockGetMerchantLoyalBalance
// and related functions are no longer directly used for the reward system,
// but could be adapted if a merchant also holds a general LOYAL token balance
// separate from their reward issuance capability. For this design, we assume
// the merchant's "balance" is implicitly managed by the reward creation/redemption flow.
