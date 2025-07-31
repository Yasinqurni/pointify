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
let RewardsService = class RewardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map