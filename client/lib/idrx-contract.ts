import { ethers } from 'ethers'
import { useWalletStore } from './store'

// IDRX Mock Token Contract Address on Lisk Sepolia
export const IDRX_CONTRACT_ADDRESS = '0x7222435AC83D6c44052eB635112842Da458AEfD8'

// Lisk Sepolia RPC URL
export const LISK_SEPOLIA_RPC = 'https://rpc.sepolia.lisk.com'

// ERC-20 ABI for balance reading
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

/**
 * Fetch IDRX token balance from contract
 * Uses the user's connected wallet provider
 * Fetches the connected wallet address
 * Reads the ERC20 balance from this contract: 0x7222435AC83D6c44052eB635112842Da458AEfD8
 */
export async function getIDRXBalance(address?: string): Promise<number> {
  try {
    // Get wallet address if not provided
    if (!address) {
      const { walletAddress } = useWalletStore.getState()
      if (!walletAddress) {
        console.log('No wallet connected')
        return 0
      }
      address = walletAddress
    }

    console.log('FETCHING IDRX BALANCE FOR:', address)
    
    // Use the user's connected wallet provider instead of a separate RPC provider
    if (typeof window === 'undefined' || !window.ethereum) {
      console.warn('No wallet detected, returning 0')
      return 0
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    
    // Verify network
    const network = await provider.getNetwork()
    console.log('CONNECTED TO NETWORK:', network.name, 'CHAIN ID:', network.chainId)
    
    // Create contract instance
    const contract = new ethers.Contract(IDRX_CONTRACT_ADDRESS, ERC20_ABI, provider)
    
    console.log('READING FROM CONTRACT:', IDRX_CONTRACT_ADDRESS)
    
    // Get balance and decimals
    const balance = await contract.balanceOf(address)
    const decimals = await contract.decimals()
    
    console.log('RAW BALANCE:', balance.toString())
    console.log('DECIMALS:', decimals.toString())
    
    // Format from wei to readable format
    const formattedBalance = ethers.utils.formatUnits(balance, decimals)
    const numericBalance = parseFloat(formattedBalance)
    
    console.log('FORMATTED BALANCE:', formattedBalance)
    console.log('FINAL NUMERIC BALANCE:', numericBalance)
    
    return numericBalance
    
  } catch (error) {
    console.log('IDRX CONTRACT ERROR:', error)
    return 0
  }
}

/**
 * Trigger wallet connection and fetch IDRX balance
 */
export async function connectAndFetchIDRX(): Promise<number> {
  const { walletAddress, isConnected } = useWalletStore.getState()
  
  if (!isConnected || !walletAddress) {
    console.log('Please connect your wallet first')
    return 0
  }
  
  return await getIDRXBalance(walletAddress)
}

// Re-export claim functions from idrx-claim-contract
export { claimIDRXTokens, claimIDRXTokensSimple } from './idrx-claim-contract'

// Export the function as default export too for convenience
export default getIDRXBalance