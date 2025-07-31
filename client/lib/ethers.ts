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

/**
 * Simulates fetching a merchant's LOYAL token balance.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the merchant's LOYAL balance.
 */
export async function mockGetMerchantLoyalBalance(merchantAddress: string): Promise<number> {
  console.log(`Simulating fetching LOYAL balance for merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockLoyalBalances[merchantAddress] || 0)
    }, 500) // Simulate network delay
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
    setTimeout(() => {
      resolve(mockIDRXBalances[merchantAddress] || 0)
    }, 500) // Simulate network delay
  })
}

/**
 * Simulates fetching the total LOYAL tokens rewarded by a merchant.
 * @param merchantAddress The merchant's wallet address.
 * @returns A promise that resolves with the total LOYAL tokens rewarded.
 */
export async function mockGetTotalLoyalRewarded(merchantAddress: string): Promise<number> {
  console.log(`Simulating fetching total LOYAL rewarded by merchant: ${merchantAddress}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTotalLoyalRewardedData[merchantAddress] || 0)
    }, 500) // Simulate network delay
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
    setTimeout(() => {
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
        merchantName: "Pointify Cafe", // Mock merchant name for the log
        pointsReceived: amount,
        receivedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        transactionHash: `0xmocktx${uuidv4().slice(0, 8)}`,
      })

      console.log(`Successfully "rewarded" ${amount} LOYAL to ${userAddress}`)
      resolve()
    }, 1500) // Simulate transaction processing time
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
    setTimeout(() => {
      if ((mockIDRXBalances[merchantAddress] || 0) < amount) {
        return reject(new Error("Insufficient IDRX balance for top-up."))
      }
      mockIDRXBalances[merchantAddress] = (mockIDRXBalances[merchantAddress] || 0) - amount // Deduct IDRX
      mockLoyalBalances[merchantAddress] = (mockLoyalBalances[merchantAddress] || 0) + amount // Add LOYAL
      console.log(`Successfully "topped up" ${amount} LOYAL for ${merchantAddress}`)
      resolve()
    }, 1500) // Simulate transaction processing time
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
    setTimeout(() => {
      if ((mockLoyalBalances[merchantAddress] || 0) < amount) {
        return reject(new Error("Insufficient LOYAL balance for withdrawal."))
      }
      mockLoyalBalances[merchantAddress] = (mockLoyalBalances[merchantAddress] || 0) - amount
      console.log(`Successfully "wthdrew" ${amount} LOYAL from ${merchantAddress}`)
      resolve()
    }, 1500)
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
    setTimeout(() => {
      resolve(mockLoyalBalances[userAddress] || 0)
    }, 500) // Simulate network delay
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
    setTimeout(() => {
      if (amount <= 0) {
        return reject(new Error("Amount must be positive."))
      }
      if ((mockLoyalBalances[userAddress] || 0) < amount) {
        return reject(new Error("Insufficient LOYAL balance for redemption."))
      }
      mockLoyalBalances[userAddress] = (mockLoyalBalances[userAddress] || 0) - amount
      console.log(`Successfully "redeemed" ${amount} LOYAL for "${item}" by ${userAddress}`)
      resolve()
    }, 1500) // Simulate transaction processing time
  })
}
