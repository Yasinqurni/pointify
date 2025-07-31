import {
  Controller,
  Get,
  Post,
  Body,
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
import { PointsService } from './points.service';
import {
  IssuePointsDto,
  PointsTransactionResponseDto,
  UserBalanceResponseDto,
  MerchantBalanceResponseDto,
} from '../../dto/points.dto';

@ApiTags('Points')
@Controller('points')
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Post('issue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue points to user (merchant only)' })
  @ApiResponse({
    status: 201,
    description: 'Points issued successfully',
    type: PointsTransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async issuePoints(
    @Request() req,
    @Body() issuePointsDto: IssuePointsDto,
  ): Promise<PointsTransactionResponseDto> {
    return this.pointsService.issuePoints(req.user.userId, issuePointsDto);
  }

  @Get('balance/user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user balance' })
  @ApiResponse({
    status: 200,
    description: 'User balance',
    type: UserBalanceResponseDto,
  })
  async getUserBalance(@Request() req): Promise<UserBalanceResponseDto> {
    return this.pointsService.getUserBalance(req.user.userId);
  }

  @Get('balance/merchant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant balance' })
  @ApiResponse({
    status: 200,
    description: 'Merchant balance',
    type: MerchantBalanceResponseDto,
  })
  async getMerchantBalance(
    @Request() req,
  ): Promise<MerchantBalanceResponseDto> {
    return this.pointsService.getMerchantBalance(req.user.userId);
  }

  @Get('transactions/user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of user transactions',
    type: [PointsTransactionResponseDto],
  })
  async getUserTransactions(
    @Request() req,
  ): Promise<PointsTransactionResponseDto[]> {
    return this.pointsService.getUserTransactions(req.user.userId);
  }

  @Get('transactions/merchant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of merchant transactions',
    type: [PointsTransactionResponseDto],
  })
  async getMerchantTransactions(
    @Request() req,
  ): Promise<PointsTransactionResponseDto[]> {
    return this.pointsService.getMerchantTransactions(req.user.userId);
  }
}
