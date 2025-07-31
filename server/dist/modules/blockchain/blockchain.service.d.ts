import { ConfigService } from '@nestjs/config';
export declare class BlockchainService {
    private configService;
    private readonly logger;
    private provider;
    private loyaltyTokenContract;
    private rewardManagerContract;
    private redemptionRouterContract;
    private swapRouterContract;
    constructor(configService: ConfigService);
    private initializeProvider;
    getLoyaltyTokenBalance(address: string): Promise<string>;
    getTotalSupply(): Promise<string>;
    getBackingRatio(): Promise<string>;
    isApprovedMerchant(address: string): Promise<boolean>;
    getMerchantQuota(address: string): Promise<string>;
    rewardUser(merchantWallet: string, userWallet: string, amount: string): Promise<boolean>;
    redeemPoint(userWallet: string, amount: string): Promise<boolean>;
    manualRedeem(userWallet: string, amount: string, item: string, merchantWallet: string): Promise<boolean>;
    getExchangeRate(tokenAddress: string): Promise<string>;
    swapPLTForToken(tokenAddress: string, pltAmount: string): Promise<boolean>;
    swapTokenForPLT(tokenAddress: string, tokenAmount: string): Promise<boolean>;
    getNetworkInfo(): Promise<{
        chainId: number;
        networkName: string;
    }>;
    validateWalletSignature(message: string, signature: string, expectedAddress: string): Promise<boolean>;
}
