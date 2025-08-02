import { BlockchainService } from './blockchain.service';
export declare class BlockchainController {
    private blockchainService;
    constructor(blockchainService: BlockchainService);
    getNetworkInfo(): Promise<{
        chainId: number;
        networkName: string;
    }>;
    getTotalSupply(): Promise<{
        totalSupply: string;
    }>;
    getBackingRatio(): Promise<{
        backingRatio: string;
    }>;
    getLoyaltyTokenBalance(address: string): Promise<{
        address: string;
        balance: string;
    }>;
    getBalance(address: string): Promise<string>;
    getMerchantQuota(address: string): Promise<{
        address: string;
        quota: string;
        isApproved: boolean;
    }>;
    rewardUser(req: any, body: {
        userWallet: string;
        amount: string;
    }): Promise<{
        success: boolean;
        message: string;
        merchantWallet: any;
        userWallet: string;
        amount: string;
    } | {
        success: boolean;
        message: string;
        merchantWallet?: undefined;
        userWallet?: undefined;
        amount?: undefined;
    }>;
    redeemPoints(req: any, body: {
        amount: string;
    }): Promise<{
        success: boolean;
        message: string;
        userWallet: any;
        amount: string;
    } | {
        success: boolean;
        message: string;
        userWallet?: undefined;
        amount?: undefined;
    }>;
    manualRedeem(req: any, body: {
        userWallet: string;
        amount: string;
        item: string;
    }): Promise<{
        success: boolean;
        message: string;
        userWallet: string;
        merchantWallet: any;
        amount: string;
        item: string;
    } | {
        success: boolean;
        message: string;
        userWallet?: undefined;
        merchantWallet?: undefined;
        amount?: undefined;
        item?: undefined;
    }>;
    getExchangeRate(tokenAddress: string): Promise<{
        tokenAddress: string;
        exchangeRate: string;
    }>;
    swapPLTForToken(req: any, body: {
        tokenAddress: string;
        pltAmount: string;
    }): Promise<{
        success: boolean;
        message: string;
        userWallet: any;
        tokenAddress: string;
        pltAmount: string;
    } | {
        success: boolean;
        message: string;
        userWallet?: undefined;
        tokenAddress?: undefined;
        pltAmount?: undefined;
    }>;
    swapTokenForPLT(req: any, body: {
        tokenAddress: string;
        tokenAmount: string;
    }): Promise<{
        success: boolean;
        message: string;
        userWallet: any;
        tokenAddress: string;
        tokenAmount: string;
    } | {
        success: boolean;
        message: string;
        userWallet?: undefined;
        tokenAddress?: undefined;
        tokenAmount?: undefined;
    }>;
    validateSignature(body: {
        message: string;
        signature: string;
        expectedAddress: string;
    }): Promise<{
        isValid: boolean;
        message: string;
        expectedAddress: string;
    }>;
}
