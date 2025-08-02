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
  CompleteRedemptionDto,
  RedemptionResponseDto,
} from '../../dto/redemption.dto';

@ApiTags('Redemptions')
@Controller('redemptions')
export class RedemptionsController {
  constructor(private redemptionsService: RedemptionsService) {}

  @Post()
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
      req.user.walletAddress, // Pass wallet address for auto-user creation
    );
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify claim code (merchant only)' })
  @ApiResponse({
    status: 200,
    description: 'Claim code verified',
    type: RedemptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invalid claim code' })
  async verifyClaimCode(
    @Request() req,
    @Body() verifyClaimCodeDto: VerifyClaimCodeDto,
  ): Promise<RedemptionResponseDto> {
    return this.redemptionsService.verifyClaimCode(req.user.userId, verifyClaimCodeDto);
  }

  @Get('verify/:claimCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify claim code by path parameter (merchant only)' })
  @ApiResponse({
    status: 200,
    description: 'Claim code verified',
    type: RedemptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invalid claim code' })
  async verifyClaimCodeByPath(
    @Request() req,
    @Param('claimCode') claimCode: string,
  ): Promise<RedemptionResponseDto | null> {
    return this.redemptionsService.verifyClaimCode(req.user.userId, { claimCode });
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

  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm claim by redemption ID' })
  @ApiResponse({
    status: 200,
    description: 'Claim confirmed successfully',
  })
  @ApiResponse({ status: 404, description: 'Redemption not found' })
  async confirmClaimById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.redemptionsService.confirmClaimById(req.user.userId, id);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete redemption after blockchain transaction' })
  @ApiResponse({
    status: 201,
    description: 'Redemption completed successfully',
    type: RedemptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Reward or user not found' })
  async completeRedemption(
    @Body() completeRedemptionDto: CompleteRedemptionDto,
  ): Promise<RedemptionResponseDto> {
    return this.redemptionsService.completeRedemption(completeRedemptionDto);
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

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user redemptions by user ID' })
  @ApiResponse({
    status: 200,
    description: 'List of user redemptions',
    type: [RedemptionResponseDto],
  })
  async getUserRedemptionsById(
    @Param('userId') userId: string,
  ): Promise<RedemptionResponseDto[]> {
    return this.redemptionsService.getUserRedemptions(userId);
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

  @Get('merchant/:merchantAddress')
  @ApiOperation({ summary: 'Get merchant redemptions by merchant address' })
  @ApiResponse({
    status: 200,
    description: 'List of merchant redemptions',
    type: [RedemptionResponseDto],
  })
  async getMerchantRedemptionsByAddress(
    @Param('merchantAddress') merchantAddress: string,
  ): Promise<RedemptionResponseDto[]> {
    return this.redemptionsService.getMerchantRedemptions(merchantAddress);
  }
}
