import { Module } from '@nestjs/common';
import { RedemptionsController } from './redemptions.controller';
import { RedemptionsService } from './redemptions.service';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Module({
  controllers: [RedemptionsController],
  providers: [RedemptionsService, PrismaService, BlockchainService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
