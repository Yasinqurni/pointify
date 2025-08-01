import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateRewardDto, UpdateRewardDto, RewardResponseDto } from '../../dto/reward.dto';
export declare class RewardsService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    createReward(merchantId: string, createRewardDto: CreateRewardDto): Promise<RewardResponseDto>;
    getMerchantRewards(merchantId: string): Promise<RewardResponseDto[]>;
    getMerchantRewardsByWalletAddress(walletAddress: string): Promise<RewardResponseDto[]>;
    getAllRewards(): Promise<RewardResponseDto[]>;
    getRewardById(rewardId: string): Promise<RewardResponseDto>;
    updateReward(merchantId: string, rewardId: string, updateRewardDto: UpdateRewardDto): Promise<RewardResponseDto>;
    deleteReward(merchantId: string, rewardId: string): Promise<void>;
    toggleRewardActive(merchantId: string, rewardId: string): Promise<RewardResponseDto>;
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
}
