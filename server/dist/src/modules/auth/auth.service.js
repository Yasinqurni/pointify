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
        const { walletAddress, signature, message } = loginDto;
        const isValidSignature = await this.validateWalletSignature(walletAddress, message, signature);
        if (!isValidSignature) {
            throw new common_1.UnauthorizedException('Invalid wallet signature');
        }
        const user = await this.prisma.user.findUnique({
            where: { walletAddress },
        });
        const merchant = await this.prisma.merchant.findUnique({
            where: { walletAddress },
        });
        if (!user && !merchant) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const payload = {
            sub: user?.id || merchant?.id,
            walletAddress,
            userType: user ? 'user' : 'merchant',
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: user || merchant,
            userType: user ? 'user' : 'merchant',
        };
    }
    async registerUser(registerDto) {
        const { walletAddress, email, username } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { walletAddress },
        });
        if (existingUser) {
            throw new common_1.UnauthorizedException('User already exists');
        }
        const user = await this.prisma.user.create({
            data: {
                walletAddress,
                email,
                username,
            },
        });
        const payload = {
            sub: user.id,
            walletAddress,
            userType: 'user',
        };
        return {
            access_token: this.jwtService.sign(payload),
            user,
            userType: 'user',
        };
    }
    async registerMerchant(merchantRegisterDto) {
        const { walletAddress, name, description, logoUrl } = merchantRegisterDto;
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
            access_token: this.jwtService.sign(payload),
            merchant,
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map