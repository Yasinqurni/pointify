import { ethers } from 'ethers'

// IDRX Mock Token Contract Address
export const IDRX_MOCK_CONTRACT_ADDRESS = '0x0e6A2cc12990B80943972E7E07828CeDb4119b0E'

// Lisk Sepolia Network Configuration
export const LISK_SEPOLIA_CONFIG = {
  chainId: 4202,
  name: 'Lisk Sepolia',
  rpcUrl: 'https://rpc.sepolia.lisk.com',
  blockExplorer: 'https://sepolia-blockscout.lisk.com'
}

// ABI for the deployed faucet contract
export const IDRX_MOCK_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "DAILY_LIMIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "canClaim",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "lastClaimedAt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pltToken",
    "outputs": [
      {
        "internalType": "contract IPLTToken",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

/**
 * Claim IDRX tokens for the connected wallet (simplified version)
 */
export async function claimIDRXTokensSimple(amount: number): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    
    // Check network - ensure we're on Lisk Sepolia
    const network = await provider.getNetwork()
    console.log('Current Network:', network.name, 'Chain ID:', network.chainId)
    
    if (network.chainId !== LISK_SEPOLIA_CONFIG.chainId) {
      throw new Error(`Please switch to Lisk Sepolia testnet (Chain ID: ${LISK_SEPOLIA_CONFIG.chainId}). Current network: ${network.chainId}`)
    }
    
    // Get the connected address
    const connectedAddress = await signer.getAddress()
    console.log('Connected Address:', connectedAddress)

    // Create contract instance
    const contract = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, signer)

    // Estimate gas for claim function
    let gasEstimate
    try {
      gasEstimate = await contract.estimateGas.claim()
      console.log('✅ Claim method available, gas estimate:', gasEstimate.toString())
    } catch (error) {
      console.log('❌ Claim method failed:', (error as Error).message)
      throw new Error('Claim is not available. Please contact admin.')
    }

    // Get current gas price and optimize it for Lisk Sepolia
    const gasPrice = await provider.getGasPrice()
    console.log('Current Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
    
    // Use a lower gas price for testnet (1 gwei should be sufficient for Lisk Sepolia)
    const optimizedGasPrice = ethers.utils.parseUnits('1', 'gwei')
    console.log('Optimized Gas Price:', ethers.utils.formatUnits(optimizedGasPrice, 'gwei'), 'gwei')
    
    // Execute the claim transaction with optimized gas settings
    const txOptions = {
      gasLimit: gasEstimate.mul(110).div(100), // Add 10% buffer
      gasPrice: optimizedGasPrice // Use optimized gas price
    }
    
    console.log('Transaction Options:', {
      gasLimit: txOptions.gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(txOptions.gasPrice, 'gwei') + ' gwei',
      estimatedCost: ethers.utils.formatEther(txOptions.gasLimit.mul(txOptions.gasPrice)) + ' ETH'
    })
    
    // Execute claim transaction
    console.log('Executing claim transaction...')
    const tx = await contract.claim(txOptions)

    console.log('Transaction sent:', tx.hash)

    // Wait for transaction confirmation
    console.log('Waiting for transaction confirmation...')
    const receipt = await tx.wait()

    console.log('Transaction confirmed:', receipt.transactionHash)
    console.log('Gas used:', receipt.gasUsed.toString())

    return receipt.transactionHash

  } catch (error: any) {
    console.error('Claim IDRX failed:', error)
    
    // Handle specific error cases
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      throw new Error('Transaction would fail. You might not have permission to claim tokens or insufficient gas.')
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient ETH balance to pay for gas fees.')
    } else if (error.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by user.')
    } else {
      throw new Error(error.message || 'Failed to claim IDRX tokens')
    }
  }
}

/**
 * Claim IDRX dummy tokens using the claim function
 * This function calls the claim function on the IDRX contract
 */
