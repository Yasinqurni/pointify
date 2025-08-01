export declare class LoginDto {
    walletAddress: string;
    signature: string;
    message: string;
}
export declare class RegisterDto {
    walletAddress: string;
    signature: string;
    message: string;
    email?: string;
    username?: string;
}
export declare class MerchantRegisterDto {
    walletAddress: string;
    signature: string;
    message: string;
    name: string;
    description?: string;
    logoUrl?: string;
}
export declare class CheckMerchantDto {
    walletAddress: string;
}
export declare class CheckUserDto {
    walletAddress: string;
}
export declare class MerchantResponseDto {
    id: string;
    walletAddress: string;
    name: string;
    description?: string;
    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserResponseDto {
    id: string;
    walletAddress: string;
    email?: string;
    username?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RefreshTokenDto {
    walletAddress: string;
    signature: string;
    message: string;
}
