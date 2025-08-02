import {
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLoyaltySettingsDto {
  @ApiProperty({ description: 'Points earned per dollar spent', example: 1.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  pointsPerDollar?: number;

  @ApiProperty({ description: 'Points earned per rupiah spent', example: 10000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsPerRupiah?: number;

  @ApiProperty({ description: 'Auto-calculate points based on purchase amount', example: true })
  @IsBoolean()
  @IsOptional()
  autoCalculate?: boolean;

  @ApiProperty({ description: 'Minimum purchase amount to earn points', example: 5.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumPurchase?: number;

  @ApiProperty({ description: 'Default points for manual rewards', example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10000)
  defaultRewardPoints?: number;

  @ApiProperty({ description: 'Points expiration in days', example: 365 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(3650)
  expirationDays?: number;

  @ApiProperty({ description: 'Allow customers to go into negative balance', example: false })
  @IsBoolean()
  @IsOptional()
  allowNegativeBalance?: boolean;
}

export class LoyaltySettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  pointsPerDollar: number;

  @ApiProperty()
  pointsPerRupiah: number;

  @ApiProperty()
  autoCalculate: boolean;

  @ApiProperty()
  minimumPurchase: number;

  @ApiProperty()
  defaultRewardPoints: number;

  @ApiProperty()
  expirationDays: number;

  @ApiProperty()
  allowNegativeBalance: boolean;

  @ApiProperty()
  merchantId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 