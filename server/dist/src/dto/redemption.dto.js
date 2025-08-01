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
exports.RedemptionResponseDto = exports.ConfirmClaimDto = exports.VerifyClaimCodeDto = exports.RedeemRewardDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RedeemRewardDto {
    rewardId;
}
exports.RedeemRewardDto = RedeemRewardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward ID to redeem' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RedeemRewardDto.prototype, "rewardId", void 0);
class VerifyClaimCodeDto {
    claimCode;
}
exports.VerifyClaimCodeDto = VerifyClaimCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Claim code to verify' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyClaimCodeDto.prototype, "claimCode", void 0);
class ConfirmClaimDto {
    redemptionId;
}
exports.ConfirmClaimDto = ConfirmClaimDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Redemption ID to confirm' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmClaimDto.prototype, "redemptionId", void 0);
class RedemptionResponseDto {
    id;
    status;
    claimCode;
    redeemedAt;
    createdAt;
    updatedAt;
    userId;
    rewardId;
    rewardTitle;
    merchantId;
    merchantName;
    redeemedPoints;
}
exports.RedemptionResponseDto = RedemptionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "claimCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], RedemptionResponseDto.prototype, "redeemedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], RedemptionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], RedemptionResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "rewardId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "rewardTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RedemptionResponseDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RedemptionResponseDto.prototype, "redeemedPoints", void 0);
//# sourceMappingURL=redemption.dto.js.map