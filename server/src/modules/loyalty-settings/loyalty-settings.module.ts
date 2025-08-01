import { Module } from '@nestjs/common';
import { LoyaltySettingsController } from './loyalty-settings.controller';
import { LoyaltySettingsService } from './loyalty-settings.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [LoyaltySettingsController],
  providers: [LoyaltySettingsService, PrismaService],
  exports: [LoyaltySettingsService],
})
export class LoyaltySettingsModule {} 