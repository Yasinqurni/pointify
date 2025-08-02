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
exports.LoyaltySettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let LoyaltySettingsService = class LoyaltySettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLoyaltySettings(merchantId) {
        let settings = await this.prisma.loyaltySettings.findUnique({
            where: { merchantId },
        });
        if (!settings) {
            settings = await this.prisma.loyaltySettings.create({
                data: { merchantId },
            });
        }
        return settings;
    }
    async updateLoyaltySettings(merchantId, updateDto) {
        await this.getLoyaltySettings(merchantId);
        const updatedSettings = await this.prisma.loyaltySettings.update({
            where: { merchantId },
            data: updateDto,
        });
        return updatedSettings;
    }
    async calculatePointsFromPurchase(merchantId, purchaseAmount, currency = 'USD') {
        const settings = await this.getLoyaltySettings(merchantId);
        if (purchaseAmount < settings.minimumPurchase) {
            return 0;
        }
        let points = 0;
        if (currency === 'USD') {
            points = Math.floor(purchaseAmount * settings.pointsPerDollar);
        }
        else if (currency === 'IDR') {
            points = Math.floor(purchaseAmount / settings.pointsPerRupiah);
        }
        return Math.max(0, points);
    }
    async getDefaultRewardPoints(merchantId) {
        const settings = await this.getLoyaltySettings(merchantId);
        return settings.defaultRewardPoints;
    }
    async canUserRedeemPoints(merchantId, userCurrentBalance, pointsToRedeem) {
        const settings = await this.getLoyaltySettings(merchantId);
        if (settings.allowNegativeBalance) {
            return true;
        }
        return userCurrentBalance >= pointsToRedeem;
    }
};
exports.LoyaltySettingsService = LoyaltySettingsService;
exports.LoyaltySettingsService = LoyaltySettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoyaltySettingsService);
//# sourceMappingURL=loyalty-settings.service.js.map