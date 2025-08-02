import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  UpdateLoyaltySettingsDto,
  LoyaltySettingsResponseDto,
} from '../../dto/loyalty-settings.dto';

@Injectable()
export class LoyaltySettingsService {
  constructor(private prisma: PrismaService) {}

  async getLoyaltySettings(merchantId: string): Promise<LoyaltySettingsResponseDto> {
    let settings = await this.prisma.loyaltySettings.findUnique({
      where: { merchantId },
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await this.prisma.loyaltySettings.create({
        data: { merchantId },
      });
    }

    return settings;
  }

  async updateLoyaltySettings(
    merchantId: string,
    updateDto: UpdateLoyaltySettingsDto,
  ): Promise<LoyaltySettingsResponseDto> {
    // First, ensure settings exist
    await this.getLoyaltySettings(merchantId);

    // Update the settings
    const updatedSettings = await this.prisma.loyaltySettings.update({
      where: { merchantId },
      data: updateDto,
    });

    return updatedSettings;
  }

  async calculatePointsFromPurchase(
    merchantId: string,
    purchaseAmount: number,
    currency: 'USD' | 'IDR' = 'USD',
  ): Promise<number> {
    const settings = await this.getLoyaltySettings(merchantId);

    // Check minimum purchase requirement
    if (purchaseAmount < settings.minimumPurchase) {
      return 0;
    }

    // Calculate points based on currency and settings
    let points = 0;
    if (currency === 'USD') {
      points = Math.floor(purchaseAmount * settings.pointsPerDollar);
    } else if (currency === 'IDR') {
      points = Math.floor(purchaseAmount / settings.pointsPerRupiah);
    }

    return Math.max(0, points);
  }

  async getDefaultRewardPoints(merchantId: string): Promise<number> {
    const settings = await this.getLoyaltySettings(merchantId);
    return settings.defaultRewardPoints;
  }

  async canUserRedeemPoints(
    merchantId: string,
    userCurrentBalance: number,
    pointsToRedeem: number,
  ): Promise<boolean> {
    const settings = await this.getLoyaltySettings(merchantId);
    
    if (settings.allowNegativeBalance) {
      return true;
    }
    
    return userCurrentBalance >= pointsToRedeem;
  }
} 