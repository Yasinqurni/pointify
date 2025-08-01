// This file simulates ethers.js interactions with dummy data for IDRX and LOYAL tokens.
// In a real application, you would connect to a Web3 provider (e.g., MetaMask)
// and interact with your deployed smart contract.

import { v4 as uuidv4 } from "uuid"
import type { PointReception } from "./api" // Import PointReception type

// --- Mock Data for IDRX and LOYAL Token Balances ---
// These would typically be fetched from a blockchain in a real app.
const mockLoyalBalances: { [address: string]: number } = {
  "0x0000000000000000000000000000000000000001": 1000, // Example Merchant 1 LOYAL balance
  "0x0000000000000000000000000000000000000002": 500, // Example Merchant 2 LOYAL balance
  "0xabc...123": 50, // Example User 1 LOYAL balance
  "0xdef...456": 25, // Example User 2 LOYAL balance
}

// Mock data for merchant IDRX balances (separate from LOYAL)
const mockIDRXBalances: { [address: string]: number } = {
  "0x0000000000000000000000000000000000000001": 5000, // Merchant 1 IDRX balance
  "0x0000000000000000000000000000000000000002": 2000, // Merchant 2 IDRX balance
}

// Mock data for total LOYAL rewarded by merchants
const mockTotalLoyalRewardedData: { [address: string]: number } = {
  "0x0000000000000000000000000000000000000001": 250, // Total LOYAL rewarded by Merchant 1
  "0x0000000000000000000000000000000000000002": 100, // Total LOYAL rewarded by Merchant 2
}

// Mock data for point reception logs (to be updated by mockRewardUser)
const mockPointReceptionLogs: PointReception[] = [
  {
    id: "reception-1",
    userId: "0xabc...123",
    merchantName: "Sweet Treats Bakery", // Example merchant name
    pointsReceived: 50,
    receivedDate: "2025-07-19 09:00:00",
    transactionHash: "0xmocktx1",
  },
  {
    id: "reception-2",
    userId: "0xdef...456",
    merchantName: "Daily Grind Cafe", // Example merchant name
    pointsReceived: 30,
    receivedDate: "2025-07-24 11:00:00",
    transactionHash: "0xmocktx2",
  },
]

// Mock redemption data
const mockRedemptions: { [claimCode: string]: any } = {
  "REWARD123": {
    id: "redemption-1",
    userId: "0xabc...123",
    rewardId: "reward-1",
    rewardTitle: "Free Coffee",
    merchantName: "Sweet Treats Bakery",
    redeemedPoints: 25,
    redeemedDate: "2025-07-19 09:00:00",
    claimCode: "REWARD123",
    status: "pending"
  },
  "REWARD456": {
    id: "redemption-2", 
    userId: "0xdef...456",
    rewardId: "reward-2",
    rewardTitle: "50% Off Pastry",
    merchantName: "Daily Grind Cafe",
    redeemedPoints: 15,
    redeemedDate: "2025-07-24 11:00:00",
    claimCode: "REWARD456",
    status: "pending"
  }
}

/**
 * Simulates fetching a merchant's LOYAL token balance.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the merchant's LOYAL balance.
 */
export async function mockGetMerchantLoyalBalance(merchantAddress: string): Promise<number> {
  console.log(`Simulating fetching LOYAL balance for merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    // Remove artificial delay for instant response
    resolve(mockLoyalBalances[merchantAddress] || 0)
  })
}

/**
 * Simulates fetching a merchant's IDRX token balance.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the merchant's IDRX balance.
 */
export async function mockGetMerchantIDRXBalance(merchantAddress: string): Promise<number> {
  console.log(`Simulating fetching IDRX balance for merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    // Remove artificial delay for instant response
    resolve(mockIDRXBalances[merchantAddress] || 0)
  })
}

/**
 * Simulates fetching the total LOYAL tokens rewarded by a merchant.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the total LOYAL tokens rewarded.
 */
