export declare class RedeemRewardDto {
    rewardId: string;
}
export declare class VerifyClaimCodeDto {
    claimCode: string;
}
export declare class ConfirmClaimDto {
    redemptionId: string;
}
export declare class CompleteRedemptionDto {
    rewardId: string;
    walletAddress: string;
    transactionHash: string;
}
export declare class RedemptionResponseDto {
    id: string;
    status: string;
    claimCode: string;
    redeemedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    rewardId: string;
    rewardTitle: string;
    merchantId: string;
    merchantName: string;
    redeemedPoints: number;
}
