import { RedemptionsService } from './redemptions.service';
import { RedeemRewardDto, VerifyClaimCodeDto, ConfirmClaimDto, RedemptionResponseDto } from '../../dto/redemption.dto';
export declare class RedemptionsController {
    private redemptionsService;
    constructor(redemptionsService: RedemptionsService);
    redeemReward(req: any, redeemRewardDto: RedeemRewardDto): Promise<RedemptionResponseDto>;
    verifyClaimCode(verifyClaimCodeDto: VerifyClaimCodeDto): Promise<RedemptionResponseDto>;
    confirmClaim(req: any, confirmClaimDto: ConfirmClaimDto): Promise<RedemptionResponseDto>;
    getUserRedemptions(req: any): Promise<RedemptionResponseDto[]>;
    getMerchantRedemptions(req: any): Promise<RedemptionResponseDto[]>;
}
