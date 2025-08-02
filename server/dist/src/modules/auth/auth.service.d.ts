import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { LoginDto, RegisterDto, MerchantRegisterDto } from '../../dto/auth.dto';
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
        };
        userType: string;
    }>;
    registerMerchant(merchantRegisterDto: MerchantRegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            walletAddress: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
        };
        userType: string;
    }>;
    registerMerchantWithToken(merchantData: any, user: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            walletAddress: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
        };
        userType: string;
    }>;
    checkMerchant(walletAddress: string): Promise<{
        exists: boolean;
        merchant: {
            id: string;
            walletAddress: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            logoUrl: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            transactionHash: string | null;
        } | null;
    }>;
    getMerchantByWallet(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        logoUrl: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        transactionHash: string | null;
    }>;
    updateMerchantStatus(walletAddress: string, status: 'APPROVED' | 'REJECTED', transactionHash?: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        logoUrl: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        transactionHash: string | null;
    }>;
    getMerchantProfile(user: any): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        logoUrl: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        transactionHash: string | null;
    }>;
    getPublicMerchantInfo(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        name: string;
        description: string | null;
        logoUrl: string | null;
    }>;
    checkUser(walletAddress: string): Promise<{
        exists: boolean;
        user: {
            id: string;
            walletAddress: string;
            email: string | null;
            username: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    getUserByWallet(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        email: string | null;
        username: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    registerUser(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            walletAddress: string;
            userType: string;
        };
    }>;
}
