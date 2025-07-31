import { PrismaService } from '../../common/prisma.service';
import { RedeemRewardDto, VerifyClaimCodeDto, ConfirmClaimDto, RedemptionResponseDto } from '../../dto/redemption.dto';
export declare class RedemptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    redeemReward(userId: string, redeemRewardDto: RedeemRewardDto): Promise<RedemptionResponseDto>;
    verifyClaimCode(verifyClaimCodeDto: VerifyClaimCodeDto): Promise<RedemptionResponseDto>;
    confirmClaim(merchantId: string, confirmClaimDto: ConfirmClaimDto): Promise<RedemptionResponseDto>;
    getUserRedemptions(userId: string): Promise<RedemptionResponseDto[]>;
    getMerchantRedemptions(merchantId: string): Promise<RedemptionResponseDto[]>;
}
