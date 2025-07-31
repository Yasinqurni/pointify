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
exports.MerchantBalanceResponseDto = exports.UserBalanceResponseDto = exports.PointsTransactionResponseDto = exports.IssuePointsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class IssuePointsDto {
    userWalletAddress;
    points;
}
exports.IssuePointsDto = IssuePointsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User wallet address to issue points to' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IssuePointsDto.prototype, "userWalletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of points to issue' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], IssuePointsDto.prototype, "points", void 0);
class PointsTransactionResponseDto {
    id;
    amount;
    type;
    createdAt;
    userId;
    merchantId;
    redemptionId;
}
exports.PointsTransactionResponseDto = PointsTransactionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PointsTransactionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PointsTransactionResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PointsTransactionResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PointsTransactionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PointsTransactionResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PointsTransactionResponseDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PointsTransactionResponseDto.prototype, "redemptionId", void 0);
class UserBalanceResponseDto {
    walletAddress;
    loyaltyPoints;
    totalReceived;
    totalSpent;
}
exports.UserBalanceResponseDto = UserBalanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBalanceResponseDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserBalanceResponseDto.prototype, "loyaltyPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserBalanceResponseDto.prototype, "totalReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserBalanceResponseDto.prototype, "totalSpent", void 0);
class MerchantBalanceResponseDto {
    walletAddress;
    idrxBalance;
    loyalBalance;
    totalRewarded;
}
exports.MerchantBalanceResponseDto = MerchantBalanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantBalanceResponseDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MerchantBalanceResponseDto.prototype, "idrxBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MerchantBalanceResponseDto.prototype, "loyalBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MerchantBalanceResponseDto.prototype, "totalRewarded", void 0);
//# sourceMappingURL=points.dto.js.map