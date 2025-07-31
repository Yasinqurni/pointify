import { PrismaService } from '../../common/prisma.service';
import { CreateRewardDto, UpdateRewardDto, RewardResponseDto } from '../../dto/reward.dto';
export declare class RewardsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReward(merchantId: string, createRewardDto: CreateRewardDto): Promise<RewardResponseDto>;
    getMerchantRewards(merchantId: string): Promise<RewardResponseDto[]>;
    getAllRewards(): Promise<RewardResponseDto[]>;
    getRewardById(rewardId: string): Promise<RewardResponseDto>;
    updateReward(merchantId: string, rewardId: string, updateRewardDto: UpdateRewardDto): Promise<RewardResponseDto>;
    deleteReward(merchantId: string, rewardId: string): Promise<void>;
    toggleRewardActive(merchantId: string, rewardId: string): Promise<RewardResponseDto>;
}
