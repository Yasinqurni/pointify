import { RewardsService } from './rewards.service';
import { CreateRewardDto, UpdateRewardDto, RewardResponseDto } from '../../dto/reward.dto';
export declare class RewardsController {
    private rewardsService;
    constructor(rewardsService: RewardsService);
    getAllRewards(): Promise<RewardResponseDto[]>;
    getMerchantRewards(req: any): Promise<RewardResponseDto[]>;
    getRewardById(id: string): Promise<RewardResponseDto>;
    createReward(req: any, createRewardDto: CreateRewardDto): Promise<RewardResponseDto>;
    updateReward(req: any, id: string, updateRewardDto: UpdateRewardDto): Promise<RewardResponseDto>;
    deleteReward(req: any, id: string): Promise<void>;
    toggleRewardActive(req: any, id: string): Promise<RewardResponseDto>;
}