export async function claimIDRXTokens(
  userAddress: string,
  amount: number
): Promise<string> {
  try {
    console.log('Claiming IDRX tokens...')
    console.log('User Address:', userAddress)
    console.log('Amount:', amount)
    console.log('Contract Address:', IDRX_MOCK_CONTRACT_ADDRESS)

    // Check if wallet is connected
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet detected. Please install MetaMask or connect your wallet.')
    }

    // Get provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    
    // Check network - ensure we're on Lisk Sepolia
    const network = await provider.getNetwork()
    console.log('Current Network:', network.name, 'Chain ID:', network.chainId)
    
    if (network.chainId !== LISK_SEPOLIA_CONFIG.chainId) {
      throw new Error(`Please switch to Lisk Sepolia testnet (Chain ID: ${LISK_SEPOLIA_CONFIG.chainId}). Current network: ${network.chainId}`)
    }
    
    // Get the connected address
    const connectedAddress = await signer.getAddress()
    console.log('Connected Address:', connectedAddress)

    // Create contract instance
    const contract = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, signer)

    // Estimate gas for claim function
    let gasEstimate
    try {
      gasEstimate = await contract.estimateGas.claim()
      console.log('✅ Claim method available, gas estimate:', gasEstimate.toString())
    } catch (error) {
      console.log('❌ Claim method failed:', (error as Error).message)
      throw new Error('Claim is not available. Please contact admin.')
    }

    // Get current gas price and optimize it for Lisk Sepolia
    const gasPrice = await provider.getGasPrice()
    console.log('Current Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
    
    // Use a lower gas price for testnet (1 gwei should be sufficient for Lisk Sepolia)
    const optimizedGasPrice = ethers.utils.parseUnits('1', 'gwei')
    console.log('Optimized Gas Price:', ethers.utils.formatUnits(optimizedGasPrice, 'gwei'), 'gwei')
    
    // Execute the claim transaction with optimized gas settings
    const txOptions = {
      gasLimit: gasEstimate.mul(110).div(100), // Add 10% buffer
      gasPrice: optimizedGasPrice // Use optimized gas price
    }
    
    console.log('Transaction Options:', {
      gasLimit: txOptions.gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(txOptions.gasPrice, 'gwei') + ' gwei',
      estimatedCost: ethers.utils.formatEther(txOptions.gasLimit.mul(txOptions.gasPrice)) + ' ETH'
    })
    
    // Execute claim transaction
    console.log('Executing claim transaction...')
    const tx = await contract.claim(txOptions)

    console.log('Transaction sent:', tx.hash)

    // Wait for transaction confirmation
    console.log('Waiting for transaction confirmation...')
    const receipt = await tx.wait()

    console.log('Transaction confirmed:', receipt.transactionHash)
    console.log('Gas used:', receipt.gasUsed.toString())

    return receipt.transactionHash

  } catch (error: any) {
    console.error('Claim IDRX failed:', error)
    
    // Handle specific error cases
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      throw new Error('Transaction would fail. You might not have permission to claim tokens or insufficient gas.')
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient ETH balance to pay for gas fees.')
    } else if (error.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by user.')
    } else {
      throw new Error(error.message || 'Failed to claim IDRX tokens')
    }
  }
}

/**
 * Check if the current user can claim IDRX tokens
 * Since the new contract only has a claim function, we'll return true
 * as the claim function should handle its own validation
 */
export async function canMintIDRX(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false
    }

    // For the simplified contract, we assume anyone can claim
    // The contract's claim function will handle its own validation
    return true
  } catch (error) {
    console.error('Error checking claim permission:', error)
    return false
  }
}

/**
 * Get contract information
 * Since the new contract has a simplified ABI, we'll return basic info
 */
export async function getIDRXContractInfo(): Promise<{
  name: string
  symbol: string
  decimals: number
  owner: string
} | null> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null
    }

    // For the simplified contract, return basic information
    return {
      name: "IDRX Faucet",
      symbol: "IDRX",
      decimals: 18,
      owner: "0x0000000000000000000000000000000000000000" // Unknown for simplified contract
    }
  } catch (error) {
    console.error('Error getting contract info:', error)
    return null
  }
}

/**
 * Test contract connection and available functions
 */
export async function testContractConnection(): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const connectedAddress = await signer.getAddress()
    
    console.log('Testing contract connection...')
    console.log('Contract address:', IDRX_MOCK_CONTRACT_ADDRESS)
    console.log('Connected address:', connectedAddress)
    
    const contract = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, provider)
    
    // Test basic contract functions
    try {
      const owner = await contract.owner()
      console.log('✅ Owner function works:', owner)
    } catch (e: any) {
      console.log('❌ Owner function failed:', e.message)
    }
    
    try {
      const dailyLimit = await contract.DAILY_LIMIT()
      console.log('✅ DAILY_LIMIT function works:', dailyLimit.toString())
    } catch (e: any) {
      console.log('❌ DAILY_LIMIT function failed:', e.message)
    }
    
    try {
      const canClaim = await contract.canClaim(connectedAddress)
      console.log('✅ canClaim function works:', canClaim)
    } catch (e: any) {
      console.log('❌ canClaim function failed:', e.message)
    }
    
    try {
      const lastClaimed = await contract.lastClaimedAt(connectedAddress)
      console.log('✅ lastClaimedAt function works:', lastClaimed.toString())
    } catch (e: any) {
      console.log('❌ lastClaimedAt function failed:', e.message)
    }
    
    // Test claim function with signer
    const contractWithSigner = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, signer)
    try {
      const gasEstimate = await contractWithSigner.estimateGas.claim()
      console.log('✅ Claim function works, gas estimate:', gasEstimate.toString())
    } catch (e: any) {
      console.log('❌ Claim function failed:', e.message)
    }
    
  } catch (error) {
    console.error('Contract connection test failed:', error)
  }
}

/**
 * Check if user can claim and get time until next claim
 */
export async function checkClaimEligibility(userAddress: string): Promise<{ canClaim: boolean; timeRemaining?: number }> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, provider)
    
    const canClaim = await contract.canClaim(userAddress)
    
    if (!canClaim) {
      // Get last claim time to calculate time remaining
      const lastClaimed = await contract.lastClaimedAt(userAddress)
      const now = Math.floor(Date.now() / 1000)
      const timeSinceLastClaim = now - lastClaimed.toNumber()
      const cooldownPeriod = 24 * 60 * 60 // 24 hours in seconds
      const timeRemaining = Math.max(0, cooldownPeriod - timeSinceLastClaim)
      
      return { canClaim: false, timeRemaining }
    }
    
    return { canClaim: true }
  } catch (error) {
    console.error('Error checking claim eligibility:', error)
    return { canClaim: false }
  }
}