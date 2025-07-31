export declare class IssuePointsDto {
    userWalletAddress: string;
    points: number;
}
export declare class PointsTransactionResponseDto {
    id: string;
    amount: number;
    type: string;
    createdAt: Date;
    userId: string;
    merchantId?: string;
    redemptionId?: string;
}
export declare class UserBalanceResponseDto {
    walletAddress: string;
    loyaltyPoints: number;
    totalReceived: number;
    totalSpent: number;
}
export declare class MerchantBalanceResponseDto {
    walletAddress: string;
    idrxBalance: number;
    loyalBalance: number;
    totalRewarded: number;
}
