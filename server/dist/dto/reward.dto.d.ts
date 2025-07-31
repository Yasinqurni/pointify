export declare class CreateRewardDto {
    title: string;
    description: string;
    imageUrl?: string;
    requiredPoints: number;
    expiryDate: string;
    isActive?: boolean;
}
export declare class UpdateRewardDto {
    title?: string;
    description?: string;
    imageUrl?: string;
    requiredPoints?: number;
    expiryDate?: string;
    isActive?: boolean;
}
export declare class RewardResponseDto {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    requiredPoints: number;
    expiryDate: Date;
    isActive: boolean;
    merchantId: string;
    merchantName: string;
    merchantLogoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
