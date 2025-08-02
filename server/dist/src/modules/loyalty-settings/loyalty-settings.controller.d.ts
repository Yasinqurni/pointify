import { LoyaltySettingsService } from './loyalty-settings.service';
import { UpdateLoyaltySettingsDto, LoyaltySettingsResponseDto } from '../../dto/loyalty-settings.dto';
export declare class LoyaltySettingsController {
    private readonly loyaltySettingsService;
    constructor(loyaltySettingsService: LoyaltySettingsService);
    getLoyaltySettings(req: any): Promise<LoyaltySettingsResponseDto>;
    updateLoyaltySettings(req: any, updateDto: UpdateLoyaltySettingsDto): Promise<LoyaltySettingsResponseDto>;
}
