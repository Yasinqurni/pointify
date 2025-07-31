export declare class LoginDto {
    walletAddress: string;
    signature: string;
    message: string;
}
export declare class RegisterDto {
    walletAddress: string;
    email?: string;
    username?: string;
}
export declare class MerchantRegisterDto {
    walletAddress: string;
    name: string;
    description?: string;
    logoUrl?: string;
}
