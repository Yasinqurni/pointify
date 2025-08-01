import { PrismaService } from '../../common/prisma.service';
import { UpdateLoyaltySettingsDto, LoyaltySettingsResponseDto } from '../../dto/loyalty-settings.dto';
export declare class LoyaltySettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getLoyaltySettings(merchantId: string): Promise<LoyaltySettingsResponseDto>;
    updateLoyaltySettings(merchantId: string, updateDto: UpdateLoyaltySettingsDto): Promise<LoyaltySettingsResponseDto>;
    calculatePointsFromPurchase(merchantId: string, purchaseAmount: number, currency?: 'USD' | 'IDR'): Promise<number>;
    getDefaultRewardPoints(merchantId: string): Promise<number>;
    canUserRedeemPoints(merchantId: string, userCurrentBalance: number, pointsToRedeem: number): Promise<boolean>;
}
