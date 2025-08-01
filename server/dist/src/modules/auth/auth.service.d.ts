import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { LoginDto, RegisterDto, MerchantRegisterDto } from '../../dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateWalletSignature(walletAddress: string, message: string, signature: string): Promise<boolean>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            walletAddress: string;
            email: string | null;
            username: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | {
            id: string;
            walletAddress: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            logoUrl: string | null;
        } | null;
        userType: string;
    }>;
    registerUser(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            walletAddress: string;
            email: string | null;
            username: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        userType: string;
    }>;
    registerMerchant(merchantRegisterDto: MerchantRegisterDto): Promise<{
        access_token: string;
        merchant: {
            id: string;
            walletAddress: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            logoUrl: string | null;
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
}
