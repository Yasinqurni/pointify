import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

// Contract ABIs (simplified for the main functions we need)
const LOYALTY_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function getBackingRatio() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
];

const REWARD_MANAGER_ABI = [
  'function isApprovedMerchant(address merchant) view returns (bool)',
  'function merchantQuota(address merchant) view returns (uint256)',
  'function rewardUser(address user, uint256 amount)',
  'function topUpIDRX(uint256 amount)',
  'function withdrawIDRX(uint256 amount)',
  'event UserRewarded(address indexed merchant, address indexed user, uint256 amount)',
  'event TopUpIDRX(address indexed merchant, uint256 amount)',
  'event WithdrawIDRX(address indexed merchant, uint256 amount)',
];

const REDEMPTION_ROUTER_ABI = [
  'function redeemPoint(uint256 amount)',
  'function manualRedeem(address user, uint256 amount, string item, address merchant)',
  'event Redeemed(address indexed user, uint256 amount, uint256 payout, uint256 fee)',
  'event ManualRedemption(address indexed user, uint256 amount, string item)',
];

const SWAP_ROUTER_ABI = [
  'function swapPLTForToken(address token, uint256 pltAmount)',
  'function swapTokenForPLT(address token, uint256 tokenAmount)',
  'function getExchangeRate(address token) view returns (uint256)',
  'function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) view returns (uint256)',
  'event Swapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)',
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private loyaltyTokenContract: ethers.Contract;
  private rewardManagerContract: ethers.Contract;
  private redemptionRouterContract: ethers.Contract;
  private swapRouterContract: ethers.Contract;

  constructor(private configService: ConfigService) {
    this.initializeProvider();
  }

  private initializeProvider() {
    const rpcUrl =
      this.configService.get<string>('BLOCKCHAIN_RPC_URL') ||
      'http://localhost:8545';
    
    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
        staticNetwork: true, // Prevent ENS resolution
      });
    } catch (error) {
      this.logger.error(`Failed to initialize provider: ${error.message}`);
      // Create a mock provider for development
      this.provider = new ethers.JsonRpcProvider('http://localhost:8545', undefined, {
        staticNetwork: true,
      });
    }

    const loyaltyTokenAddress = this.configService.get<string>(
      'LOYALTY_TOKEN_ADDRESS',
    );
    const rewardManagerAddress = this.configService.get<string>(
      'REWARD_MANAGER_ADDRESS',
    );
    const redemptionRouterAddress = this.configService.get<string>(
      'REDEMPTION_ROUTER_ADDRESS',
    );
    const swapRouterAddress = this.configService.get<string>(
      'SWAP_ROUTER_ADDRESS',
    );

    if (loyaltyTokenAddress) {
      this.loyaltyTokenContract = new ethers.Contract(
        loyaltyTokenAddress,
        LOYALTY_TOKEN_ABI,
        this.provider,
      );
    }

    if (rewardManagerAddress) {
      this.rewardManagerContract = new ethers.Contract(
        rewardManagerAddress,
        REWARD_MANAGER_ABI,
        this.provider,
      );
    }

    if (redemptionRouterAddress) {
      this.redemptionRouterContract = new ethers.Contract(
        redemptionRouterAddress,
        REDEMPTION_ROUTER_ABI,
        this.provider,
      );
    }

    if (swapRouterAddress) {
      this.swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SWAP_ROUTER_ABI,
        this.provider,
      );
    }
  }

  // Loyalty Token functions
  async getLoyaltyTokenBalance(address: string): Promise<string> {
    try {
      const balance = await this.loyaltyTokenContract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(
        `Error getting loyalty token balance: ${error.message}`,
      );
      return '0';
    }
  }

  async getTotalSupply(): Promise<string> {
    try {
      const totalSupply = await this.loyaltyTokenContract.totalSupply();
      return ethers.formatEther(totalSupply);
    } catch (error) {
      this.logger.error(`Error getting total supply: ${error.message}`);
      return '0';
    }
  }

  async getBackingRatio(): Promise<string> {
    try {
      const ratio = await this.loyaltyTokenContract.getBackingRatio();
      return ethers.formatEther(ratio);
    } catch (error) {
      this.logger.error(`Error getting backing ratio: ${error.message}`);
      return '0';
    }
  }

  // Reward Manager functions
  async isApprovedMerchant(address: string): Promise<boolean> {
    try {
      return await this.rewardManagerContract.isApprovedMerchant(address);
    } catch (error) {
      this.logger.error(`Error checking merchant approval: ${error.message}`);
      return false;
    }
  }

  async getMerchantQuota(address: string): Promise<string> {
    try {
      const quota = await this.rewardManagerContract.merchantQuota(address);
      return ethers.formatEther(quota);
    } catch (error) {
      this.logger.error(`Error getting merchant quota: ${error.message}`);
      return '0';
    }
  }

  async rewardUser(
    merchantWallet: string,
    userWallet: string,
    amount: string,
  ): Promise<boolean> {
    try {
      // Check if contracts are available
      if (!this.rewardManagerContract) {
        this.logger.warn('Reward manager contract not configured');
        return false;
      }

      // For now, return false since we don't have a signer configured
      // In production, you would need to configure a signer with private key
      this.logger.warn('Signer not configured for blockchain operations');
      return false;
      
      // Uncomment when you have a proper signer configured:
      // const signer = await this.provider.getSigner();
      // const rewardManagerWithSigner = this.rewardManagerContract.connect(signer);
      // const amountWei = ethers.parseEther(amount);
      // const tx = await (rewardManagerWithSigner as any).rewardUser(userWallet, amountWei);
      // await tx.wait();
      // this.logger.log(`Rewarded ${amount} PLT to ${userWallet} by merchant ${merchantWallet}`);
      // return true;
    } catch (error) {
      this.logger.error(`Error rewarding user: ${error.message}`);
      return false;
    }
  }

  // Redemption Router functions
  async redeemPoint(userWallet: string, amount: string): Promise<boolean> {
    try {
      // Check if contracts are available
      if (!this.redemptionRouterContract) {
        this.logger.warn('Redemption router contract not configured');
        return false;
      }

      // For now, return false since we don't have a signer configured
      this.logger.warn('Signer not configured for blockchain operations');
      return false;
      
      // Uncomment when you have a proper signer configured:
      // const signer = await this.provider.getSigner();
      // const redemptionRouterWithSigner = this.redemptionRouterContract.connect(signer);
      // const amountWei = ethers.parseEther(amount);
      // const tx = await (redemptionRouterWithSigner as any).redeemPoint(amountWei);
      // await tx.wait();
      // this.logger.log(`Redeemed ${amount} PLT for user ${userWallet}`);
      // return true;
    } catch (error) {
      this.logger.error(`Error redeeming points: ${error.message}`);
      return false;
    }
  }

  async manualRedeem(
    userWallet: string,
    amount: string,
    item: string,
    merchantWallet: string,
  ): Promise<boolean> {
    try {
      // Check if contracts are available
      if (!this.redemptionRouterContract) {
        this.logger.warn('Redemption router contract not configured');
        return false;
      }

      // For now, return false since we don't have a signer configured
      this.logger.warn('Signer not configured for blockchain operations');
      return false;
      
      // Uncomment when you have a proper signer configured:
      // const signer = await this.provider.getSigner();
      // const redemptionRouterWithSigner = this.redemptionRouterContract.connect(signer);
      // const amountWei = ethers.parseEther(amount);
      // const tx = await (redemptionRouterWithSigner as any).manualRedeem(userWallet, amountWei, item, merchantWallet);
      // await tx.wait();
      // this.logger.log(`Manual redemption: ${amount} PLT for item ${item} by user ${userWallet}`);
      // return true;
    } catch (error) {
      this.logger.error(`Error manual redemption: ${error.message}`);
      return false;
    }
  }

  // Swap Router functions
  async getExchangeRate(tokenAddress: string): Promise<string> {
    try {
      const rate = await this.swapRouterContract.getExchangeRate(tokenAddress);
      return ethers.formatEther(rate);
    } catch (error) {
      this.logger.error(`Error getting exchange rate: ${error.message}`);
      return '0';
    }
  }

  async swapPLTForToken(
    tokenAddress: string,
    pltAmount: string,
  ): Promise<boolean> {
    try {
      // Check if contracts are available
      if (!this.swapRouterContract) {
        this.logger.warn('Swap router contract not configured');
        return false;
      }

      // For now, return false since we don't have a signer configured
      this.logger.warn('Signer not configured for blockchain operations');
      return false;
      
      // Uncomment when you have a proper signer configured:
      // const signer = await this.provider.getSigner();
      // const swapRouterWithSigner = this.swapRouterContract.connect(signer);
      // const amountWei = ethers.parseEther(pltAmount);
      // const tx = await (swapRouterWithSigner as any).swapPLTForToken(tokenAddress, amountWei);
      // await tx.wait();
      // this.logger.log(`Swapped ${pltAmount} PLT for token ${tokenAddress}`);
      // return true;
    } catch (error) {
      this.logger.error(`Error swapping PLT for token: ${error.message}`);
      return false;
    }
  }

  async swapTokenForPLT(
    tokenAddress: string,
    tokenAmount: string,
  ): Promise<boolean> {
    try {
      // Check if contracts are available
      if (!this.swapRouterContract) {
        this.logger.warn('Swap router contract not configured');
        return false;
      }

      // For now, return false since we don't have a signer configured
      this.logger.warn('Signer not configured for blockchain operations');
      return false;
      
      // Uncomment when you have a proper signer configured:
      // const signer = await this.provider.getSigner();
      // const swapRouterWithSigner = this.swapRouterContract.connect(signer);
      // const amountWei = ethers.parseEther(tokenAmount);
      // const tx = await (swapRouterWithSigner as any).swapTokenForPLT(tokenAddress, amountWei);
      // await tx.wait();
      // this.logger.log(`Swapped ${tokenAmount} tokens for PLT`);
      // return true;
    } catch (error) {
      this.logger.error(`Error swapping token for PLT: ${error.message}`);
      return false;
    }
  }

  // Utility functions
  async getNetworkInfo(): Promise<{ chainId: number; networkName: string }> {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        networkName: network.name,
      };
    } catch (error) {
      this.logger.error(`Error getting network info: ${error.message}`);
      return { chainId: 0, networkName: 'Unknown' };
    }
  }

  async validateWalletSignature(
    message: string,
    signature: string,
    expectedAddress: string,
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      this.logger.error(`Error validating wallet signature: ${error.message}`);
      return false;
    }
  }
}
