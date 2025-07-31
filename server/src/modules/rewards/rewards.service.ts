import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateRewardDto,
  UpdateRewardDto,
  RewardResponseDto,
} from '../../dto/reward.dto';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

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
}
