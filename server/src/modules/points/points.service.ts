import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  IssuePointsDto,
  PointsTransactionResponseDto,
  UserBalanceResponseDto,
  MerchantBalanceResponseDto,
} from '../../dto/points.dto';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async issuePoints(
    merchantId: string,
    issuePointsDto: IssuePointsDto,
  ): Promise<PointsTransactionResponseDto> {
    const { userWalletAddress, points } = issuePointsDto;

    if (points <= 0) {
      throw new BadRequestException('Points must be positive');
    }

    // Find user by wallet address
    const user = await this.prisma.user.findUnique({
      where: { walletAddress: userWalletAddress },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get merchant details
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Update user's loyalty points
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loyaltyPoints: user.loyaltyPoints + points,
      },
    });

    // Create point transaction record
    const transaction = await this.prisma.pointTransaction.create({
      data: {
        userId: user.id,
        merchantId,
        amount: points,
        type: 'RECEIVED',
      },
    });

    // Update merchant's total rewarded
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        totalRewarded: merchant.totalRewarded + points,
      },
    });

    return {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      userId: transaction.userId,
      merchantId: transaction.merchantId || undefined,
      redemptionId: transaction.redemptionId || undefined,
    };
  }

  async getUserBalance(userId: string): Promise<UserBalanceResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate total received and spent
    const transactions = await this.prisma.pointTransaction.findMany({
      where: { userId },
    });

    const totalReceived = transactions
      .filter((t) => t.type === 'RECEIVED')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = Math.abs(
      transactions
        .filter((t) => t.type === 'SPENT')
        .reduce((sum, t) => sum + t.amount, 0),
    );

    return {
      walletAddress: user.walletAddress,
      loyaltyPoints: user.loyaltyPoints,
      totalReceived,
      totalSpent,
    };
  }

  async getMerchantBalance(
    merchantId: string,
  ): Promise<MerchantBalanceResponseDto> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      walletAddress: merchant.walletAddress,
      idrxBalance: merchant.idrxBalance,
      loyalBalance: merchant.loyalBalance,
      totalRewarded: merchant.totalRewarded,
    };
  }

  async getUserTransactions(
    userId: string,
  ): Promise<PointsTransactionResponseDto[]> {
    const transactions = await this.prisma.pointTransaction.findMany({
      where: { userId },
      include: {
        merchant: true,
        redemption: {
          include: {
            reward: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      userId: transaction.userId,
      merchantId: transaction.merchantId || undefined,
      redemptionId: transaction.redemptionId || undefined,
    }));
  }

  async getMerchantTransactions(
    merchantId: string,
  ): Promise<PointsTransactionResponseDto[]> {
    const transactions = await this.prisma.pointTransaction.findMany({
      where: { merchantId },
      include: {
        user: true,
        redemption: {
          include: {
            reward: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      userId: transaction.userId,
      merchantId: transaction.merchantId || undefined,
      redemptionId: transaction.redemptionId || undefined,
    }));
  }
}
