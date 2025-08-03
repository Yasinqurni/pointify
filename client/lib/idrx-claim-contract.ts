import { ethers } from 'ethers'

// IDRX Mock Token Contract Address
export const IDRX_MOCK_CONTRACT_ADDRESS = '0x7222435AC83D6c44052eB635112842Da458AEfD8'

// Lisk Sepolia Network Configuration
export const LISK_SEPOLIA_CONFIG = {
  chainId: 4202,
  name: 'Lisk Sepolia',
  rpcUrl: 'https://rpc.sepolia.lisk.com',
  blockExplorer: 'https://sepolia-blockscout.lisk.com'
}

// ABI for IDRX Faucet contract with faucet functionality
export const IDRX_MOCK_ABI = [
  'function mint(address to, uint256 amount) external',
  'function mintTo(address to, uint256 amount) external',
  'function faucet() external returns (bool)',
  'function claim() external returns (bool)',
  'function canUserClaim(address user) external view returns (bool canClaim, uint256 timeUntilNextClaim)',
  'function getUserLastClaimTime(address user) external view returns (uint256)',
  'function getFaucetInfo() external view returns (uint256 faucetBalance, uint256 dailyAmount, uint256 cooldownPeriod)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function owner() view returns (address)',
  'function totalSupply() view returns (uint256)'
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

    // Convert amount to wei (18 decimals)
    const amountInWei = ethers.utils.parseEther(amount.toString())

    console.log('Amount in Wei:', amountInWei.toString())

    // Check if the connected wallet is the owner
    let isOwner = false
    try {
      const owner = await contract.owner()
      isOwner = owner.toLowerCase() === connectedAddress.toLowerCase()
      console.log('Contract Owner:', owner)
      console.log('Connected Address:', connectedAddress)
      console.log('Is Owner:', isOwner)
    } catch (error) {
      console.log('Could not check owner, proceeding with mint attempt...')
    }

    // Check if user can claim first
    const canClaimResult = await contract.canUserClaim(connectedAddress)
    const canClaim = canClaimResult[0]
    const timeUntilNextClaim = canClaimResult[1]
    
    if (!canClaim) {
      const hoursLeft = Math.ceil(Number(timeUntilNextClaim) / 3600)
      throw new Error(`You can only claim once every 24 hours. Please wait ${hoursLeft} hours before claiming again.`)
    }
    
    // Try faucet function (primary method for IDRXFaucet)
    let gasEstimate
    let mintMethod = 'faucet'
    
    try {
      gasEstimate = await contract.estimateGas.faucet()
      console.log('✅ Faucet method available, gas estimate:', gasEstimate.toString())
    } catch (error) {
      console.log('❌ Faucet method failed:', (error as Error).message)
      throw new Error('Faucet is not available. Please contact admin.')
    }

    // Get current gas price and optimize it for Lisk Sepolia
    const gasPrice = await provider.getGasPrice()
    console.log('Current Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
    
    // Use a lower gas price for testnet (1 gwei should be sufficient for Lisk Sepolia)
    const optimizedGasPrice = ethers.utils.parseUnits('1', 'gwei')
    console.log('Optimized Gas Price:', ethers.utils.formatUnits(optimizedGasPrice, 'gwei'), 'gwei')
    
    // Execute the faucet transaction with optimized gas settings
    const txOptions = {
      gasLimit: gasEstimate.mul(110).div(100), // Add 10% buffer (reduced from 20%)
      gasPrice: optimizedGasPrice // Use optimized gas price
    }
    
    console.log('Transaction Options:', {
      gasLimit: txOptions.gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(txOptions.gasPrice, 'gwei') + ' gwei',
      estimatedCost: ethers.utils.formatEther(txOptions.gasLimit.mul(txOptions.gasPrice)) + ' ETH'
    })
    
    // Execute faucet transaction
    console.log('Executing faucet transaction...')
    const tx = await contract.faucet(txOptions)

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
      throw new Error('Transaction would fail. You might not have permission to mint tokens or insufficient gas.')
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient ETH balance to pay for gas fees.')
    } else if (error.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by user.')
    } else if (error.message?.includes('Only owner')) {
      throw new Error('Only the contract owner can mint tokens.')
    } else {
      throw new Error(error.message || 'Failed to claim IDRX tokens')
    }
  }
}

