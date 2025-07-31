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
            loyaltyPoints: number;
        } | {
            id: string;
            walletAddress: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            logoUrl: string | null;
            idrxBalance: number;
            loyalBalance: number;
            totalRewarded: number;
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
            loyaltyPoints: number;
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
            idrxBalance: number;
            loyalBalance: number;
            totalRewarded: number;
        };
        userType: string;
    }>;
}
