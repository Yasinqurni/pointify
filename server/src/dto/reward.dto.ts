import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
  @ApiProperty({ description: 'Reward title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Reward description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Reward image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Points required to redeem this reward' })
  @IsNumber()
  @IsNotEmpty()
  requiredPoints: number;

  @ApiProperty({ description: 'Reward expiry date' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({ description: 'Whether the reward is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRewardDto {
  @ApiProperty({ description: 'Reward title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Reward description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Reward image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Points required to redeem this reward' })
  @IsNumber()
  @IsOptional()
  requiredPoints?: number;

  @ApiProperty({ description: 'Reward expiry date' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ description: 'Whether the reward is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class RewardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  requiredPoints: number;

  @ApiProperty()
  expiryDate: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  merchantId: string;

  @ApiProperty()
  merchantName: string;

  @ApiProperty()
  merchantLogoUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
