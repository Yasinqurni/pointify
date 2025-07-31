import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RedemptionsService } from './redemptions.service';
import {
  RedeemRewardDto,
  VerifyClaimCodeDto,
  ConfirmClaimDto,
  RedemptionResponseDto,
} from '../../dto/redemption.dto';

@ApiTags('Redemptions')
@Controller('redemptions')
export class RedemptionsController {
  constructor(private redemptionsService: RedemptionsService) {}

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redeem a reward' })
  @ApiResponse({
    status: 201,
    description: 'Reward redeemed successfully',
    type: RedemptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient points or reward not available',
  })
  async redeemReward(
    @Request() req,
    @Body() redeemRewardDto: RedeemRewardDto,
  ): Promise<RedemptionResponseDto> {
    return this.redemptionsService.redeemReward(
      req.user.userId,
      redeemRewardDto,
    );
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify claim code' })
  @ApiResponse({
    status: 200,
    description: 'Claim code verified',
    type: RedemptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invalid claim code' })
  async verifyClaimCode(
    @Body() verifyClaimCodeDto: VerifyClaimCodeDto,
  ): Promise<RedemptionResponseDto> {
    return this.redemptionsService.verifyClaimCode(verifyClaimCodeDto);
  }

  @Put('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm claim (merchant only)' })
  @ApiResponse({
    status: 200,
    description: 'Claim confirmed successfully',
    type: RedemptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Redemption not found' })
  async confirmClaim(
    @Request() req,
    @Body() confirmClaimDto: ConfirmClaimDto,
  ): Promise<RedemptionResponseDto> {
    return this.redemptionsService.confirmClaim(
      req.user.userId,
      confirmClaimDto,
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user redemptions' })
  @ApiResponse({
    status: 200,
    description: 'List of user redemptions',
    type: [RedemptionResponseDto],
  })
  async getUserRedemptions(@Request() req): Promise<RedemptionResponseDto[]> {
    return this.redemptionsService.getUserRedemptions(req.user.userId);
  }

  @Get('merchant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant redemptions' })
  @ApiResponse({
    status: 200,
    description: 'List of merchant redemptions',
    type: [RedemptionResponseDto],
  })
  async getMerchantRedemptions(
    @Request() req,
  ): Promise<RedemptionResponseDto[]> {
    return this.redemptionsService.getMerchantRedemptions(req.user.userId);
  }
}
