export declare class UpdateLoyaltySettingsDto {
    pointsPerDollar?: number;
    pointsPerRupiah?: number;
    autoCalculate?: boolean;
    minimumPurchase?: number;
    defaultRewardPoints?: number;
    expirationDays?: number;
    allowNegativeBalance?: boolean;
}
export declare class LoyaltySettingsResponseDto {
    id: string;
    pointsPerDollar: number;
    pointsPerRupiah: number;
    autoCalculate: boolean;
    minimumPurchase: number;
    defaultRewardPoints: number;
    expirationDays: number;
    allowNegativeBalance: boolean;
    merchantId: string;
    createdAt: Date;
    updatedAt: Date;
}
