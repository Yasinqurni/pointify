import { ethers } from 'ethers'

// Contract addresses
export const PLT_SWAP_CONTRACT_ADDRESS = '0xb481aA7164BE29c0a2c5e6b53Dfc84081bC4bC75'
export const PLT_TOKEN_ADDRESS = '0x04f0c7778AD75B535Ca478Cc01eA8574C7Ca3A7E'
export const IDRX_TOKEN_ADDRESS = '0x7222435AC83D6c44052eB635112842Da458AEfD8' // IDRX token address

// Lisk Sepolia RPC URL
export const LISK_SEPOLIA_RPC = 'https://rpc.sepolia.lisk.com'

// Cache for PLT balance
const pltBalanceCache = new Map<string, { balance: number; timestamp: number }>()
const PLT_CACHE_DURATION = 30000 // 30 seconds

// ABI for the PLT swap contract
export const PLT_SWAP_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'idrxAmount', type: 'uint256' }
    ],
    name: 'swapIDRXToPLT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
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
  },
  {
    inputs: [
      { internalType: 'address', name: 'merchant', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'redeemToMerchant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
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

export interface SwapStatus {
  status: 'pending' | 'success' | 'error'
  transactionHash?: string
  error?: string
}

export interface GasInfo {
  gasPrice: string
  estimatedGas: string
  totalCost: string
}

/**
 * Get cached PLT balance if available and not expired
 */
function getCachedPltBalance(address: string): number | null {
  const cached = pltBalanceCache.get(address)
  
  if (cached && Date.now() - cached.timestamp < PLT_CACHE_DURATION) {
    return cached.balance
  }
  
  return null
}

/**
 * Cache PLT balance
 */
function cachePltBalance(address: string, balance: number): void {
  pltBalanceCache.set(address, { balance, timestamp: Date.now() })
}

/**
 * Clear PLT balance cache
 */
export function clearPltBalanceCache(address?: string): void {
  if (address) {
    pltBalanceCache.delete(address)
  } else {
    pltBalanceCache.clear()
  }
}

/**
 * Check if a token contract supports ERC20 functions
 */
export async function checkTokenSupport(tokenAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    
    // Try to call a basic ERC20 function
    await tokenContract.balanceOf(tokenAddress)
    return true
  } catch (error) {
    console.error('Token contract does not support ERC20 functions:', error)
    return false
  }
}

/**
 * Check if user is an approved merchant
 */
export async function checkApprovedMerchant(userAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
    const swapContract = new ethers.Contract(PLT_SWAP_CONTRACT_ADDRESS, PLT_SWAP_ABI, provider)
    
    const isApproved = await swapContract.isApprovedMerchant(userAddress)
    console.log('Merchant approval status:', isApproved)
    
    return isApproved
  } catch (error) {
    console.error('Failed to check merchant approval:', error)
    return false
  }
}

/**
 * Get current gas price and estimate transaction cost
 */
export async function getGasInfo(amount: number): Promise<GasInfo> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
    const gasPrice = await provider.getGasPrice()
    
    // Estimate gas for swap transaction
    const swapContract = new ethers.Contract(PLT_SWAP_CONTRACT_ADDRESS, PLT_SWAP_ABI, provider)
    const swapAmount = ethers.utils.parseEther(amount.toString())
    const estimatedGas = await swapContract.estimateGas.swapIDRXToPLT(swapAmount)
    
    // Add 20% buffer
    const gasWithBuffer = estimatedGas.mul(120).div(100)
    const totalCost = gasPrice.mul(gasWithBuffer)
    
    return {
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei',
      estimatedGas: gasWithBuffer.toString(),
      totalCost: ethers.utils.formatEther(totalCost) + ' ETH'
    }
  } catch (error) {
    console.error('Failed to get gas info:', error)
    return {
      gasPrice: 'Unknown',
      estimatedGas: 'Unknown',
      totalCost: 'Unknown'
    }
  }
}

/**
 * Get PLT balance for a specific address
 */
export async function getPltBalance(address: string): Promise<number> {
  try {
    const cachedBalance = getCachedPltBalance(address)
    if (cachedBalance !== null) {
      return cachedBalance
    }

    const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
    const pltContract = new ethers.Contract(PLT_TOKEN_ADDRESS, ERC20_ABI, provider)
    
    const balance = await pltContract.balanceOf(address)
    const balanceEth = parseFloat(ethers.utils.formatEther(balance))
    cachePltBalance(address, balanceEth)
    return balanceEth
  } catch (error) {
    console.error('Failed to get PLT balance:', error)
    return 0
  }
}

/**
 * Check if PLT token approval is needed for redemption
 */
