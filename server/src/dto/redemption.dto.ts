import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemRewardDto {
  @ApiProperty({ description: 'Reward ID to redeem' })
  @IsString()
  @IsNotEmpty()
  rewardId: string;
}

export class VerifyClaimCodeDto {
  @ApiProperty({ description: 'Claim code to verify' })
  @IsString()
  @IsNotEmpty()
  claimCode: string;
}

export class ConfirmClaimDto {
  @ApiProperty({ description: 'Redemption ID to confirm' })
  @IsString()
  @IsNotEmpty()
  redemptionId: string;
}

export class RedemptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  claimCode: string;

  @ApiProperty()
  redeemedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  rewardId: string;

  @ApiProperty()
  rewardTitle: string;

  @ApiProperty()
  merchantId: string;

  @ApiProperty()
  merchantName: string;

  @ApiProperty()
  redeemedPoints: number;
}
