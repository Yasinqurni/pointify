import { RedemptionsService } from './redemptions.service';
import { RedeemRewardDto, VerifyClaimCodeDto, ConfirmClaimDto, CompleteRedemptionDto, RedemptionResponseDto } from '../../dto/redemption.dto';
export declare class RedemptionsController {
    private redemptionsService;
    constructor(redemptionsService: RedemptionsService);
    redeemReward(req: any, redeemRewardDto: RedeemRewardDto): Promise<RedemptionResponseDto>;
    verifyClaimCode(req: any, verifyClaimCodeDto: VerifyClaimCodeDto): Promise<RedemptionResponseDto>;
    verifyClaimCodeByPath(req: any, claimCode: string): Promise<RedemptionResponseDto | null>;
    confirmClaim(req: any, confirmClaimDto: ConfirmClaimDto): Promise<RedemptionResponseDto>;
    confirmClaimById(req: any, id: string): Promise<void>;
    completeRedemption(completeRedemptionDto: CompleteRedemptionDto): Promise<RedemptionResponseDto>;
    getUserRedemptions(req: any): Promise<RedemptionResponseDto[]>;
    getUserRedemptionsById(userId: string): Promise<RedemptionResponseDto[]>;
    getMerchantRedemptions(req: any): Promise<RedemptionResponseDto[]>;
    getMerchantRedemptionsByAddress(merchantAddress: string): Promise<RedemptionResponseDto[]>;
}
