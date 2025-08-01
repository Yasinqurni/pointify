import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { LoginDto, MerchantRegisterDto } from '../../dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateWalletSignature(walletAddress: string, message: string, signature: string): Promise<boolean>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            walletAddress: string;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        userType: string;
    }>;
    registerMerchant(merchantRegisterDto: MerchantRegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            walletAddress: string;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        userType: string;
    }>;
    registerMerchantWithToken(merchantData: any, user: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            walletAddress: string;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        userType: string;
    }>;
    checkMerchant(walletAddress: string): Promise<{
        exists: boolean;
        merchant: {
            id: string;
            walletAddress: string;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    getMerchantByWallet(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        transactionHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMerchantStatus(walletAddress: string, status: 'APPROVED' | 'REJECTED', transactionHash?: string): Promise<{
        id: string;
        walletAddress: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        transactionHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMerchantProfile(user: any): Promise<{
        id: string;
        walletAddress: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        transactionHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPublicMerchantInfo(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        createdAt: Date;
    }>;
    checkUser(walletAddress: string): Promise<{
        exists: boolean;
        user: {
            id: string;
            walletAddress: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            username: string | null;
        } | null;
    }>;
    getUserByWallet(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        username: string | null;
    }>;
}
