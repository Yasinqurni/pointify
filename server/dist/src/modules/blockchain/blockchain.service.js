"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const config_1 = require("@nestjs/config");
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
let BlockchainService = BlockchainService_1 = class BlockchainService {
    configService;
    logger = new common_1.Logger(BlockchainService_1.name);
    provider;
    loyaltyTokenContract;
    rewardManagerContract;
    redemptionRouterContract;
    swapRouterContract;
    constructor(configService) {
        this.configService = configService;
        this.initializeProvider();
    }
    initializeProvider() {
        const rpcUrl = this.configService.get('BLOCKCHAIN_RPC_URL') ||
            'http://localhost:8545';
        try {
            this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl, undefined, {
                staticNetwork: true,
            });
        }
        catch (error) {
            this.logger.error(`Failed to initialize provider: ${error.message}`);
            this.provider = new ethers_1.ethers.JsonRpcProvider('http://localhost:8545', undefined, {
                staticNetwork: true,
            });
        }
        const loyaltyTokenAddress = this.configService.get('LOYALTY_TOKEN_ADDRESS');
        const rewardManagerAddress = this.configService.get('REWARD_MANAGER_ADDRESS');
        const redemptionRouterAddress = this.configService.get('REDEMPTION_ROUTER_ADDRESS');
        const swapRouterAddress = this.configService.get('SWAP_ROUTER_ADDRESS');
        if (loyaltyTokenAddress) {
            this.loyaltyTokenContract = new ethers_1.ethers.Contract(loyaltyTokenAddress, LOYALTY_TOKEN_ABI, this.provider);
        }
        if (rewardManagerAddress) {
            this.rewardManagerContract = new ethers_1.ethers.Contract(rewardManagerAddress, REWARD_MANAGER_ABI, this.provider);
        }
        if (redemptionRouterAddress) {
            this.redemptionRouterContract = new ethers_1.ethers.Contract(redemptionRouterAddress, REDEMPTION_ROUTER_ABI, this.provider);
        }
        if (swapRouterAddress) {
            this.swapRouterContract = new ethers_1.ethers.Contract(swapRouterAddress, SWAP_ROUTER_ABI, this.provider);
        }
    }
    async getLoyaltyTokenBalance(address) {
        try {
            const balance = await this.loyaltyTokenContract.balanceOf(address);
            return ethers_1.ethers.formatEther(balance);
        }
        catch (error) {
            this.logger.error(`Error getting loyalty token balance: ${error.message}`);
            return '0';
        }
    }
    async getTotalSupply() {
        try {
            const totalSupply = await this.loyaltyTokenContract.totalSupply();
            return ethers_1.ethers.formatEther(totalSupply);
        }
        catch (error) {
            this.logger.error(`Error getting total supply: ${error.message}`);
            return '0';
        }
    }
    async getBackingRatio() {
        try {
            const ratio = await this.loyaltyTokenContract.getBackingRatio();
            return ethers_1.ethers.formatEther(ratio);
        }
        catch (error) {
            this.logger.error(`Error getting backing ratio: ${error.message}`);
            return '0';
        }
    }
    async isApprovedMerchant(address) {
        try {
            return await this.rewardManagerContract.isApprovedMerchant(address);
        }
        catch (error) {
            this.logger.error(`Error checking merchant approval: ${error.message}`);
            return false;
        }
    }
    async getMerchantQuota(address) {
        try {
            const quota = await this.rewardManagerContract.merchantQuota(address);
            return ethers_1.ethers.formatEther(quota);
        }
        catch (error) {
            this.logger.error(`Error getting merchant quota: ${error.message}`);
            return '0';
        }
    }
    async rewardUser(merchantWallet, userWallet, amount) {
        try {
            if (!this.rewardManagerContract) {
                this.logger.warn('Reward manager contract not configured');
                return false;
            }
            this.logger.warn('Signer not configured for blockchain operations');
            return false;
        }
        catch (error) {
            this.logger.error(`Error rewarding user: ${error.message}`);
            return false;
        }
    }
    async redeemPoint(userWallet, amount) {
        try {
            if (!this.redemptionRouterContract) {
                this.logger.warn('Redemption router contract not configured');
                return false;
            }
            this.logger.warn('Signer not configured for blockchain operations');
            return false;
        }
        catch (error) {
            this.logger.error(`Error redeeming points: ${error.message}`);
            return false;
        }
    }
    async manualRedeem(userWallet, amount, item, merchantWallet) {
        try {
            if (!this.redemptionRouterContract) {
                this.logger.warn('Redemption router contract not configured');
                return false;
            }
            this.logger.warn('Signer not configured for blockchain operations');
            return false;
        }
        catch (error) {
            this.logger.error(`Error manual redemption: ${error.message}`);
            return false;
        }
    }
    async getExchangeRate(tokenAddress) {
        try {
            const rate = await this.swapRouterContract.getExchangeRate(tokenAddress);
            return ethers_1.ethers.formatEther(rate);
        }
        catch (error) {
            this.logger.error(`Error getting exchange rate: ${error.message}`);
            return '0';
        }
    }
    async swapPLTForToken(tokenAddress, pltAmount) {
        try {
            if (!this.swapRouterContract) {
                this.logger.warn('Swap router contract not configured');
                return false;
            }
            this.logger.warn('Signer not configured for blockchain operations');
            return false;
        }
        catch (error) {
            this.logger.error(`Error swapping PLT for token: ${error.message}`);
            return false;
        }
    }
    async swapTokenForPLT(tokenAddress, tokenAmount) {
        try {
            if (!this.swapRouterContract) {
                this.logger.warn('Swap router contract not configured');
                return false;
            }
            this.logger.warn('Signer not configured for blockchain operations');
            return false;
        }
        catch (error) {
            this.logger.error(`Error swapping token for PLT: ${error.message}`);
            return false;
        }
    }
    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            return {
                chainId: Number(network.chainId),
                networkName: network.name,
            };
        }
        catch (error) {
            this.logger.error(`Error getting network info: ${error.message}`);
            return { chainId: 0, networkName: 'Unknown' };
        }
    }
    async validateWalletSignature(message, signature, expectedAddress) {
        try {
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
        }
        catch (error) {
            this.logger.error(`Error validating wallet signature: ${error.message}`);
            return false;
        }
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map