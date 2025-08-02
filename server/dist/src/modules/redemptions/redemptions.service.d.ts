import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RedeemRewardDto, VerifyClaimCodeDto, ConfirmClaimDto, CompleteRedemptionDto, RedemptionResponseDto } from '../../dto/redemption.dto';
export declare class RedemptionsService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    redeemReward(userId: string, redeemRewardDto: RedeemRewardDto, walletAddress?: string): Promise<RedemptionResponseDto>;
    verifyClaimCode(merchantId: string, verifyClaimCodeDto: VerifyClaimCodeDto): Promise<RedemptionResponseDto>;
    confirmClaim(merchantId: string, confirmClaimDto: ConfirmClaimDto): Promise<RedemptionResponseDto>;
    confirmClaimById(merchantId: string, redemptionId: string): Promise<void>;
    completeRedemption(completeRedemptionDto: CompleteRedemptionDto): Promise<RedemptionResponseDto>;
    getUserRedemptions(userId: string): Promise<RedemptionResponseDto[]>;
    getMerchantRedemptions(merchantId: string): Promise<RedemptionResponseDto[]>;
}
