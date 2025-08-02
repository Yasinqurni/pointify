import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Module({
  controllers: [RewardsController],
  providers: [RewardsService, PrismaService, BlockchainService],
  exports: [RewardsService],
})
export class RewardsModule {}
