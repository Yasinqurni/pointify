import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { PointsModule } from './modules/points/points.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    RewardsModule,
    RedemptionsModule,
    PointsModule,
    BlockchainModule,
    BlockchainModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
