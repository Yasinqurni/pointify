import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import {
  RedeemRewardDto,
  VerifyClaimCodeDto,
  ConfirmClaimDto,
  RedemptionResponseDto,
} from '../../dto/redemption.dto';
import { ethers } from 'ethers';

@Injectable()
export class RedemptionsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async redeemReward(
    userId: string,
    redeemRewardDto: RedeemRewardDto,
  ): Promise<RedemptionResponseDto> {
    const { rewardId } = redeemRewardDto;

    // Get reward details
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
      include: { merchant: true },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (!reward.isActive) {
      throw new BadRequestException('Reward is not active');
    }

    if (new Date() > reward.expiryDate) {
      throw new BadRequestException('Reward has expired');
    }

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check balance on blockchain instead of database
    const blockchainBalance = await this.blockchainService.getLoyaltyTokenBalance(user.walletAddress);
    if (parseFloat(blockchainBalance) < reward.requiredPoints) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    // Generate unique claim code
    const claimCode = ethers
      .id(Date.now().toString() + userId + rewardId)
      .slice(0, 8)
      .toUpperCase();

    // Create redemption record
    const redemption = await this.prisma.redemption.create({
      data: {
        userId,
        rewardId,
        merchantId: reward.merchantId,
        claimCode,
        status: 'PENDING',
      },
      include: {
        reward: true,
        merchant: true,
        user: true,
      },
    });

    // Points are deducted on blockchain, not in database
    // The blockchain transaction handles the balance update

    // Create point transaction record
    await this.prisma.pointTransaction.create({
      data: {
        userId,
        merchantId: reward.merchantId,
        redemptionId: redemption.id,
        amount: -reward.requiredPoints,
        type: 'SPENT',
      },
    });

    return {
      id: redemption.id,
      status: redemption.status,
      claimCode: redemption.claimCode,
      redeemedAt: redemption.redeemedAt || undefined,
      createdAt: redemption.createdAt,
      updatedAt: redemption.updatedAt,
      userId: redemption.userId,
      rewardId: redemption.rewardId,
      rewardTitle: redemption.reward.title,
      merchantId: redemption.merchantId,
      merchantName: redemption.merchant.name,
      redeemedPoints: reward.requiredPoints,
    };
  }

  async verifyClaimCode(
    verifyClaimCodeDto: VerifyClaimCodeDto,
  ): Promise<RedemptionResponseDto> {
    const { claimCode } = verifyClaimCodeDto;

    const redemption = await this.prisma.redemption.findUnique({
      where: { claimCode },
      include: {
        reward: true,
        merchant: true,
        user: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Invalid claim code');
    }

    if (redemption.status !== 'PENDING') {
      throw new BadRequestException('Redemption has already been processed');
    }

    return {
      id: redemption.id,
      status: redemption.status,
      claimCode: redemption.claimCode,
      redeemedAt: redemption.redeemedAt || undefined,
      createdAt: redemption.createdAt,
      updatedAt: redemption.updatedAt,
      userId: redemption.userId,
      rewardId: redemption.rewardId,
      rewardTitle: redemption.reward.title,
      merchantId: redemption.merchantId,
      merchantName: redemption.merchant.name,
      redeemedPoints: redemption.reward.requiredPoints,
    };
  }

  async confirmClaim(
    merchantId: string,
    confirmClaimDto: ConfirmClaimDto,
  ): Promise<RedemptionResponseDto> {
    const { redemptionId } = confirmClaimDto;

    const redemption = await this.prisma.redemption.findFirst({
      where: { id: redemptionId, merchantId },
      include: {
        reward: true,
        merchant: true,
        user: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    if (redemption.status !== 'PENDING') {
      throw new BadRequestException('Redemption has already been processed');
    }

    // Update redemption status
    const updatedRedemption = await this.prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: 'CLAIMED',
        redeemedAt: new Date(),
      },
      include: {
        reward: true,
        merchant: true,
        user: true,
      },
    });

    return {
      id: updatedRedemption.id,
      status: updatedRedemption.status,
      claimCode: updatedRedemption.claimCode,
      redeemedAt: updatedRedemption.redeemedAt || undefined,
      createdAt: updatedRedemption.createdAt,
      updatedAt: updatedRedemption.updatedAt,
      userId: updatedRedemption.userId,
      rewardId: updatedRedemption.rewardId,
      rewardTitle: updatedRedemption.reward.title,
      merchantId: updatedRedemption.merchantId,
      merchantName: updatedRedemption.merchant.name,
      redeemedPoints: updatedRedemption.reward.requiredPoints,
    };
  }

  async confirmClaimById(
    merchantId: string,
    redemptionId: string,
  ): Promise<void> {
    const redemption = await this.prisma.redemption.findFirst({
      where: { id: redemptionId, merchantId },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    if (redemption.status !== 'PENDING') {
      throw new BadRequestException('Redemption has already been processed');
    }

    // Update redemption status
    await this.prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: 'CLAIMED',
        redeemedAt: new Date(),
      },
    });
  }

  async getUserRedemptions(userId: string): Promise<RedemptionResponseDto[]> {
    const redemptions = await this.prisma.redemption.findMany({
      where: { userId },
      include: {
        reward: true,
        merchant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return redemptions.map((redemption) => ({
      id: redemption.id,
      status: redemption.status,
      claimCode: redemption.claimCode,
      redeemedAt: redemption.redeemedAt || undefined,
      createdAt: redemption.createdAt,
      updatedAt: redemption.updatedAt,
      userId: redemption.userId,
      rewardId: redemption.rewardId,
      rewardTitle: redemption.reward.title,
      merchantId: redemption.merchantId,
      merchantName: redemption.merchant.name,
      redeemedPoints: redemption.reward.requiredPoints,
    }));
  }

  async getMerchantRedemptions(
    merchantId: string,
  ): Promise<RedemptionResponseDto[]> {
    const redemptions = await this.prisma.redemption.findMany({
      where: { merchantId },
      include: {
        reward: true,
        merchant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return redemptions.map((redemption) => ({
      id: redemption.id,
      status: redemption.status,
      claimCode: redemption.claimCode,
      redeemedAt: redemption.redeemedAt || undefined,
      createdAt: redemption.createdAt,
      updatedAt: redemption.updatedAt,
      userId: redemption.userId,
      rewardId: redemption.rewardId,
      rewardTitle: redemption.reward.title,
      merchantId: redemption.merchantId,
      merchantName: redemption.merchant.name,
      redeemedPoints: redemption.reward.requiredPoints,
    }));
  }
}
