import { Module } from '@nestjs/common';
import { RedemptionsController } from './redemptions.controller';
import { RedemptionsService } from './redemptions.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [RedemptionsController],
  providers: [RedemptionsService, PrismaService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