export async function checkPltApprovalNeeded(
  userAddress: string, 
  amount: number
): Promise<boolean> {
  try {
    console.log('Checking PLT approval for:', userAddress)
    console.log('PLT Token Address:', PLT_TOKEN_ADDRESS)
    console.log('Swap Contract Address:', PLT_SWAP_CONTRACT_ADDRESS)
    
    const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
    const pltTokenContract = new ethers.Contract(PLT_TOKEN_ADDRESS, ERC20_ABI, provider)
    
    const allowance = await pltTokenContract.allowance(userAddress, PLT_SWAP_CONTRACT_ADDRESS)
    const requiredAmount = ethers.utils.parseEther(amount.toString())
    
    console.log('Current PLT allowance:', allowance.toString())
    console.log('Required amount:', requiredAmount.toString())
    
    return allowance.lt(requiredAmount)
  } catch (error) {
    console.error('Failed to check PLT approval:', error)
    // If the contract doesn't support allowance, assume approval is needed
    return true
  }
}

/**
 * Check if IDRX token approval is needed for swapping
 */
export async function checkApprovalNeeded(
  userAddress: string, 
  amount: number
): Promise<boolean> {
  try {
    console.log('Checking approval for:', userAddress)
    console.log('IDRX Token Address:', IDRX_TOKEN_ADDRESS)
    console.log('Swap Contract Address:', PLT_SWAP_CONTRACT_ADDRESS)
    
    const provider = new ethers.providers.JsonRpcProvider(LISK_SEPOLIA_RPC)
    const idrxTokenContract = new ethers.Contract(IDRX_TOKEN_ADDRESS, ERC20_ABI, provider)
    
    const allowance = await idrxTokenContract.allowance(userAddress, PLT_SWAP_CONTRACT_ADDRESS)
    const requiredAmount = ethers.utils.parseEther(amount.toString())
    
    console.log('Current allowance:', allowance.toString())
    console.log('Required amount:', requiredAmount.toString())
    
    return allowance.lt(requiredAmount)
  } catch (error) {
    console.error('Failed to check approval:', error)
    // If the contract doesn't support allowance, assume approval is needed
    return true
  }
}

/**
 * Safe approve function for ERC20 tokens
 * Approves the amount directly without resetting
 */
