import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import {
  CreateRewardDto,
  UpdateRewardDto,
  RewardResponseDto,
} from '../../dto/reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async createReward(
    merchantId: string,
    createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    const reward = await this.prisma.reward.create({
      data: {
        ...createRewardDto,
        merchantId,
        expiryDate: new Date(createRewardDto.expiryDate),
      },
      include: {
        merchant: true,
      },
    });

    return {
      ...reward,
      imageUrl: reward.imageUrl || undefined,
      merchantName: reward.merchant.name,
      merchantLogoUrl: reward.merchant.logoUrl || undefined,
    };
  }

  async getMerchantRewards(merchantId: string): Promise<RewardResponseDto[]> {
    const rewards = await this.prisma.reward.findMany({
      where: { merchantId },
      include: {
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return rewards.map((reward) => ({
      ...reward,
      imageUrl: reward.imageUrl || undefined,
      merchantName: reward.merchant.name,
      merchantLogoUrl: reward.merchant.logoUrl || undefined,
    }));
  }

  async getMerchantRewardsByWalletAddress(walletAddress: string): Promise<RewardResponseDto[]> {
    // First find the merchant by wallet address
    const merchant = await this.prisma.merchant.findUnique({
      where: { walletAddress },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Then get their rewards
    const rewards = await this.prisma.reward.findMany({
      where: { merchantId: merchant.id },
      include: {
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return rewards.map((reward) => ({
      ...reward,
      imageUrl: reward.imageUrl || undefined,
      merchantName: reward.merchant.name,
      merchantLogoUrl: reward.merchant.logoUrl || undefined,
    }));
  }

  async getAllRewards(): Promise<RewardResponseDto[]> {
    const rewards = await this.prisma.reward.findMany({
      where: { isActive: true },
      include: {
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return rewards.map((reward) => ({
      ...reward,
      imageUrl: reward.imageUrl || undefined,
      merchantName: reward.merchant.name,
      merchantLogoUrl: reward.merchant.logoUrl || undefined,
    }));
  }

  async getRewardById(rewardId: string): Promise<RewardResponseDto> {
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
      include: {
        merchant: true,
      },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    return {
      ...reward,
      imageUrl: reward.imageUrl || undefined,
      merchantName: reward.merchant.name,
      merchantLogoUrl: reward.merchant.logoUrl || undefined,
    };
  }

  async updateReward(
    merchantId: string,
    rewardId: string,
    updateRewardDto: UpdateRewardDto,
  ): Promise<RewardResponseDto> {
    // Check if reward belongs to merchant
    const existingReward = await this.prisma.reward.findFirst({
      where: { id: rewardId, merchantId },
    });

    if (!existingReward) {
      throw new NotFoundException('Reward not found');
    }

    const updateData: any = { ...updateRewardDto };
    if (updateRewardDto.expiryDate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.expiryDate = new Date(updateRewardDto.expiryDate);
    }

    const reward = await this.prisma.reward.update({
      where: { id: rewardId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: updateData,
      include: {
        merchant: true,
      },
    });

    return {
      ...reward,
      imageUrl: reward.imageUrl || undefined,
      merchantName: reward.merchant.name,
      merchantLogoUrl: reward.merchant.logoUrl || undefined,
    };
  }

  async deleteReward(merchantId: string, rewardId: string): Promise<void> {
    // Check if reward belongs to merchant
    const existingReward = await this.prisma.reward.findFirst({
      where: { id: rewardId, merchantId },
    });

    if (!existingReward) {
      throw new NotFoundException('Reward not found');
    }

    await this.prisma.reward.delete({
      where: { id: rewardId },
    });
  }

  async toggleRewardActive(
    merchantId: string,
    rewardId: string,
  ): Promise<RewardResponseDto> {
    // Check if reward belongs to merchant
    const existingReward = await this.prisma.reward.findFirst({
      where: { id: rewardId, merchantId },
    });

    if (!existingReward) {
      throw new NotFoundException('Reward not found');
    }

    const reward = await this.prisma.reward.update({
      where: { id: rewardId },
      data: { isActive: !existingReward.isActive },
      include: {
        merchant: true,
      },
    });

    return {
      ...reward,
      imageUrl: reward.imageUrl || undefined,
      merchantName: reward.merchant.name,
      merchantLogoUrl: reward.merchant.logoUrl || undefined,
    };
  }

  async getMerchantData(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        rewards: true,
      },
    });

    if (!merchant) {
      return {
        name: "Unknown Merchant",
        address: "",
        loyaltyProgram: "",
        rewards: [],
      };
    }

    return {
      name: merchant.name,
      address: merchant.walletAddress || "",
      loyaltyProgram: merchant.description || "Earn points with every purchase",
      rewards: merchant.rewards.map(reward => ({
        id: reward.id,
        name: reward.title,
        points: reward.requiredPoints,
      })),
    };
  }

  async getMerchantDashboardData(merchantId: string) {
    const customerCount = await this.prisma.user.count({
      where: {
        redemptions: {
          some: {
            merchantId,
          },
        },
      },
    });

    return {
      totalCustomers: customerCount,
    };
  }

  async getMerchantLoyaltyProgram(merchantAddress: string) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { walletAddress: merchantAddress },
    });

    if (!merchant) {
      return {
        loyalCustomers: [],
        totalLoyaltyPoints: 0,
      };
    }

    const loyalCustomers = await this.prisma.user.findMany({
      where: {
        redemptions: {
          some: {
            merchantId: merchant.id,
          },
        },
      },
      select: {
        id: true,
        walletAddress: true,
        // loyaltyPoints removed - using blockchain balance
      },
    });

    // Calculate total points from blockchain balances
    const totalLoyaltyPoints = await Promise.all(
      loyalCustomers.map(customer => 
        this.blockchainService.getLoyaltyTokenBalance(customer.walletAddress)
      )
    ).then(balances => 
      balances.reduce((sum, balance) => sum + parseFloat(balance), 0)
    );

    return {
      loyalCustomers: loyalCustomers.map(customer => ({
        address: customer.walletAddress,
        name: `User ${customer.id.slice(0, 8)}`,
        points: 0, // Will be calculated from blockchain
      })),
      totalLoyaltyPoints,
    };
  }

  async getUserRewards(userAddress: string) {
    const user = await this.prisma.user.findFirst({
      where: { walletAddress: userAddress },
      include: {
        redemptions: {
          include: {
            reward: {
              include: {
                merchant: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return [];
    }

    return user.redemptions.map(redemption => ({
      id: redemption.id,
      merchantName: redemption.reward.merchant.name,
      rewardName: redemption.reward.title,
      pointsCost: redemption.reward.requiredPoints,
      dateRedeemed: redemption.redeemedAt?.toISOString().split('T')[0] || redemption.createdAt.toISOString().split('T')[0],
    }));
  }
}
