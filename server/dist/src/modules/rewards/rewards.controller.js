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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
const rewards_service_1 = require("./rewards.service");
const reward_dto_1 = require("../../dto/reward.dto");
let RewardsController = class RewardsController {
    rewardsService;
    constructor(rewardsService) {
        this.rewardsService = rewardsService;
    }
    async getAllRewards() {
        return this.rewardsService.getAllRewards();
    }
    async getMerchantRewards(req) {
        return this.rewardsService.getMerchantRewards(req.user.userId);
    }
    async getMerchantData(merchantId) {
        return this.rewardsService.getMerchantData(merchantId);
    }
    async getMerchantDashboardData(merchantId) {
        return this.rewardsService.getMerchantDashboardData(merchantId);
    }
    async getMerchantLoyaltyProgram(merchantAddress) {
        return this.rewardsService.getMerchantLoyaltyProgram(merchantAddress);
    }
    async getUserRewards(userAddress) {
        return this.rewardsService.getUserRewards(userAddress);
    }
    async getRewardById(id) {
        return this.rewardsService.getRewardById(id);
    }
    async createReward(req, createRewardDto) {
        return this.rewardsService.createReward(req.user.userId, createRewardDto);
    }
    async updateReward(req, id, updateRewardDto) {
        return this.rewardsService.updateReward(req.user.userId, id, updateRewardDto);
    }
    async deleteReward(req, id) {
        return this.rewardsService.deleteReward(req.user.userId, id);
    }
    async toggleRewardActive(req, id) {
        return this.rewardsService.toggleRewardActive(req.user.userId, id);
    }
};
exports.RewardsController = RewardsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active rewards' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all active rewards',
        type: [reward_dto_1.RewardResponseDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "getAllRewards", null);
__decorate([
    (0, common_1.Get)('merchant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant rewards' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of merchant rewards',
        type: [reward_dto_1.RewardResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "getMerchantRewards", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant data by merchant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Merchant data',
    }),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "getMerchantData", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantId/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant dashboard data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Merchant dashboard data',
    }),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "getMerchantDashboardData", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantAddress/loyalty-program'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant loyalty program' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Merchant loyalty program data',
    }),
    __param(0, (0, common_1.Param)('merchantAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "getMerchantLoyaltyProgram", null);
__decorate([
    (0, common_1.Get)('user/:userAddress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user rewards by user address' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user rewards',
    }),
    __param(0, (0, common_1.Param)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "getUserRewards", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reward by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reward details',
        type: reward_dto_1.RewardResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reward not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "getRewardById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new reward' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Reward created successfully',
        type: reward_dto_1.RewardResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reward_dto_1.CreateRewardDto]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "createReward", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update reward' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reward updated successfully',
        type: reward_dto_1.RewardResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reward not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reward_dto_1.UpdateRewardDto]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "updateReward", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete reward' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reward deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reward not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "deleteReward", null);
__decorate([
    (0, common_1.Put)(':id/toggle'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle reward active status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reward status toggled',
        type: reward_dto_1.RewardResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reward not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RewardsController.prototype, "toggleRewardActive", null);
exports.RewardsController = RewardsController = __decorate([
    (0, swagger_1.ApiTags)('Rewards'),
    (0, common_1.Controller)('rewards'),
    __metadata("design:paramtypes", [rewards_service_1.RewardsService])
], RewardsController);
//# sourceMappingURL=rewards.controller.js.map