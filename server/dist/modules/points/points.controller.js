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
exports.PointsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
const points_service_1 = require("./points.service");
const points_dto_1 = require("../../dto/points.dto");
let PointsController = class PointsController {
    pointsService;
    constructor(pointsService) {
        this.pointsService = pointsService;
    }
    async issuePoints(req, issuePointsDto) {
        return this.pointsService.issuePoints(req.user.userId, issuePointsDto);
    }
    async getUserBalance(req) {
        return this.pointsService.getUserBalance(req.user.userId);
    }
    async getMerchantBalance(req) {
        return this.pointsService.getMerchantBalance(req.user.userId);
    }
    async getUserTransactions(req) {
        return this.pointsService.getUserTransactions(req.user.userId);
    }
    async getMerchantTransactions(req) {
        return this.pointsService.getMerchantTransactions(req.user.userId);
    }
};
exports.PointsController = PointsController;
__decorate([
    (0, common_1.Post)('issue'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Issue points to user (merchant only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Points issued successfully',
        type: points_dto_1.PointsTransactionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, points_dto_1.IssuePointsDto]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "issuePoints", null);
__decorate([
    (0, common_1.Get)('balance/user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user balance' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User balance',
        type: points_dto_1.UserBalanceResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "getUserBalance", null);
__decorate([
    (0, common_1.Get)('balance/merchant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant balance' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Merchant balance',
        type: points_dto_1.MerchantBalanceResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "getMerchantBalance", null);
__decorate([
    (0, common_1.Get)('transactions/user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user transactions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user transactions',
        type: [points_dto_1.PointsTransactionResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/merchant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant transactions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of merchant transactions',
        type: [points_dto_1.PointsTransactionResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "getMerchantTransactions", null);
exports.PointsController = PointsController = __decorate([
    (0, swagger_1.ApiTags)('Points'),
    (0, common_1.Controller)('points'),
    __metadata("design:paramtypes", [points_service_1.PointsService])
], PointsController);
//# sourceMappingURL=points.controller.js.map