import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import {
  IssuePointsDto,
  PointsTransactionResponseDto,
  UserBalanceResponseDto,
  MerchantBalanceResponseDto,
} from '../../dto/points.dto';

@Injectable()
export class PointsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async issuePoints(
    merchantId: string,
    issuePointsDto: IssuePointsDto,
  ): Promise<PointsTransactionResponseDto> {
    const { userWalletAddress, points } = issuePointsDto;

    if (points <= 0) {
      throw new BadRequestException('Points must be positive');
    }

    // Find user by wallet address, create if doesn't exist
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: userWalletAddress },
    });

    if (!user) {
      // Auto-create user record for points issuance
      try {
        user = await this.prisma.user.create({
          data: {
            walletAddress: userWalletAddress,
            email: null,
            username: null,
          },
        });
      } catch (error) {
        console.error(`Failed to auto-create user: ${error.message}`);
        throw new NotFoundException('User not found and could not be created');
      }
    }

    // Get merchant details
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Issue points on blockchain
    const success = await this.blockchainService.rewardUser(
      merchant.walletAddress,
      userWalletAddress,
      points.toString(),
    );

    if (!success) {
      throw new BadRequestException('Failed to issue points on blockchain');
    }

    // Create point transaction record
    const transaction = await this.prisma.pointTransaction.create({
      data: {
        userId: user.id,
        merchantId,
        amount: points,
        type: 'RECEIVED',
      },
    });

    // Total rewarded is tracked on blockchain, not in database

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

  async getUserBalance(userId: string, walletAddress?: string): Promise<UserBalanceResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user && walletAddress) {
      // Auto-create user record if we have wallet address
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
    } else if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get balance from blockchain
    const blockchainBalance = await this.blockchainService.getLoyaltyTokenBalance(
      user.walletAddress,
    );

    // Calculate total received and spent from database transactions
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
      loyaltyPoints: parseFloat(blockchainBalance),
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

    // Get balances from blockchain
    const idrxBalance = await this.blockchainService.getLoyaltyTokenBalance(merchant.walletAddress);
    const loyalBalance = await this.blockchainService.getLoyaltyTokenBalance(merchant.walletAddress);
    
    // For now, we'll use the same balance for both since we need to implement separate token contracts
    // In a real implementation, you'd have separate contracts for IDRX and LOYAL tokens

    return {
      walletAddress: merchant.walletAddress,
      idrxBalance: parseFloat(idrxBalance),
      loyalBalance: parseFloat(loyalBalance),
      totalRewarded: 0, // This would be calculated from blockchain events
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

  async getUserPointReceptionLogs(userId: string) {
    const transactions = await this.prisma.pointTransaction.findMany({
      where: { 
        userId,
        type: 'RECEIVED',
      },
      include: {
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      userId: transaction.userId,
      merchantName: transaction.merchant?.name || 'Unknown Merchant',
      pointsReceived: transaction.amount,
      receivedDate: transaction.createdAt.toISOString().slice(0, 19).replace('T', ' '),
      transactionHash: `0x${transaction.id.slice(0, 8)}`, // Mock transaction hash
    }));
  }

  async getUserLoyaltyDetails(userAddress: string, merchantAddress: string) {
    const user = await this.prisma.user.findFirst({
      where: { walletAddress: userAddress },
    });

    const merchant = await this.prisma.merchant.findFirst({
      where: { walletAddress: merchantAddress },
    });

    if (!user || !merchant) {
      return null;
    }

    // Get user's total balance from blockchain
    const blockchainBalance = await this.blockchainService.getLoyaltyTokenBalance(
      userAddress,
    );

    // Get merchant's rewards
    const rewards = await this.prisma.reward.findMany({
      where: { merchantId: merchant.id, isActive: true },
    });

    return {
      merchantName: merchant.name,
      userPoints: parseFloat(blockchainBalance),
      rewards: rewards.map(reward => ({
        id: reward.id,
        name: reward.title,
        pointsRequired: reward.requiredPoints,
        description: reward.description,
        imageUrl: reward.imageUrl || '/placeholder.svg?height=100&width=100',
      })),
    };
  }
}
