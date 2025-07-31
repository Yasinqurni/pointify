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
exports.RedemptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
const redemptions_service_1 = require("./redemptions.service");
const redemption_dto_1 = require("../../dto/redemption.dto");
let RedemptionsController = class RedemptionsController {
    redemptionsService;
    constructor(redemptionsService) {
        this.redemptionsService = redemptionsService;
    }
    async redeemReward(req, redeemRewardDto) {
        return this.redemptionsService.redeemReward(req.user.userId, redeemRewardDto);
    }
    async verifyClaimCode(verifyClaimCodeDto) {
        return this.redemptionsService.verifyClaimCode(verifyClaimCodeDto);
    }
    async confirmClaim(req, confirmClaimDto) {
        return this.redemptionsService.confirmClaim(req.user.userId, confirmClaimDto);
    }
    async getUserRedemptions(req) {
        return this.redemptionsService.getUserRedemptions(req.user.userId);
    }
    async getMerchantRedemptions(req) {
        return this.redemptionsService.getMerchantRedemptions(req.user.userId);
    }
};
exports.RedemptionsController = RedemptionsController;
__decorate([
    (0, common_1.Post)('redeem'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem a reward' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Reward redeemed successfully',
        type: redemption_dto_1.RedemptionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Insufficient points or reward not available',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, redemption_dto_1.RedeemRewardDto]),
    __metadata("design:returntype", Promise)
], RedemptionsController.prototype, "redeemReward", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify claim code' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Claim code verified',
        type: redemption_dto_1.RedemptionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invalid claim code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [redemption_dto_1.VerifyClaimCodeDto]),
    __metadata("design:returntype", Promise)
], RedemptionsController.prototype, "verifyClaimCode", null);
__decorate([
    (0, common_1.Put)('confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm claim (merchant only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Claim confirmed successfully',
        type: redemption_dto_1.RedemptionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Redemption not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, redemption_dto_1.ConfirmClaimDto]),
    __metadata("design:returntype", Promise)
], RedemptionsController.prototype, "confirmClaim", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user redemptions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user redemptions',
        type: [redemption_dto_1.RedemptionResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RedemptionsController.prototype, "getUserRedemptions", null);
__decorate([
    (0, common_1.Get)('merchant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant redemptions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of merchant redemptions',
        type: [redemption_dto_1.RedemptionResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RedemptionsController.prototype, "getMerchantRedemptions", null);
exports.RedemptionsController = RedemptionsController = __decorate([
    (0, swagger_1.ApiTags)('Redemptions'),
    (0, common_1.Controller)('redemptions'),
    __metadata("design:paramtypes", [redemptions_service_1.RedemptionsService])
], RedemptionsController);
//# sourceMappingURL=redemptions.controller.js.map