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
exports.BlockchainController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
const blockchain_service_1 = require("./blockchain.service");
let BlockchainController = class BlockchainController {
    blockchainService;
    constructor(blockchainService) {
        this.blockchainService = blockchainService;
    }
    async getNetworkInfo() {
        return this.blockchainService.getNetworkInfo();
    }
    async getTotalSupply() {
        const supply = await this.blockchainService.getTotalSupply();
        return { totalSupply: supply };
    }
    async getBackingRatio() {
        const ratio = await this.blockchainService.getBackingRatio();
        return { backingRatio: ratio };
    }
    async getLoyaltyTokenBalance(address) {
        const balance = await this.blockchainService.getLoyaltyTokenBalance(address);
        return { address, balance };
    }
    async getMerchantQuota(address) {
        const quota = await this.blockchainService.getMerchantQuota(address);
        const isApproved = await this.blockchainService.isApprovedMerchant(address);
        return { address, quota, isApproved };
    }
    async rewardUser(req, body) {
        const { userWallet, amount } = body;
        const merchantWallet = req.user.walletAddress;
        const success = await this.blockchainService.rewardUser(merchantWallet, userWallet, amount);
        if (success) {
            return {
                success: true,
                message: `Rewarded ${amount} PLT to ${userWallet}`,
                merchantWallet,
                userWallet,
                amount,
            };
        }
        else {
            return {
                success: false,
                message: 'Failed to reward user. Check quota and approval status.',
            };
        }
    }
    async redeemPoints(req, body) {
        const { amount } = body;
        const userWallet = req.user.walletAddress;
        const success = await this.blockchainService.redeemPoint(userWallet, amount);
        if (success) {
            return {
                success: true,
                message: `Redeemed ${amount} PLT for IDRX`,
                userWallet,
                amount,
            };
        }
        else {
            return {
                success: false,
                message: 'Failed to redeem points. Check balance and try again.',
            };
        }
    }
    async manualRedeem(req, body) {
        const { userWallet, amount, item } = body;
        const merchantWallet = req.user.walletAddress;
        const success = await this.blockchainService.manualRedeem(userWallet, amount, item, merchantWallet);
        if (success) {
            return {
                success: true,
                message: `Manual redemption: ${amount} PLT for ${item}`,
                userWallet,
                merchantWallet,
                amount,
                item,
            };
        }
        else {
            return {
                success: false,
                message: 'Failed to process manual redemption.',
            };
        }
    }
    async getExchangeRate(tokenAddress) {
        const rate = await this.blockchainService.getExchangeRate(tokenAddress);
        return { tokenAddress, exchangeRate: rate };
    }
    async swapPLTForToken(req, body) {
        const { tokenAddress, pltAmount } = body;
        const userWallet = req.user.walletAddress;
        const success = await this.blockchainService.swapPLTForToken(tokenAddress, pltAmount);
        if (success) {
            return {
                success: true,
                message: `Swapped ${pltAmount} PLT for tokens`,
                userWallet,
                tokenAddress,
                pltAmount,
            };
        }
        else {
            return {
                success: false,
                message: 'Swap failed. Check balance and try again.',
            };
        }
    }
    async swapTokenForPLT(req, body) {
        const { tokenAddress, tokenAmount } = body;
        const userWallet = req.user.walletAddress;
        const success = await this.blockchainService.swapTokenForPLT(tokenAddress, tokenAmount);
        if (success) {
            return {
                success: true,
                message: `Swapped ${tokenAmount} tokens for PLT`,
                userWallet,
                tokenAddress,
                tokenAmount,
            };
        }
        else {
            return {
                success: false,
                message: 'Swap failed. Check balance and try again.',
            };
        }
    }
    async validateSignature(body) {
        const { message, signature, expectedAddress } = body;
        const isValid = await this.blockchainService.validateWalletSignature(message, signature, expectedAddress);
        return {
            isValid,
            message: isValid ? 'Signature is valid' : 'Signature is invalid',
            expectedAddress,
        };
    }
};
exports.BlockchainController = BlockchainController;
__decorate([
    (0, common_1.Get)('network'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blockchain network information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Network information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getNetworkInfo", null);
__decorate([
    (0, common_1.Get)('loyalty-token/supply'),
    (0, swagger_1.ApiOperation)({ summary: 'Get total loyalty token supply' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Total supply' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getTotalSupply", null);
__decorate([
    (0, common_1.Get)('loyalty-token/backing-ratio'),
    (0, swagger_1.ApiOperation)({ summary: 'Get loyalty token backing ratio' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backing ratio' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getBackingRatio", null);
__decorate([
    (0, common_1.Get)('loyalty-token/balance/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get loyalty token balance for address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token balance' }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getLoyaltyTokenBalance", null);
__decorate([
    (0, common_1.Get)('merchant/quota/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant quota' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchant quota' }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getMerchantQuota", null);
__decorate([
    (0, common_1.Post)('merchant/reward-user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reward user with loyalty points (merchant only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User rewarded successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request or insufficient quota',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "rewardUser", null);
__decorate([
    (0, common_1.Post)('user/redeem-points'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem loyalty points for IDRX' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Points redeemed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Insufficient balance' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "redeemPoints", null);
__decorate([
    (0, common_1.Post)('merchant/manual-redeem'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Manual redemption for physical items (merchant only)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Manual redemption processed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "manualRedeem", null);
__decorate([
    (0, common_1.Get)('swap/exchange-rate/:tokenAddress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exchange rate for token pair' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exchange rate' }),
    __param(0, (0, common_1.Param)('tokenAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getExchangeRate", null);
__decorate([
    (0, common_1.Post)('swap/plt-for-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Swap PLT for another token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Swap successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Swap failed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "swapPLTForToken", null);
__decorate([
    (0, common_1.Post)('swap/token-for-plt'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Swap another token for PLT' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Swap successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Swap failed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "swapTokenForPLT", null);
__decorate([
    (0, common_1.Post)('validate-signature'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate wallet signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Signature validation result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "validateSignature", null);
exports.BlockchainController = BlockchainController = __decorate([
    (0, swagger_1.ApiTags)('Blockchain'),
    (0, common_1.Controller)('blockchain'),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService])
], BlockchainController);
//# sourceMappingURL=blockchain.controller.js.map