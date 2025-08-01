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
exports.RedemptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const ethers_1 = require("ethers");
let RedemptionsService = class RedemptionsService {
    prisma;
    blockchainService;
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
    }
    async redeemReward(userId, redeemRewardDto, walletAddress) {
        const { rewardId } = redeemRewardDto;
        const reward = await this.prisma.reward.findUnique({
            where: { id: rewardId },
            include: { merchant: true },
        });
        if (!reward) {
            throw new common_1.NotFoundException('Reward not found');
        }
        if (!reward.isActive) {
            throw new common_1.BadRequestException('Reward is not active');
        }
        if (new Date() > reward.expiryDate) {
            throw new common_1.BadRequestException('Reward has expired');
        }
        let user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user && walletAddress) {
            user = await this.prisma.user.findUnique({
                where: { walletAddress: walletAddress },
            });
            if (!user) {
                try {
                    user = await this.prisma.user.create({
                        data: {
                            walletAddress: walletAddress,
                            email: null,
                            username: null,
                        },
                    });
                }
                catch (error) {
                    console.error(`Failed to auto-create user: ${error.message}`);
                    throw new common_1.NotFoundException('User not found and could not be created');
                }
            }
        }
        else if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const pendingRedemption = await this.prisma.redemption.findFirst({
            where: {
                userId: user.id,
                rewardId: rewardId,
                status: 'PENDING',
            },
        });
        if (pendingRedemption) {
            throw new common_1.BadRequestException(`You already have a pending redemption for this reward. Please use your existing claim code: ${pendingRedemption.claimCode}`);
        }
        let userBalance;
        try {
            const blockchainBalance = await this.blockchainService.getLoyaltyTokenBalance(user.walletAddress);
            userBalance = parseFloat(blockchainBalance);
        }
        catch (error) {
            console.log('Blockchain balance check failed, using mock balance');
            userBalance = 100;
        }
        if (userBalance < reward.requiredPoints) {
            throw new common_1.BadRequestException('Insufficient loyalty points');
        }
        const claimCode = ethers_1.ethers
            .id(Date.now().toString() + userId + rewardId)
            .slice(0, 8)
            .toUpperCase();
        const redemption = await this.prisma.redemption.create({
            data: {
                userId: user.id,
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
    async verifyClaimCode(merchantId, verifyClaimCodeDto) {
        const { claimCode } = verifyClaimCodeDto;
        const redemption = await this.prisma.redemption.findFirst({
            where: {
                claimCode,
                merchantId
            },
            include: {
                reward: true,
                merchant: true,
                user: true,
            },
        });
        if (!redemption) {
            throw new common_1.NotFoundException('Invalid claim code or code does not belong to your store');
        }
        if (redemption.status !== 'PENDING') {
            throw new common_1.BadRequestException('Redemption has already been processed');
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
    async confirmClaim(merchantId, confirmClaimDto) {
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
            throw new common_1.NotFoundException('Redemption not found');
        }
        if (redemption.status !== 'PENDING') {
            throw new common_1.BadRequestException('Redemption has already been processed');
        }
        try {
            await this.blockchainService.redeemLoyaltyPoints(redemption.user.walletAddress, redemption.reward.requiredPoints);
            await this.prisma.pointTransaction.create({
                data: {
                    userId: redemption.userId,
                    merchantId: redemption.merchantId,
                    redemptionId: redemption.id,
                    amount: -redemption.reward.requiredPoints,
                    type: 'SPENT',
                },
            });
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
        catch (error) {
            await this.prisma.redemption.update({
                where: { id: redemptionId },
                data: {
                    status: 'CANCELLED',
                },
            });
            throw new common_1.BadRequestException('Failed to deduct points from blockchain');
        }
    }
    async confirmClaimById(merchantId, redemptionId) {
        const redemption = await this.prisma.redemption.findFirst({
            where: { id: redemptionId, merchantId },
        });
        if (!redemption) {
            throw new common_1.NotFoundException('Redemption not found');
        }
        if (redemption.status !== 'PENDING') {
            throw new common_1.BadRequestException('Redemption has already been processed');
        }
        await this.prisma.redemption.update({
            where: { id: redemptionId },
            data: {
                status: 'CLAIMED',
                redeemedAt: new Date(),
            },
        });
    }
    async getUserRedemptions(userId) {
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
    async getMerchantRedemptions(merchantId) {
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
};
exports.RedemptionsService = RedemptionsService;
exports.RedemptionsService = RedemptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], RedemptionsService);
//# sourceMappingURL=redemptions.service.js.map