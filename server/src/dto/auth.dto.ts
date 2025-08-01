import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Wallet address for authentication' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: 'User signature for wallet verification' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ description: 'Message that was signed' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Wallet address' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: 'User email (optional)' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Username (optional)' })
  @IsString()
  @IsOptional()
  username?: string;
}

export class MerchantRegisterDto {
  @ApiProperty({ description: 'Merchant wallet address' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: 'Merchant name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Merchant description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Merchant logo URL' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class CheckMerchantDto {
  @ApiProperty({ description: 'Merchant wallet address to check' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class CheckUserDto {
  @ApiProperty({ description: 'User wallet address to check' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class MerchantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  logoUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  username?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Wallet address' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: 'Signature of the message' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ description: 'Message that was signed' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
