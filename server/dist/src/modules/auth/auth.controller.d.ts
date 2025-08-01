import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, MerchantRegisterDto, CheckMerchantDto, CheckUserDto, RefreshTokenDto } from '../../dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getUserByWallet(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        email: string | null;
        username: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    refreshToken(refreshDto: RefreshTokenDto): Promise<{
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
    logout(req: any): Promise<{
        message: string;
    }>;
}
