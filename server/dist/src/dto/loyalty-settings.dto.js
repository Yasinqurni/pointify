"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltySettingsResponseDto = exports.UpdateLoyaltySettingsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateLoyaltySettingsDto {
    pointsPerDollar;
    pointsPerRupiah;
    autoCalculate;
    minimumPurchase;
    defaultRewardPoints;
    expirationDays;
    allowNegativeBalance;
}
exports.UpdateLoyaltySettingsDto = UpdateLoyaltySettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points earned per dollar spent', example: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateLoyaltySettingsDto.prototype, "pointsPerDollar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points earned per rupiah spent', example: 10000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLoyaltySettingsDto.prototype, "pointsPerRupiah", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auto-calculate points based on purchase amount', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLoyaltySettingsDto.prototype, "autoCalculate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum purchase amount to earn points', example: 5.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLoyaltySettingsDto.prototype, "minimumPurchase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default points for manual rewards', example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], UpdateLoyaltySettingsDto.prototype, "defaultRewardPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points expiration in days', example: 365 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3650),
    __metadata("design:type", Number)
], UpdateLoyaltySettingsDto.prototype, "expirationDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Allow customers to go into negative balance', example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLoyaltySettingsDto.prototype, "allowNegativeBalance", void 0);
class LoyaltySettingsResponseDto {
    id;
    pointsPerDollar;
    pointsPerRupiah;
    autoCalculate;
    minimumPurchase;
    defaultRewardPoints;
    expirationDays;
    allowNegativeBalance;
    merchantId;
    createdAt;
    updatedAt;
}
exports.LoyaltySettingsResponseDto = LoyaltySettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoyaltySettingsResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoyaltySettingsResponseDto.prototype, "pointsPerDollar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoyaltySettingsResponseDto.prototype, "pointsPerRupiah", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], LoyaltySettingsResponseDto.prototype, "autoCalculate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoyaltySettingsResponseDto.prototype, "minimumPurchase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoyaltySettingsResponseDto.prototype, "defaultRewardPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoyaltySettingsResponseDto.prototype, "expirationDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], LoyaltySettingsResponseDto.prototype, "allowNegativeBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoyaltySettingsResponseDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoyaltySettingsResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoyaltySettingsResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=loyalty-settings.dto.js.map