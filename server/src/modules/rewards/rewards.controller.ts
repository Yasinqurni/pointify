import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { RewardsService } from './rewards.service';
import {
  CreateRewardDto,
  UpdateRewardDto,
  RewardResponseDto,
} from '../../dto/reward.dto';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active rewards' })
  @ApiResponse({
    status: 200,
    description: 'List of all active rewards',
    type: [RewardResponseDto],
  })
  async getAllRewards(): Promise<RewardResponseDto[]> {
    return this.rewardsService.getAllRewards();
  }

  @Get('merchant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant rewards' })
  @ApiResponse({
    status: 200,
    description: 'List of merchant rewards',
    type: [RewardResponseDto],
  })
  async getMerchantRewards(@Request() req): Promise<RewardResponseDto[]> {
    return this.rewardsService.getMerchantRewards(req.user.userId);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Get merchant data by merchant ID' })
  @ApiResponse({
    status: 200,
    description: 'Merchant data',
  })
  async getMerchantData(@Param('merchantId') merchantId: string) {
    return this.rewardsService.getMerchantData(merchantId);
  }

  @Get('merchant/:merchantId/dashboard')
  @ApiOperation({ summary: 'Get merchant dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Merchant dashboard data',
  })
  async getMerchantDashboardData(@Param('merchantId') merchantId: string) {
    return this.rewardsService.getMerchantDashboardData(merchantId);
  }

  @Get('merchant/:merchantAddress/loyalty-program')
  @ApiOperation({ summary: 'Get merchant loyalty program' })
  @ApiResponse({
    status: 200,
    description: 'Merchant loyalty program data',
  })
  async getMerchantLoyaltyProgram(@Param('merchantAddress') merchantAddress: string) {
    return this.rewardsService.getMerchantLoyaltyProgram(merchantAddress);
  }

  @Get('user/:userAddress')
  @ApiOperation({ summary: 'Get user rewards by user address' })
  @ApiResponse({
    status: 200,
    description: 'List of user rewards',
  })
  async getUserRewards(@Param('userAddress') userAddress: string) {
    return this.rewardsService.getUserRewards(userAddress);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reward by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reward details',
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async getRewardById(@Param('id') id: string): Promise<RewardResponseDto> {
    return this.rewardsService.getRewardById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new reward' })
  @ApiResponse({
    status: 201,
    description: 'Reward created successfully',
    type: RewardResponseDto,
  })
  async createReward(
    @Request() req,
    @Body() createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.createReward(req.user.userId, createRewardDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update reward' })
  @ApiResponse({
    status: 200,
    description: 'Reward updated successfully',
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async updateReward(
    @Request() req,
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<RewardResponseDto> {
    // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rewardsService.updateReward(req.user.userId, id, updateRewardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete reward' })
  @ApiResponse({ status: 200, description: 'Reward deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async deleteReward(@Request() req, @Param('id') id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rewardsService.deleteReward(req.user.userId, id);
  }

  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle reward active status' })
  @ApiResponse({
    status: 200,
    description: 'Reward status toggled',
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async toggleRewardActive(
    @Request() req,
    @Param('id') id: string,
  ): Promise<RewardResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rewardsService.toggleRewardActive(req.user.userId, id);
  }
}
