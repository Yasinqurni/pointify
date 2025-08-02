import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssuePointsDto {
  @ApiProperty({ description: 'User wallet address to issue points to' })
  @IsString()
  @IsNotEmpty()
  userWalletAddress: string;

  @ApiProperty({ description: 'Number of points to issue' })
  @IsNumber()
  @IsNotEmpty()
  points: number;
}

export class PointsTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  merchantId?: string;

  @ApiProperty()
  redemptionId?: string;
}

export class UserBalanceResponseDto {
  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  loyaltyPoints: number;

  @ApiProperty()
  totalReceived: number;

  @ApiProperty()
  totalSpent: number;
}

export class MerchantBalanceResponseDto {
  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  idrxBalance: number;

  @ApiProperty()
  loyalBalance: number;

  @ApiProperty()
  totalRewarded: number;
}
