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
let PointsService = class PointsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                loyaltyPoints: user.loyaltyPoints + points,
            },
        });
        const transaction = await this.prisma.pointTransaction.create({
            data: {
                userId: user.id,
                merchantId,
                amount: points,
                type: 'RECEIVED',
            },
        });
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
    async getUserBalance(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
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
            loyaltyPoints: user.loyaltyPoints,
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
        return {
            walletAddress: merchant.walletAddress,
            idrxBalance: merchant.idrxBalance,
            loyalBalance: merchant.loyalBalance,
            totalRewarded: merchant.totalRewarded,
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
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PointsService);
//# sourceMappingURL=points.service.js.map