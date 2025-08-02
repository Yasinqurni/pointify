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
    updateMerchantStatus(updateStatusDto: {
        walletAddress: string;
        status: 'APPROVED' | 'REJECTED';
        transactionHash?: string;
    }): Promise<{
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
    registerMerchantWithToken(merchantData: any, req: any): Promise<{
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
    checkMerchant(checkMerchantDto: CheckMerchantDto): Promise<{
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
    getMerchantProfile(req: any): Promise<{
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
    checkUser(checkUserDto: CheckUserDto): Promise<{
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
    refreshToken(refreshDto: RefreshTokenDto): Promise<{
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
    logout(req: any): Promise<{
        message: string;
    }>;
}
