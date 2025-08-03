import { ethers } from 'ethers'

// Contract addresses
export const MERCHANT_REGISTRY_ADDRESS = '0xC2ad80E574f02D984E0fD3dA3C4cD221431A8818'
export const LISK_SEPOLIA_RPC = 'https://rpc.sepolia.lisk.com'

// ABI for merchant approval (admin function)
export const MERCHANT_APPROVAL_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'merchant', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'approveMerchant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'merchant', type: 'address' }
    ],
    name: 'isApprovedMerchant',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
]

/**
 * Manually approve a merchant (for testing purposes)
 * This would typically be called by an admin
 */
export async function approveMerchant(
  merchantAddress: string,
  signer: ethers.Signer
): Promise<string> {
  try {
    console.log('Approving merchant:', merchantAddress)
    
    const contract = new ethers.Contract(MERCHANT_REGISTRY_ADDRESS, MERCHANT_APPROVAL_ABI, signer)
    
    // Call approveMerchant function
    const tx = await contract.approveMerchant(merchantAddress, true)
    
    console.log('Approval transaction sent:', tx.hash)
    const receipt = await tx.wait()
    console.log('Approval confirmed:', receipt.transactionHash)
    
    return receipt.transactionHash
  } catch (error) {
    console.error('Merchant approval failed:', error)
    throw error
  }
}

/**
 * Check if a merchant is approved
 */
export async function checkMerchantApproval(merchantAddress: string): Promise<boolean> {
  try {
    // Use the user's connected wallet provider instead of a separate RPC provider
    if (typeof window === 'undefined' || !window.ethereum) {
      console.warn('No wallet detected, assuming not approved')
      return false
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(MERCHANT_REGISTRY_ADDRESS, MERCHANT_APPROVAL_ABI, provider)
    
    const isApproved = await contract.isApprovedMerchant(merchantAddress)
    console.log('Merchant approval status:', isApproved)
    
    return isApproved
  } catch (error) {
    console.error('Failed to check merchant approval:', error)
    return false
  }
} 