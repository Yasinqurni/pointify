import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, MerchantRegisterDto, CheckMerchantDto, CheckUserDto, RefreshTokenDto } from '../../dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    registerUser(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            walletAddress: string;
            userType: string;
        };
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
    updateMerchantStatus(updateStatusDto: {
        walletAddress: string;
        status: 'APPROVED' | 'REJECTED';
        transactionHash?: string;
    }): Promise<{
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
    registerMerchantWithToken(merchantData: any, req: any): Promise<{
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
    checkMerchant(checkMerchantDto: CheckMerchantDto): Promise<{
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
    getMerchantProfile(req: any): Promise<{
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
    checkUser(checkUserDto: CheckUserDto): Promise<{
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
    refreshToken(refreshDto: RefreshTokenDto): Promise<{
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
    logout(req: any): Promise<{
        message: string;
    }>;
}