/**
 * Claim IDRX dummy tokens by minting them to the user's address
 * This function calls the mint function on the IDRX Mock contract
 * Note: This requires the connected wallet to be the owner of the contract
 * or the contract to have a public mint function
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
    
    // Get the connected address (this should be the same as userAddress)
    const connectedAddress = await signer.getAddress()
    console.log('Connected Address:', connectedAddress)
    console.log('Target Address:', userAddress)
    
    // Use the connected address as the target to ensure consistency
    const targetAddress = connectedAddress

    // Create contract instance
    const contract = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, signer)

    // Convert amount to wei (18 decimals)
    const amountInWei = ethers.utils.parseEther(amount.toString())

    console.log('Amount in Wei:', amountInWei.toString())

    // Check if the connected wallet is the owner
    let isOwner = false
    try {
      const owner = await contract.owner()
      isOwner = owner.toLowerCase() === connectedAddress.toLowerCase()
      console.log('Contract Owner:', owner)
      console.log('Connected Address:', connectedAddress)
      console.log('Is Owner:', isOwner)
    } catch (error) {
      console.log('Could not check owner, proceeding with mint attempt...')
    }

    // Try different minting approaches in order of preference (cheapest first)
    let gasEstimate
    let mintMethod = 'unknown'
    
    // 1. Try public faucet function first (cheapest)
    try {
      gasEstimate = await contract.estimateGas.faucet()
      mintMethod = 'faucet'
      console.log('Using faucet method - Gas Estimate:', gasEstimate.toString())
    } catch (error) {
      console.log('Faucet method not available, trying claim...')
      
      // 2. Try public claim function
      try {
        gasEstimate = await contract.estimateGas.claim()
        mintMethod = 'claim'
        console.log('Using claim method - Gas Estimate:', gasEstimate.toString())
      } catch (error) {
        console.log('Claim method not available, trying mint functions...')
        
        // 3. Try owner-only mint functions
        try {
          if (isOwner) {
            gasEstimate = await contract.estimateGas.mint(targetAddress, amountInWei)
            mintMethod = 'mint'
          } else {
            gasEstimate = await contract.estimateGas.mintTo(targetAddress, amountInWei)
            mintMethod = 'mintTo'
          }
          console.log(`Using ${mintMethod} method - Gas Estimate:`, gasEstimate.toString())
        } catch (error) {
          console.error('All gas estimation methods failed:', error)
          throw new Error('Transaction would fail. You might not have permission to mint tokens or the contract does not support public minting.')
        }
      }
    }

    // Get current gas price and optimize it for Lisk Sepolia
    const gasPrice = await provider.getGasPrice()
    console.log('Current Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
    
    // Use a lower gas price for testnet (1 gwei should be sufficient for Lisk Sepolia)
    const optimizedGasPrice = ethers.utils.parseUnits('1', 'gwei')
    console.log('Optimized Gas Price:', ethers.utils.formatUnits(optimizedGasPrice, 'gwei'), 'gwei')
    
    // Execute the mint transaction with optimized gas settings
    let tx
    const txOptions = {
      gasLimit: gasEstimate.mul(110).div(100), // Add 10% buffer (reduced from 20%)
      gasPrice: optimizedGasPrice // Use optimized gas price
    }
    
    console.log('Transaction Options:', {
      gasLimit: txOptions.gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(txOptions.gasPrice, 'gwei') + ' gwei',
      estimatedCost: ethers.utils.formatEther(txOptions.gasLimit.mul(txOptions.gasPrice)) + ' ETH'
    })
    
    // Execute transaction based on the successful method
    console.log(`Executing ${mintMethod} transaction...`)
    
    switch (mintMethod) {
      case 'faucet':
        tx = await contract.faucet(txOptions)
        break
      case 'claim':
        tx = await contract.claim(txOptions)
        break
      case 'mint':
        tx = await contract.mint(targetAddress, amountInWei, txOptions)
        break
      case 'mintTo':
        tx = await contract.mintTo(targetAddress, amountInWei, txOptions)
        break
      default:
        throw new Error('No valid minting method found')
    }

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
      throw new Error('Transaction would fail. You might not have permission to mint tokens or insufficient gas.')
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient ETH balance to pay for gas fees.')
    } else if (error.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by user.')
    } else if (error.message?.includes('Only owner')) {
      throw new Error('Only the contract owner can mint tokens.')
    } else {
      throw new Error(error.message || 'Failed to claim IDRX tokens')
    }
  }
}

/**
 * Check if the current user can mint IDRX tokens
 */
export async function canMintIDRX(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const connectedAddress = await signer.getAddress()
    const contract = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, provider)

    // Check if user is the owner
    try {
      const owner = await contract.owner()
      return owner.toLowerCase() === connectedAddress.toLowerCase()
    } catch (error) {
      console.log('Could not check owner status:', error)
      return false
    }
  } catch (error) {
    console.error('Error checking mint permission:', error)
    return false
  }
}

/**
 * Get contract information
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

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(IDRX_MOCK_CONTRACT_ADDRESS, IDRX_MOCK_ABI, provider)

    const [name, symbol, decimals, owner] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.owner()
    ])

    return {
      name,
      symbol,
      decimals,
      owner
    }
  } catch (error) {
    console.error('Error getting contract info:', error)
    return null
  }
}