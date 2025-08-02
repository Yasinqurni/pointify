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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma.service");
const ethers_1 = require("ethers");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateWalletSignature(walletAddress, message, signature) {
        try {
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
        }
        catch (error) {
            return false;
        }
    }
    async login(loginDto) {
        console.log("🔍 Backend login called with walletAddress:", loginDto.walletAddress);
        console.log("🔍 Backend login data:", {
            walletAddress: loginDto.walletAddress,
            hasSignature: !!loginDto.signature,
            hasMessage: !!loginDto.message
        });
        const { walletAddress, signature, message } = loginDto;
        console.log("🔍 Backend: Validating wallet signature...");
        const isValidSignature = await this.validateWalletSignature(walletAddress, message, signature);
        console.log("🔍 Backend: Signature validation result:", isValidSignature);
        if (!isValidSignature) {
            console.log("❌ Backend: Invalid wallet signature");
            throw new common_1.UnauthorizedException('Invalid wallet signature');
        }
        console.log("🔍 Backend: Searching for merchant in database...");
        const merchant = await this.prisma.merchant.findUnique({
            where: { walletAddress },
        });
        console.log("🔍 Backend: Merchant found:", !!merchant);
        if (!merchant) {
            console.log("❌ Backend: No merchant found");
            throw new common_1.UnauthorizedException('Merchant not found');
        }
        const payload = {
            sub: merchant.id,
            walletAddress,
            userType: 'merchant',
        };
        console.log("🔍 Backend: Creating JWT payload:", payload);
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload);
        console.log("🔍 Backend: Tokens generated:", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            userType: 'merchant'
        });
        const response = {
            accessToken,
            refreshToken,
            user: merchant,
            userType: 'merchant',
        };
        console.log("✅ Backend: Login successful, returning response");
        return response;
    }
    async registerMerchant(merchantRegisterDto) {
        const { walletAddress, signature, message, name, description, logoUrl } = merchantRegisterDto;
        const isValidSignature = await this.validateWalletSignature(walletAddress, message, signature);
        if (!isValidSignature) {
            throw new common_1.UnauthorizedException('Invalid wallet signature');
        }
        const existingMerchant = await this.prisma.merchant.findUnique({
            where: { walletAddress },
        });
        if (existingMerchant) {
            throw new common_1.UnauthorizedException('Merchant already exists');
        }
        const merchant = await this.prisma.merchant.create({
            data: {
                walletAddress,
                name,
                description,
                logoUrl,
            },
        });
        const payload = {
            sub: merchant.id,
            walletAddress,
            userType: 'merchant',
        };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload),
            user: merchant,
            userType: 'merchant',
        };
    }
    async registerMerchantWithToken(merchantData, user) {
        const { name, description, logoUrl } = merchantData;
        const walletAddress = user.walletAddress;
        const existingMerchant = await this.prisma.merchant.findUnique({
            where: { walletAddress },
        });
        if (existingMerchant) {
            throw new common_1.UnauthorizedException('Merchant already exists');
        }
        const merchant = await this.prisma.merchant.create({
            data: {
                walletAddress,
                name,
                description,
                logoUrl,
            },
        });
        const payload = {
            sub: merchant.id,
            walletAddress,
            userType: 'merchant',
        };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload),
            user: merchant,
            userType: 'merchant',
        };
    }
    async checkMerchant(walletAddress) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { walletAddress },
        });
        return {
            exists: !!merchant,
            merchant: merchant || null,
        };
    }
    async getMerchantByWallet(walletAddress) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { walletAddress },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        return merchant;
    }
    async updateMerchantStatus(walletAddress, status, transactionHash) {
        const merchant = await this.prisma.merchant.update({
            where: { walletAddress },
            data: {
                status,
                transactionHash,
            },
        });
        return merchant;
    }
    async getMerchantProfile(user) {
        if (user.userType !== 'merchant') {
            throw new common_1.UnauthorizedException('Access denied. User is not a merchant.');
        }
        const merchant = await this.prisma.merchant.findUnique({
            where: { walletAddress: user.walletAddress },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        return merchant;
    }
    async getPublicMerchantInfo(walletAddress) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { walletAddress },
            select: {
                id: true,
                name: true,
                description: true,
                logoUrl: true,
                walletAddress: true,
                createdAt: true,
            },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        return merchant;
    }
    async checkUser(walletAddress) {
        const user = await this.prisma.user.findUnique({
            where: { walletAddress },
        });
        return {
            exists: !!user,
            user: user || null,
        };
    }
    async getUserByWallet(walletAddress) {
        const user = await this.prisma.user.findUnique({
            where: { walletAddress },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async registerUser(registerDto) {
        const { walletAddress, signature, message } = registerDto;
        const isValidSignature = await this.validateWalletSignature(walletAddress, message, signature);
        if (!isValidSignature) {
            throw new common_1.UnauthorizedException('Invalid wallet signature');
        }
        let user = await this.prisma.user.findUnique({
            where: { walletAddress },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: { walletAddress },
            });
        }
        const payload = {
            sub: user.id,
            walletAddress,
            userType: 'user',
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                userType: 'user',
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map