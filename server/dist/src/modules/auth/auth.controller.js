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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("../../dto/auth.dto");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        console.log("🔍 Backend: /auth/login endpoint hit");
        console.log("🔍 Backend: Request body:", {
            walletAddress: loginDto.walletAddress,
            hasSignature: !!loginDto.signature,
            hasMessage: !!loginDto.message
        });
        const result = await this.authService.login(loginDto);
        console.log("✅ Backend: /auth/login endpoint returning response");
        return result;
    }
    async registerUser(registerDto) {
        return this.authService.registerUser(registerDto);
    }
    async registerMerchant(merchantRegisterDto) {
        return this.authService.registerMerchant(merchantRegisterDto);
    }
    async updateMerchantStatus(updateStatusDto) {
        return this.authService.updateMerchantStatus(updateStatusDto.walletAddress, updateStatusDto.status, updateStatusDto.transactionHash);
    }
    async registerMerchantWithToken(merchantData, req) {
        return this.authService.registerMerchantWithToken(merchantData, req.user);
    }
    async checkMerchant(checkMerchantDto) {
        return this.authService.checkMerchant(checkMerchantDto.walletAddress);
    }
    async getMerchantProfile(req) {
        return this.authService.getMerchantProfile(req.user);
    }
    async getPublicMerchantInfo(walletAddress) {
        return this.authService.getPublicMerchantInfo(walletAddress);
    }
    async checkUser(checkUserDto) {
        return this.authService.checkUser(checkUserDto.walletAddress);
    }
    async refreshToken(refreshDto) {
        return this.authService.login(refreshDto);
    }
    async logout(req) {
        return { message: 'Logged out successfully' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login with wallet signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid signature or user not found',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register/user'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'User already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)('register/merchant'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new merchant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Merchant registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Merchant already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.MerchantRegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerMerchant", null);
__decorate([
    (0, common_1.Put)('merchant/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update merchant status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchant status updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateMerchantStatus", null);
__decorate([
    (0, common_1.Post)('register/merchant/token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register new merchant with existing token' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Merchant registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Merchant already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerMerchantWithToken", null);
__decorate([
    (0, common_1.Post)('check/merchant'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check if merchant is registered' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchant check completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CheckMerchantDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkMerchant", null);
__decorate([
    (0, common_1.Get)('merchant/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get authenticated merchant profile (Protected)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchant found', type: auth_dto_1.MerchantResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - user is not a merchant' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMerchantProfile", null);
__decorate([
    (0, common_1.Get)('merchant/:walletAddress/public'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public merchant info by wallet address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchant found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    __param(0, (0, common_1.Param)('walletAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getPublicMerchantInfo", null);
__decorate([
    (0, common_1.Post)('check/user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check if user is registered' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User check completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CheckUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkUser", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh JWT token with wallet signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid signature' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logged out successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map