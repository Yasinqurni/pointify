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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
let RewardsService = class RewardsService {
    prisma;
    blockchainService;
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
    }
    async createReward(merchantId, createRewardDto) {
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
    async getMerchantRewards(merchantId) {
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
    async getAllRewards() {
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
    async getRewardById(rewardId) {
        const reward = await this.prisma.reward.findUnique({
            where: { id: rewardId },
            include: {
                merchant: true,
            },
        });
        if (!reward) {
            throw new common_1.NotFoundException('Reward not found');
        }
        return {
            ...reward,
            imageUrl: reward.imageUrl || undefined,
            merchantName: reward.merchant.name,
            merchantLogoUrl: reward.merchant.logoUrl || undefined,
        };
    }
    async updateReward(merchantId, rewardId, updateRewardDto) {
        const existingReward = await this.prisma.reward.findFirst({
            where: { id: rewardId, merchantId },
        });
        if (!existingReward) {
            throw new common_1.NotFoundException('Reward not found');
        }
        const updateData = { ...updateRewardDto };
        if (updateRewardDto.expiryDate) {
            updateData.expiryDate = new Date(updateRewardDto.expiryDate);
        }
        const reward = await this.prisma.reward.update({
            where: { id: rewardId },
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
    async deleteReward(merchantId, rewardId) {
        const existingReward = await this.prisma.reward.findFirst({
            where: { id: rewardId, merchantId },
        });
        if (!existingReward) {
            throw new common_1.NotFoundException('Reward not found');
        }
        await this.prisma.reward.delete({
            where: { id: rewardId },
        });
    }
    async toggleRewardActive(merchantId, rewardId) {
        const existingReward = await this.prisma.reward.findFirst({
            where: { id: rewardId, merchantId },
        });
        if (!existingReward) {
            throw new common_1.NotFoundException('Reward not found');
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
    async getMerchantData(merchantId) {
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
    async getMerchantDashboardData(merchantId) {
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
    async getMerchantLoyaltyProgram(merchantAddress) {
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
            },
        });
        const totalLoyaltyPoints = await Promise.all(loyalCustomers.map(customer => this.blockchainService.getLoyaltyTokenBalance(customer.walletAddress))).then(balances => balances.reduce((sum, balance) => sum + parseFloat(balance), 0));
        return {
            loyalCustomers: loyalCustomers.map(customer => ({
                address: customer.walletAddress,
                name: `User ${customer.id.slice(0, 8)}`,
                points: 0,
            })),
            totalLoyaltyPoints,
        };
    }
    async getUserRewards(userAddress) {
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
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map