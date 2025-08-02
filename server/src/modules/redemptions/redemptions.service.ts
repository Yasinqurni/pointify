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
    walletAddress?: string, // Add walletAddress parameter
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

    // Get user details, create if doesn't exist (auto-registration for authenticated users)
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user && walletAddress) {
      // Try to find user by wallet address first
      user = await this.prisma.user.findUnique({
        where: { walletAddress: walletAddress },
      });
      
      if (!user) {
        // User has valid JWT but no database record - auto-create them
        try {
          user = await this.prisma.user.create({
            data: {
              walletAddress: walletAddress,
              email: null,
              username: null,
            },
          });
        } catch (error) {
          console.error(`Failed to auto-create user: ${error.message}`);
          throw new NotFoundException('User not found and could not be created');
        }
      }
    } else if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has a pending redemption for this reward (prevent duplicate pending claims)
    const pendingRedemption = await this.prisma.redemption.findFirst({
      where: {
        userId: user.id,
        rewardId: rewardId,
        status: 'PENDING', // Only prevent pending duplicates, allow new redemptions after completion
      },
    });

    if (pendingRedemption) {
      throw new BadRequestException(`You already have a pending redemption for this reward. Please use your existing claim code: ${pendingRedemption.claimCode}`);
    }

    // Check balance on blockchain instead of database
    let userBalance: number;
    try {
      const blockchainBalance = await this.blockchainService.getLoyaltyTokenBalance(user.walletAddress);
      userBalance = parseFloat(blockchainBalance);
    } catch (error) {
      // Fallback to mock balance for development
      console.log('Blockchain balance check failed, using mock balance');
      userBalance = 100; // Mock balance for development
    }
    
    if (userBalance < reward.requiredPoints) {
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
        userId: user.id, // Use the actual user ID (not the JWT userId)
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

    // NOTE: Points are NOT deducted yet - this happens when merchant confirms claim
    // This creates an "intention to redeem" that can be verified later

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
    merchantId: string,
    verifyClaimCodeDto: VerifyClaimCodeDto,
  ): Promise<RedemptionResponseDto> {
    const { claimCode } = verifyClaimCodeDto;

    const redemption = await this.prisma.redemption.findFirst({
      where: { 
        claimCode,
        merchantId // 🔒 SECURITY: Only allow merchant to verify their own codes
      },
      include: {
        reward: true,
        merchant: true,
        user: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Invalid claim code or code does not belong to your store');
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

    // NOW deduct points from blockchain and update redemption status
    try {
      // Call smart contract to deduct points
      await this.blockchainService.redeemLoyaltyPoints(
        redemption.user.walletAddress,
        redemption.reward.requiredPoints
      );

      // Create point transaction record AFTER successful blockchain transaction
      await this.prisma.pointTransaction.create({
        data: {
          userId: redemption.userId,
          merchantId: redemption.merchantId,
          redemptionId: redemption.id,
          amount: -redemption.reward.requiredPoints,
          type: 'SPENT',
        },
      });

      // Update redemption status to CLAIMED
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
     } catch (error) {
       // If blockchain transaction fails, mark redemption as failed
       await this.prisma.redemption.update({
         where: { id: redemptionId },
         data: {
           status: 'CANCELLED',
         },
       });
       throw new BadRequestException('Failed to deduct points from blockchain');
     }
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
