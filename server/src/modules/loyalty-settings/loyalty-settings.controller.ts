import {
  Controller,
  Get,
  Put,
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
import { LoyaltySettingsService } from './loyalty-settings.service';
import {
  UpdateLoyaltySettingsDto,
  LoyaltySettingsResponseDto,
} from '../../dto/loyalty-settings.dto';

@ApiTags('Loyalty Settings')
@Controller('loyalty-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltySettingsController {
  constructor(private readonly loyaltySettingsService: LoyaltySettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get merchant loyalty settings' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty settings retrieved successfully',
    type: LoyaltySettingsResponseDto,
  })
  async getLoyaltySettings(@Request() req): Promise<LoyaltySettingsResponseDto> {
    return this.loyaltySettingsService.getLoyaltySettings(req.user.userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update merchant loyalty settings' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty settings updated successfully',
    type: LoyaltySettingsResponseDto,
  })
  async updateLoyaltySettings(
    @Request() req,
    @Body() updateDto: UpdateLoyaltySettingsDto,
  ): Promise<LoyaltySettingsResponseDto> {
    return this.loyaltySettingsService.updateLoyaltySettings(
      req.user.userId,
      updateDto,
    );
  }
} 