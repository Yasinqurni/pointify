import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RedeemRewardDto, VerifyClaimCodeDto, ConfirmClaimDto, RedemptionResponseDto } from '../../dto/redemption.dto';
export declare class RedemptionsService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    redeemReward(userId: string, redeemRewardDto: RedeemRewardDto): Promise<RedemptionResponseDto>;
    verifyClaimCode(verifyClaimCodeDto: VerifyClaimCodeDto): Promise<RedemptionResponseDto>;
    confirmClaim(merchantId: string, confirmClaimDto: ConfirmClaimDto): Promise<RedemptionResponseDto>;
    confirmClaimById(merchantId: string, redemptionId: string): Promise<void>;
    getUserRedemptions(userId: string): Promise<RedemptionResponseDto[]>;
    getMerchantRedemptions(merchantId: string): Promise<RedemptionResponseDto[]>;
}