export async function mockGetTotalLoyalRewarded(merchantAddress: string): Promise<number> {
  console.log(`Simulating fetching total LOYAL rewarded for merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    // Remove artificial delay for instant response
    resolve(mockTotalLoyalRewardedData[merchantAddress] || 0)
  })
}

/**
 * Simulates a merchant rewarding LOYAL tokens to a user.
 * @param merchantAddress The merchant's wallet address (for internal tracking, not used in mock logic).
 * @param userAddress The recipient's wallet address.
 * @param amount The amount of LOYAL tokens to reward.
 * @returns A promise that resolves when the transaction is "complete".
 */
export async function mockRewardUser(merchantAddress: string, userAddress: string, amount: number): Promise<void> {
  console.log(`Simulating rewarding ${amount} LOYAL to ${userAddress} from ${merchantAddress}`)
  return new Promise((resolve, reject) => {
    // Remove artificial delay for instant response
    if (amount <= 0) {
      return reject(new Error("Amount must be positive."))
    }
    // Simulate deducting from merchant's LOYAL balance and adding to user's LOYAL balance
    if ((mockLoyalBalances[merchantAddress] || 0) < amount) {
      return reject(new Error("Insufficient LOYAL balance for rewarding."))
    }
    mockLoyalBalances[merchantAddress] = (mockLoyalBalances[merchantAddress] || 0) - amount
    mockLoyalBalances[userAddress] = (mockLoyalBalances[userAddress] || 0) + amount
    mockTotalLoyalRewardedData[merchantAddress] = (mockTotalLoyalRewardedData[merchantAddress] || 0) + amount

    // Add to mockPointReceptionLogs
    mockPointReceptionLogs.push({
      id: `reception-${uuidv4()}`,
      userId: userAddress,
      merchantName: "Merchant", // Generic merchant name for the log
      pointsReceived: amount,
      receivedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
      transactionHash: `0xmocktx${uuidv4().slice(0, 8)}`,
    })

    console.log(`Successfully "rewarded" ${amount} LOYAL to ${userAddress}`)
    resolve()
  })
}

/**
 * Simulates a merchant topping up their LOYAL token balance using IDRX.
 * @param merchantAddress The merchant's wallet address.
 * @param amount The amount of IDRX to spend (which converts to LOYAL).
 * @returns A promise that resolves when the transaction is "complete".
 */
export async function mockTopUpLoyal(merchantAddress: string, amount: number): Promise<void> {
  console.log(`Simulating topping up ${amount} LOYAL for ${merchantAddress} using IDRX`)
  return new Promise((resolve, reject) => {
    // Remove artificial delay for instant response
    if ((mockIDRXBalances[merchantAddress] || 0) < amount) {
      return reject(new Error("Insufficient IDRX balance for top-up."))
    }
    mockIDRXBalances[merchantAddress] = (mockIDRXBalances[merchantAddress] || 0) - amount // Deduct IDRX
    mockLoyalBalances[merchantAddress] = (mockLoyalBalances[merchantAddress] || 0) + amount // Add LOYAL
    console.log(`Successfully "topped up" ${amount} LOYAL for ${merchantAddress}`)
    resolve()
  })
}

/**
 * Simulates a merchant withdrawing LOYAL tokens.
 * @param merchantAddress The merchant's wallet address.
 * @param amount The amount of LOYAL to withdraw.
 * @returns A promise that resolves when the transaction is "complete".
 */
export async function mockWithdrawLoyal(merchantAddress: string, amount: number): Promise<void> {
  console.log(`Simulating withdrawing ${amount} LOYAL from ${merchantAddress}`)
  return new Promise((resolve, reject) => {
    // Remove artificial delay for instant response
    if ((mockLoyalBalances[merchantAddress] || 0) < amount) {
      return reject(new Error("Insufficient LOYAL balance for withdrawal."))
    }
    mockLoyalBalances[merchantAddress] = (mockLoyalBalances[merchantAddress] || 0) - amount
    console.log(`Successfully "wthdrew" ${amount} LOYAL from ${merchantAddress}`)
    resolve()
  })
}

/**
 * Simulates fetching a user's LOYAL token balance.
 * @param userAddress The user's wallet address.
 * @returns A promise that resolves with the user's LOYAL balance.
 */
export async function mockGetUserLoyalBalance(userAddress: string): Promise<number> {
  console.log(`Simulating fetching LOYAL balance for user: ${userAddress}`)
  return new Promise((resolve) => {
    // If the user address is not in mock data, give them a default balance for testing
    const balance = mockLoyalBalances[userAddress] || 100 // Default 100 LOYAL points for new users
    console.log(`User ${userAddress} has ${balance} LOYAL points`)
    resolve(balance)
  })
}

/**
 * Simulates a user redeeming LOYAL tokens for an item.
 * @param userAddress The user's wallet address.
 * @param amount The amount of LOYAL tokens to redeem.
 * @param item The item being redeemed.
 * @returns A promise that resolves when the redemption is "complete".
 */
export async function mockRedeem(userAddress: string, amount: number, item: string): Promise<void> {
  console.log(`Simulating redeeming ${amount} LOYAL for "${item}" by user: ${userAddress}`)
  return new Promise((resolve, reject) => {
    // Remove artificial delay for instant response
    if (amount <= 0) {
      return reject(new Error("Amount must be positive."))
    }
    if ((mockLoyalBalances[userAddress] || 0) < amount) {
      return reject(new Error("Insufficient LOYAL balance for redemption."))
    }
    mockLoyalBalances[userAddress] = (mockLoyalBalances[userAddress] || 0) - amount
    console.log(`Successfully "redeemed" ${amount} LOYAL for "${item}" by ${userAddress}`)
    resolve()
  })
}

// --- Blockchain Redemption Functions ---

/**
 * Verifies a claim code directly from the blockchain.
 * @param claimCode The claim code to verify.
 * @returns A promise that resolves with redemption details or null if invalid.
 */
export async function verifyClaimCodeOnChain(claimCode: string): Promise<any> {
  console.log(`Verifying claim code on blockchain: ${claimCode}`)
  return new Promise((resolve) => {
    // Remove artificial delay for instant response
    const redemption = mockRedemptions[claimCode]
    if (redemption && redemption.status === "pending") {
      resolve(redemption)
    } else {
      resolve(null)
    }
  })
}

/**
 * Processes a redemption directly on the blockchain.
 * @param claimCode The claim code to process.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves when the redemption is processed.
 */
export async function processRedemptionOnChain(claimCode: string, merchantAddress: string): Promise<{ success: boolean; transactionHash: string }> {
  console.log(`Processing redemption on blockchain: ${claimCode} by merchant: ${merchantAddress}`)
  return new Promise((resolve, reject) => {
    // Remove artificial delay for instant response
    const redemption = mockRedemptions[claimCode]
    
    if (!redemption) {
      return reject(new Error("Invalid claim code"))
    }
    
    if (redemption.status !== "pending") {
      return reject(new Error("Claim code has already been used"))
    }
    
    // Simulate blockchain transaction
    redemption.status = "claimed"
    const transactionHash = `0xredemption${uuidv4().slice(0, 8)}`
    
    console.log(`Successfully processed redemption: ${claimCode}`)
    resolve({ success: true, transactionHash })
  })
}

/**
 * Checks if a user has sufficient LOYAL balance for redemption.
 * @param userAddress The user's wallet address.
 * @param requiredPoints The points required for the reward.
 * @returns A promise that resolves with whether the user has sufficient balance.
 */
export async function checkUserBalanceForRedemption(userAddress: string, requiredPoints: number): Promise<boolean> {
  console.log(`Checking user balance for redemption: ${userAddress}, required: ${requiredPoints}`)
  return new Promise((resolve) => {
    // Remove artificial delay for instant response
    const userBalance = mockLoyalBalances[userAddress] || 0
    resolve(userBalance >= requiredPoints)
  })
}

/**
 * Gets redemption history for a user from the blockchain.
 * @param userAddress The user's wallet address.
 * @returns A promise that resolves with the user's redemption history.
 */
export async function getUserRedemptionHistory(userAddress: string): Promise<any[]> {
  console.log(`Getting redemption history for user: ${userAddress}`)
  return new Promise((resolve) => {
    // Remove artificial delay for instant response
    const userRedemptions = Object.values(mockRedemptions).filter(
      (redemption: any) => redemption.userId === userAddress
    )
    resolve(userRedemptions)
  })
}

/**
 * Gets merchant redemption history from the blockchain.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the merchant's redemption history.
 */
export async function getMerchantRedemptionHistory(merchantAddress: string): Promise<any[]> {
  console.log(`Getting redemption history for merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    // Remove artificial delay for instant response
    const merchantRedemptions = Object.values(mockRedemptions).filter(
      (redemption: any) => redemption.merchantName && redemption.merchantName.includes("Cafe")
    )
    resolve(merchantRedemptions)
  })
}
