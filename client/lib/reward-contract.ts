import { ethers } from 'ethers'

// Contract addresses
export const REWARD_CONTRACT_ADDRESS = '0xC2ad80E574f02D984E0fD3dA3C4cD221431A8818' // Same as PLT swap contract for now
export const PLT_TOKEN_ADDRESS = '0x929f30a023CCA95301ECc5f8b97d7C32862B774f'

// ABI for the reward contract - using the full PLT swap contract ABI since they share the same address
export const REWARD_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sendReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "isApprovedMerchant",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// ABI for ERC20 token (for approval)
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
]

export interface RewardStatus {
  status: 'pending' | 'success' | 'error'
  transactionHash?: string
  error?: string
}

/**
 * Check if PLT token approval is needed for reward
 */
export async function checkPltApprovalNeededForReward(
  userAddress: string, 
  amount: number
): Promise<boolean> {
  try {
    console.log('Checking PLT approval for reward:', userAddress)
    console.log('PLT Token Address:', PLT_TOKEN_ADDRESS)
    console.log('Reward Contract Address:', REWARD_CONTRACT_ADDRESS)
    
    // Use the user's connected wallet provider instead of a separate RPC provider
    if (typeof window === 'undefined' || !window.ethereum) {
      console.warn('No wallet detected, assuming approval needed')
      return true
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const pltTokenContract = new ethers.Contract(PLT_TOKEN_ADDRESS, ERC20_ABI, provider)
    
    const allowance = await pltTokenContract.allowance(userAddress, REWARD_CONTRACT_ADDRESS)
    const requiredAmount = ethers.utils.parseEther(amount.toString())
    
    console.log('Current PLT allowance for reward:', allowance.toString())
    console.log('Required amount:', requiredAmount.toString())
    
    return allowance.lt(requiredAmount)
  } catch (error) {
    console.error('Failed to check PLT approval for reward:', error)
    // If the contract doesn't support allowance, assume approval is needed
    return true
  }
}

/**
 * Safe approve function for PLT tokens for reward
 */
export async function safeApprovePltForReward(
  amount: ethers.BigNumber,
  signer: ethers.Signer
): Promise<string> {
  try {
    console.log('=== SAFE APPROVE PLT FOR REWARD DEBUG ===')
    console.log('Performing safe approve for PLT reward...')
    console.log('PLT Token Address:', PLT_TOKEN_ADDRESS)
    console.log('Reward Contract Address:', REWARD_CONTRACT_ADDRESS)
    console.log('Amount:', amount.toString())
    
    const userAddress = await signer.getAddress()
    console.log('User address:', userAddress)
    
    const pltTokenContract = new ethers.Contract(PLT_TOKEN_ADDRESS, ERC20_ABI, signer)
    
    // Check current allowance
    const currentAllowance = await pltTokenContract.allowance(userAddress, REWARD_CONTRACT_ADDRESS)
    console.log('Current PLT allowance for reward:', currentAllowance.toString())
    
    // Check if we need to reset allowance first (some tokens require this)
    if (currentAllowance.gt(0) && currentAllowance.lt(amount)) {
      console.log('Current allowance is less than required, resetting to 0 first...')
      const resetTx = await pltTokenContract.approve(REWARD_CONTRACT_ADDRESS, 0)
      console.log('Reset transaction sent:', resetTx.hash)
      await resetTx.wait()
      console.log('Reset transaction confirmed')
    }
    
    // Approve the amount
    console.log('Approving PLT amount for reward:', amount.toString())
    console.log('About to call pltTokenContract.approve...')
    const approveTx = await pltTokenContract.approve(REWARD_CONTRACT_ADDRESS, amount)
    console.log('Approve transaction sent:', approveTx.hash)
    console.log('Waiting for transaction confirmation...')
    const receipt = await approveTx.wait()
    console.log('Transaction confirmed!')
    
    console.log('Safe approve PLT for reward completed:', receipt.transactionHash)
    return receipt.transactionHash
  } catch (error: any) {
    console.error('=== SAFE APPROVE PLT FOR REWARD ERROR ===')
    console.error('Safe approve PLT for reward failed:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    })
    throw error
  }
}

/**
 * Send reward to a user using the blockchain contract
 */
export async function sendRewardToUser(
  userAddress: string,
  amount: number,
  signer: ethers.Signer
): Promise<RewardStatus> {
  try {
    console.log('Sending reward to user...')
    console.log('User address:', userAddress)
    console.log('Amount:', amount)
    
    // Validate and normalize the user address
    let normalizedAddress: string
    try {
      normalizedAddress = ethers.utils.getAddress(userAddress)
      console.log('Normalized user address:', normalizedAddress)
    } catch (addressError) {
      console.error('Invalid user address:', userAddress)
      return {
        status: 'error',
        error: `Invalid user address: ${userAddress}`
      }
    }
    
    const rewardContract = new ethers.Contract(REWARD_CONTRACT_ADDRESS, REWARD_ABI, signer)
    const rewardAmount = ethers.utils.parseEther(amount.toString())
    
    // Check if PLT approval is needed
    const approvalNeeded = await checkPltApprovalNeededForReward(await signer.getAddress(), amount)
    
    if (approvalNeeded) {
      console.log('PLT approval needed for reward, requesting approval...')
      try {
        await safeApprovePltForReward(rewardAmount, signer)
        console.log('PLT approval for reward completed')
      } catch (approvalError: any) {
        console.error('PLT approval for reward failed:', approvalError)
        return {
          status: 'error',
          error: `PLT approval failed: ${approvalError.message || 'Unknown error'}`
        }
      }
    }
    
    // Estimate gas first
    const gasEstimate = await rewardContract.estimateGas.sendReward(normalizedAddress, rewardAmount)
    console.log('Estimated gas for reward:', gasEstimate.toString())
    
    // Add 20% buffer for gas
    const gasLimit = gasEstimate.mul(120).div(100)
    
    const tx = await rewardContract.sendReward(normalizedAddress, rewardAmount, {
      gasLimit: gasLimit
    })
    
    console.log('Reward transaction sent:', tx.hash)
    const receipt = await tx.wait()
    console.log('Reward confirmed:', receipt.transactionHash)
    
    return {
      status: 'success',
      transactionHash: receipt.transactionHash
    }
  } catch (error: any) {
    console.error('Reward failed:', error)
    return {
      status: 'error',
      error: error.message || 'Reward failed'
    }
  }
}

/**
 * Check if user is an approved merchant for sending rewards
 */
export async function checkApprovedMerchantForReward(userAddress: string): Promise<boolean> {
  try {
    // Use the user's connected wallet provider instead of a separate RPC provider
    if (typeof window === 'undefined' || !window.ethereum) {
      console.warn('No wallet detected, assuming not approved')
      return false
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const rewardContract = new ethers.Contract(REWARD_CONTRACT_ADDRESS, REWARD_ABI, provider)
    
    // Note: This assumes the contract has an isApprovedMerchant function
    // If not, you might need to add it to the ABI or use a different check
    const isApproved = await rewardContract.isApprovedMerchant(userAddress)
    console.log('Merchant approval status for reward:', isApproved)
    
    return isApproved
  } catch (error) {
    console.error('Failed to check merchant approval for reward:', error)
    return false
  }
} 