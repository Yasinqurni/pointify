import { RewardsService } from './rewards.service';
import { CreateRewardDto, UpdateRewardDto, RewardResponseDto } from '../../dto/reward.dto';
export declare class RewardsController {
    private rewardsService;
    constructor(rewardsService: RewardsService);
    getAllRewards(): Promise<RewardResponseDto[]>;
    getMerchantRewards(req: any): Promise<RewardResponseDto[]>;
    getMerchantRewardsByWalletAddress(walletAddress: string): Promise<RewardResponseDto[]>;
    getMerchantData(merchantId: string): Promise<{
        name: string;
        address: string;
        loyaltyProgram: string;
        rewards: {
            id: string;
            name: string;
            points: number;
        }[];
    }>;
    getMerchantDashboardData(merchantId: string): Promise<{
        totalCustomers: number;
    }>;
    getMerchantLoyaltyProgram(merchantAddress: string): Promise<{
        loyalCustomers: {
            address: string;
            name: string;
            points: number;
        }[];
        totalLoyaltyPoints: number;
    }>;
    getUserRewards(userAddress: string): Promise<{
        id: string;
        merchantName: string;
        rewardName: string;
        pointsCost: number;
        dateRedeemed: string;
    }[]>;
    getRewardById(id: string): Promise<RewardResponseDto>;
    createReward(req: any, createRewardDto: CreateRewardDto): Promise<RewardResponseDto>;
    updateReward(req: any, id: string, updateRewardDto: UpdateRewardDto): Promise<RewardResponseDto>;
    deleteReward(req: any, id: string): Promise<void>;
    toggleRewardActive(req: any, id: string): Promise<RewardResponseDto>;
}