export async function safeApprove(
  token: ethers.Contract,
  spender: string,
  amount: ethers.BigNumber,
  signer: ethers.Signer
): Promise<string> {
  try {
    console.log('=== SAFE APPROVE DEBUG ===')
    console.log('Performing safe approve...')
    console.log('Token address:', token.address)
    console.log('Spender address:', spender)
    console.log('Amount:', amount.toString())
    
    const userAddress = await signer.getAddress()
    console.log('User address:', userAddress)
    
    // Check current allowance
    const currentAllowance = await token.allowance(userAddress, spender)
    console.log('Current allowance:', currentAllowance.toString())
    
    // Check if we need to reset allowance first (some tokens require this)
    if (currentAllowance.gt(0) && currentAllowance.lt(amount)) {
      console.log('Current allowance is less than required, resetting to 0 first...')
      const resetTx = await token.approve(spender, 0)
      console.log('Reset transaction sent:', resetTx.hash)
      await resetTx.wait()
      console.log('Reset transaction confirmed')
    }
    
    // Approve the amount
    console.log('Approving amount:', amount.toString())
    console.log('About to call token.approve...')
    const approveTx = await token.approve(spender, amount)
    console.log('Approve transaction sent:', approveTx.hash)
    console.log('Waiting for transaction confirmation...')
    const receipt = await approveTx.wait()
    console.log('Transaction confirmed!')
    
    console.log('Safe approve completed:', receipt.transactionHash)
    return receipt.transactionHash
  } catch (error: any) {
    console.error('=== SAFE APPROVE ERROR ===')
    console.error('Safe approve failed:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    })
    throw error
  }
}

/**
 * Approve IDRX tokens for swapping using safe approve
 */
export async function approveIdrxTokens(
  userAddress: string,
  amount: number,
  signer: ethers.Signer
): Promise<string> {
  try {
    console.log('Approving IDRX tokens with safe approve...')
    
    // Use the actual IDRX token contract for approval
    const idrxTokenContract = new ethers.Contract(IDRX_TOKEN_ADDRESS, ERC20_ABI, signer)
    
    const approveAmount = ethers.utils.parseEther(amount.toString())
    
    // Use safe approve on the token contract
    return await safeApprove(idrxTokenContract, PLT_SWAP_CONTRACT_ADDRESS, approveAmount, signer)
  } catch (error) {
    console.error('Approval failed:', error)
    throw error
  }
}

/**
 * Swap IDRX to PLT
 */
export async function swapIdrxToPlt(
  amount: number,
  signer: ethers.Signer
): Promise<string> {
  try {
    console.log('Swapping IDRX to PLT...')
    const swapContract = new ethers.Contract(PLT_SWAP_CONTRACT_ADDRESS, PLT_SWAP_ABI, signer)
    
    const swapAmount = ethers.utils.parseEther(amount.toString())
    
    // Estimate gas first
    const gasEstimate = await swapContract.estimateGas.swapIDRXToPLT(swapAmount)
    console.log('Estimated gas for swap:', gasEstimate.toString())
    
    // Add 20% buffer for gas
    const gasLimit = gasEstimate.mul(120).div(100)
    
    const tx = await swapContract.swapIDRXToPLT(swapAmount, {
      gasLimit: gasLimit
    })
    
    console.log('Swap transaction sent:', tx.hash)
    const receipt = await tx.wait()
    console.log('Swap confirmed:', receipt.transactionHash)
    
    return receipt.transactionHash
  } catch (error) {
    console.error('Swap failed:', error)
    throw error
  }
}

/**
 * Complete PLT top-up process
 */
export async function topUpPlt(
  userAddress: string,
  amount: number,
  signer: ethers.Signer
): Promise<SwapStatus> {
  try {
    console.log('Starting PLT top-up process...')
    
    // Check if user is an approved merchant first
    const isApproved = await checkApprovedMerchant(userAddress)
    if (!isApproved) {
      return {
        status: 'error',
        error: 'You are not an approved merchant. Please complete your merchant registration on the blockchain first.'
      }
    }
    
    // Check user's gas balance
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const gasBalance = await provider.getBalance(userAddress)
    const gasBalanceEth = parseFloat(ethers.utils.formatEther(gasBalance))
    
    console.log('User gas balance:', gasBalanceEth, 'ETH')
    
    // Check if user has enough gas (minimum 0.01 ETH for safety)
    if (gasBalanceEth < 0.01) {
      return {
        status: 'error',
        error: `Insufficient gas fees. You need at least 0.01 ETH for gas. Current balance: ${gasBalanceEth.toFixed(4)} ETH`
      }
    }
    
    // Check if approval is needed
    const approvalNeeded = await checkApprovalNeeded(userAddress, amount)
    
    if (approvalNeeded) {
      console.log('Approval needed, requesting approval...')
      try {
        await approveIdrxTokens(userAddress, amount, signer)
      } catch (approvalError: any) {
        console.error('Approval failed:', approvalError)
        return {
          status: 'error',
          error: `Approval failed: ${approvalError.message || 'Unknown error'}`
        }
      }
    }
    
    // Perform the swap
    try {
      const swapTxHash = await swapIdrxToPlt(amount, signer)
      
      return {
        status: 'success',
        transactionHash: swapTxHash
      }
    } catch (swapError: any) {
      console.error('Swap failed:', swapError)
      return {
        status: 'error',
        error: `Swap failed: ${swapError.message || 'Unknown error'}`
      }
    }
  } catch (error: any) {
    console.error('PLT top-up failed:', error)
    return {
      status: 'error',
      error: error.message || 'Swap failed'
    }
  }
}

/**
 * Redeem PLT tokens to merchant
 */
export async function redeemToMerchant(
  merchantAddress: string,
  amount: number,
  signer: ethers.Signer
): Promise<SwapStatus> {
  try {
    console.log('Redeeming PLT to merchant...')
    const swapContract = new ethers.Contract(PLT_SWAP_CONTRACT_ADDRESS, PLT_SWAP_ABI, signer)
    
    const redeemAmount = ethers.utils.parseEther(amount.toString())
    
    // Estimate gas first
    const gasEstimate = await swapContract.estimateGas.redeemToMerchant(merchantAddress, redeemAmount)
    console.log('Estimated gas for redemption:', gasEstimate.toString())
    
    // Add 20% buffer for gas
    const gasLimit = gasEstimate.mul(120).div(100)
    
    const tx = await swapContract.redeemToMerchant(merchantAddress, redeemAmount, {
      gasLimit: gasLimit
    })
    
    console.log('Redemption transaction sent:', tx.hash)
    const receipt = await tx.wait()
    console.log('Redemption confirmed:', receipt.transactionHash)
    
    return {
      status: 'success',
      transactionHash: receipt.transactionHash
    }
  } catch (error: any) {
    console.error('Redemption failed:', error)
    return {
      status: 'error',
      error: error.message || 'Redemption failed'
    }
  }
} 