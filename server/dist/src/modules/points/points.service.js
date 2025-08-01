"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
let PointsService = class PointsService {
    prisma;
    blockchainService;
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
    }
    async issuePoints(merchantId, issuePointsDto) {
        const { userWalletAddress, points } = issuePointsDto;
        if (points <= 0) {
            throw new common_1.BadRequestException('Points must be positive');
        }
        const user = await this.prisma.user.findUnique({
            where: { walletAddress: userWalletAddress },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const success = await this.blockchainService.rewardUser(merchant.walletAddress, userWalletAddress, points.toString());
        if (!success) {
            throw new common_1.BadRequestException('Failed to issue points on blockchain');
        }
        const transaction = await this.prisma.pointTransaction.create({
            data: {
                userId: user.id,
                merchantId,
                amount: points,
                type: 'RECEIVED',
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
    async getUserBalance(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const blockchainBalance = await this.blockchainService.getLoyaltyTokenBalance(user.walletAddress);
        const transactions = await this.prisma.pointTransaction.findMany({
            where: { userId },
        });
        const totalReceived = transactions
            .filter((t) => t.type === 'RECEIVED')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = Math.abs(transactions
            .filter((t) => t.type === 'SPENT')
            .reduce((sum, t) => sum + t.amount, 0));
        return {
            walletAddress: user.walletAddress,
            loyaltyPoints: parseFloat(blockchainBalance),
            totalReceived,
            totalSpent,
        };
    }
    async getMerchantBalance(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const idrxBalance = await this.blockchainService.getLoyaltyTokenBalance(merchant.walletAddress);
        const loyalBalance = await this.blockchainService.getLoyaltyTokenBalance(merchant.walletAddress);
        return {
            walletAddress: merchant.walletAddress,
            idrxBalance: parseFloat(idrxBalance),
            loyalBalance: parseFloat(loyalBalance),
            totalRewarded: 0,
        };
    }
    async getUserTransactions(userId) {
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
    async getMerchantTransactions(merchantId) {
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
    async getUserPointReceptionLogs(userId) {
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
            transactionHash: `0x${transaction.id.slice(0, 8)}`,
        }));
    }
    async getUserLoyaltyDetails(userAddress, merchantAddress) {
        const user = await this.prisma.user.findFirst({
            where: { walletAddress: userAddress },
        });
        const merchant = await this.prisma.merchant.findFirst({
            where: { walletAddress: merchantAddress },
        });
        if (!user || !merchant) {
            return null;
        }
        const blockchainBalance = await this.blockchainService.getLoyaltyTokenBalance(userAddress);
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
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], PointsService);
//# sourceMappingURL=points.service.js.map