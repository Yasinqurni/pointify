import { ethers } from 'ethers'
import { getIDRXBalance } from './idrx-contract'

// Merchant Registry Contract Address
export const MERCHANT_REGISTRY_ADDRESS = '0xb481aA7164BE29c0a2c5e6b53Dfc84081bC4bC75'

// Lisk Sepolia RPC URL
export const LISK_SEPOLIA_RPC = 'https://rpc.sepolia.lisk.com'

// Full ABI for merchant registry contract
export const MERCHANT_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'merchant', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'registerMerchant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

/**
 * Check if wallet has minimum IDRX balance (1000 IDRX required)
 */
export async function checkIDRXBalance(address: string): Promise<{ hasEnough: boolean; balance: number; required: number }> {
  const balance = await getIDRXBalance(address)
  const required = 1000
  
  return {
    hasEnough: balance >= required,
    balance,
    required
  }
}

/**
 * Register merchant on contract
 * Uses a custom provider: https://rpc.sepolia-api.lisk.com
 * Loads the contract at 0xb481aA7164BE29c0a2c5e6b53Dfc84081bC4bC75
 */
export async function registerMerchantOnContract(
  merchantAddress: string, 
  approved: boolean,
  signerProvider?: ethers.providers.Web3Provider
): Promise<string> {
  try {
    console.log('REGISTERING MERCHANT ON CONTRACT')
    console.log('Merchant Address:', merchantAddress)
    console.log('Approved:', approved)
    console.log('Contract:', MERCHANT_REGISTRY_ADDRESS)
    
    // Check IDRX balance first
    const balanceCheck = await checkIDRXBalance(merchantAddress)
    if (!balanceCheck.hasEnough) {
      throw new Error(`Merchant needs at least ${balanceCheck.required} IDRX. Current balance: ${balanceCheck.balance}`)
    }
    
    // Use provided signer or create readonly provider
    let contract: ethers.Contract
    
    if (signerProvider) {
      // Use wallet signer for transactions
      const signer = signerProvider.getSigner()
      contract = new ethers.Contract(MERCHANT_REGISTRY_ADDRESS, MERCHANT_REGISTRY_ABI, signer)
    } else {
      // Use readonly provider for view calls
      const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
      contract = new ethers.Contract(MERCHANT_REGISTRY_ADDRESS, MERCHANT_REGISTRY_ABI, provider)
    }
    
    console.log('Calling registerMerchant function...')
    
    // Call registerMerchant function
    const tx = await contract.registerMerchant(merchantAddress, approved)
    
    console.log('Transaction sent:', tx.hash)
    
    // Wait for transaction confirmation
    const receipt = await tx.wait()
    
    console.log('Transaction confirmed:', receipt.transactionHash)
    
    return receipt.transactionHash
    
  } catch (error) {
    console.error('MERCHANT REGISTRY ERROR:', error)
    throw error
  }
}

/**
 * Get merchant registration status (if the contract supports it)
 */
export async function getMerchantStatus(merchantAddress: string): Promise<boolean | null> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
    const contract = new ethers.Contract(MERCHANT_REGISTRY_ADDRESS, MERCHANT_REGISTRY_ABI, provider)
    
    // Note: This assumes the contract has a view function to check status
    // If not available, return null
    return null
    
  } catch (error) {
    console.error('Failed to get merchant status:', error)
    return null
  }
} 