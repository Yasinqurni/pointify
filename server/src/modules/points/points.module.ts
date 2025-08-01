import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Module({
  controllers: [PointsController],
  providers: [PointsService, PrismaService, BlockchainService],
  exports: [PointsService],
})
export class PointsModule {}
