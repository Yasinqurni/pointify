"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('🧹 Clearing existing data...');
    await prisma.pointTransaction.deleteMany();
    await prisma.redemption.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.merchant.deleteMany();
    await prisma.user.deleteMany();
    console.log('👥 Creating sample users...');
    const users = await Promise.all([
        prisma.user.create({
            data: {
                walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            },
        }),
        prisma.user.create({
            data: {
                walletAddress: '0x8ba1f109551bD432803012645Hac136c772c3c7c',
            },
        }),
        prisma.user.create({
            data: {
                walletAddress: '0x1234567890123456789012345678901234567890',
            },
        }),
        prisma.user.create({
            data: {
                walletAddress: '0x9876543210987654321098765432109876543210',
            },
        }),
    ]);
    console.log('🏪 Creating sample merchants...');
    const merchants = await Promise.all([
        prisma.merchant.create({
            data: {
                walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
                name: 'Sweet Dreams Donuts',
                description: 'Fresh donuts and pastries with crypto rewards',
                logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a87c3?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0x8ba1f109551bD432803012645Hac136c772c3c8c',
                name: 'Ice Cream Paradise',
                description: 'Artisanal ice cream and frozen treats',
                logoUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0x1234567890123456789012345678901234567891',
                name: 'Pizza Palace',
                description: 'Authentic Italian pizza and pasta',
                logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0x9876543210987654321098765432109876543211',
                name: 'Burger House',
                description: 'Gourmet burgers and fries',
                logoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                name: 'Sushi Express',
                description: 'Fresh sushi and Japanese cuisine',
                logoUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0xfedcba0987654321fedcba0987654321fedcba09',
                name: 'Taco Town',
                description: 'Authentic Mexican tacos and burritos',
                logoUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0x1111111111111111111111111111111111111111',
                name: 'Coffee Corner',
                description: 'Premium coffee and espresso drinks',
                logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0x2222222222222222222222222222222222222222',
                name: 'Bakery Bliss',
                description: 'Fresh bread, cakes, and pastries',
                logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
            },
        }),
        prisma.merchant.create({
            data: {
                walletAddress: '0x3333333333333333333333333333333333333333',
                name: 'Noodle House',
                description: 'Asian noodles and stir-fry dishes',
                logoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200',
            },
        }),
    ]);
    console.log('🎁 Creating sample rewards...');
    const rewards = await Promise.all([
        prisma.reward.create({
            data: {
                title: '🆓 FREE Sample Donut',
                description: 'Completely free sample donut - no points required!',
                imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300',
                requiredPoints: 0,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[0].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '🆓 FREE Coffee Sample',
                description: 'Try our coffee for free - zero points needed!',
                imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300',
                requiredPoints: 0,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[6].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '🆓 FREE Ice Cream Sample',
                description: 'Taste test any flavor - completely free!',
                imageUrl: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=300',
                requiredPoints: 0,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[1].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '🆓 FREE Loyalty Welcome Gift',
                description: 'Welcome to our loyalty program - free for joining!',
                imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300',
                requiredPoints: 0,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[2].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '🆓 FREE QR Code Test',
                description: 'Test the QR code redemption system - totally free!',
                imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
                requiredPoints: 0,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[3].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Donut',
                description: 'Get a free donut with any purchase',
                imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a87c3?w=300',
                requiredPoints: 100,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[0].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Pastry',
                description: 'Half price on any pastry',
                imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
                requiredPoints: 200,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[0].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Buy 1 Get 1 Free Donuts',
                description: 'Buy any donut, get one free',
                imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300',
                requiredPoints: 300,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[0].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Ice Cream Cone',
                description: 'Get a free ice cream cone with any purchase',
                imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300',
                requiredPoints: 150,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[1].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Sundae',
                description: 'Half price on any ice cream sundae',
                imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300',
                requiredPoints: 250,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[1].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Milkshake',
                description: 'Get a free milkshake with any ice cream',
                imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300',
                requiredPoints: 400,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[1].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Pizza Slice',
                description: 'Get a free pizza slice with any order',
                imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
                requiredPoints: 200,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[2].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Large Pizza',
                description: 'Half price on any large pizza',
                imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
                requiredPoints: 500,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[2].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Garlic Bread',
                description: 'Get free garlic bread with any pizza',
                imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
                requiredPoints: 150,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[2].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Burger',
                description: 'Get a free burger with any order',
                imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
                requiredPoints: 300,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[3].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Combo Meal',
                description: 'Half price on any combo meal',
                imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
                requiredPoints: 400,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[3].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Fries',
                description: 'Get free fries with any burger',
                imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
                requiredPoints: 100,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[3].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Sushi Roll',
                description: 'Get a free sushi roll with any order',
                imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300',
                requiredPoints: 250,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[4].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Sashimi',
                description: 'Half price on any sashimi plate',
                imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300',
                requiredPoints: 350,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[4].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Miso Soup',
                description: 'Get free miso soup with any sushi',
                imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300',
                requiredPoints: 75,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[4].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Taco',
                description: 'Get a free taco with any order',
                imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300',
                requiredPoints: 120,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[5].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Burrito',
                description: 'Half price on any burrito',
                imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300',
                requiredPoints: 200,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[5].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Guacamole',
                description: 'Get free guacamole with any taco',
                imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300',
                requiredPoints: 80,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[5].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Coffee',
                description: 'Get a free coffee with any purchase',
                imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
                requiredPoints: 100,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[6].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Latte',
                description: 'Half price on any latte',
                imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
                requiredPoints: 150,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[6].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Pastry',
                description: 'Get a free pastry with any coffee',
                imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
                requiredPoints: 120,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[6].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Croissant',
                description: 'Get a free croissant with any purchase',
                imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
                requiredPoints: 80,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[7].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Cake',
                description: 'Half price on any cake',
                imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
                requiredPoints: 300,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[7].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Bread',
                description: 'Get a free bread with any pastry',
                imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
                requiredPoints: 100,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[7].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Noodle Bowl',
                description: 'Get a free noodle bowl with any order',
                imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
                requiredPoints: 200,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[8].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: '50% Off Stir Fry',
                description: 'Half price on any stir fry dish',
                imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
                requiredPoints: 250,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[8].id,
            },
        }),
        prisma.reward.create({
            data: {
                title: 'Free Spring Rolls',
                description: 'Get free spring rolls with any noodle dish',
                imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
                requiredPoints: 150,
                expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                merchantId: merchants[8].id,
            },
        }),
    ]);
    console.log('💰 Creating sample point transactions...');
    const transactions = await Promise.all([
        prisma.pointTransaction.create({
            data: {
                amount: 500,
                type: 'RECEIVED',
                userId: users[0].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 300,
                type: 'RECEIVED',
                userId: users[0].id,
                merchantId: merchants[1].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: -100,
                type: 'SPENT',
                userId: users[0].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 200,
                type: 'RECEIVED',
                userId: users[1].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 600,
                type: 'RECEIVED',
                userId: users[1].id,
                merchantId: merchants[2].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 1000,
                type: 'RECEIVED',
                userId: users[2].id,
                merchantId: merchants[1].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 800,
                type: 'RECEIVED',
                userId: users[2].id,
                merchantId: merchants[2].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 700,
                type: 'RECEIVED',
                userId: users[2].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 1200,
                type: 'RECEIVED',
                userId: users[3].id,
                merchantId: merchants[2].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 800,
                type: 'RECEIVED',
                userId: users[3].id,
                merchantId: merchants[1].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: 1200,
                type: 'RECEIVED',
                userId: users[3].id,
                merchantId: merchants[0].id,
            },
        }),
    ]);
    console.log('🎫 Creating sample redemptions...');
    const redemptions = await Promise.all([
        prisma.redemption.create({
            data: {
                status: 'CLAIMED',
                claimCode: 'COFFEE123',
                redeemedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                userId: users[0].id,
                rewardId: rewards[0].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'PENDING',
                claimCode: 'NFTGALLERY456',
                userId: users[0].id,
                rewardId: rewards[5].id,
                merchantId: merchants[1].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'PENDING',
                claimCode: 'BOGO789',
                userId: users[0].id,
                rewardId: rewards[3].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'CLAIMED',
                claimCode: 'TRADING2024',
                redeemedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                userId: users[1].id,
                rewardId: rewards[8].id,
                merchantId: merchants[2].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'PENDING',
                claimCode: 'ARTWORKSHOP',
                userId: users[1].id,
                rewardId: rewards[6].id,
                merchantId: merchants[1].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'CLAIMED',
                claimCode: 'PASTRY50',
                redeemedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                userId: users[2].id,
                rewardId: rewards[1].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'PENDING',
                claimCode: 'GALLERYTOUR',
                userId: users[2].id,
                rewardId: rewards[7].id,
                merchantId: merchants[1].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'PENDING',
                claimCode: 'BREAKFASTFREE',
                userId: users[2].id,
                rewardId: rewards[4].id,
                merchantId: merchants[0].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'CLAIMED',
                claimCode: 'ANALYTICSVIP',
                redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                userId: users[3].id,
                rewardId: rewards[9].id,
                merchantId: merchants[2].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'PENDING',
                claimCode: 'TRADINGCOURSE',
                userId: users[3].id,
                rewardId: rewards[10].id,
                merchantId: merchants[2].id,
            },
        }),
        prisma.redemption.create({
            data: {
                status: 'PENDING',
                claimCode: 'PRINTS20OFF',
                userId: users[3].id,
                rewardId: rewards[6].id,
                merchantId: merchants[1].id,
            },
        }),
    ]);
    console.log('💸 Creating redemption point transactions...');
    await Promise.all([
        prisma.pointTransaction.create({
            data: {
                amount: -100,
                type: 'SPENT',
                userId: users[0].id,
                merchantId: merchants[0].id,
                redemptionId: redemptions[0].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: -300,
                type: 'SPENT',
                userId: users[0].id,
                merchantId: merchants[1].id,
                redemptionId: redemptions[1].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: -400,
                type: 'SPENT',
                userId: users[1].id,
                merchantId: merchants[2].id,
                redemptionId: redemptions[2].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: -200,
                type: 'SPENT',
                userId: users[2].id,
                merchantId: merchants[0].id,
                redemptionId: redemptions[3].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: -800,
                type: 'SPENT',
                userId: users[2].id,
                merchantId: merchants[1].id,
                redemptionId: redemptions[4].id,
            },
        }),
        prisma.pointTransaction.create({
            data: {
                amount: -1000,
                type: 'SPENT',
                userId: users[3].id,
                merchantId: merchants[2].id,
                redemptionId: redemptions[5].id,
            },
        }),
    ]);
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Users created: ${users.length}`);
    console.log(`🏪 Merchants created: ${merchants.length}`);
    console.log(`🎁 Rewards created: ${rewards.length}`);
    console.log(`💰 Point transactions created: ${transactions.length}`);
    console.log(`🎫 Redemptions created: ${redemptions.length}`);
    console.log('\n🔑 Sample Wallet Addresses:');
    console.log('User 1:', users[0].walletAddress);
    console.log('User 2:', users[1].walletAddress);
    console.log('User 3:', users[2].walletAddress);
    console.log('User 4:', users[3].walletAddress);
    console.log('\n🏪 Sample Merchant Addresses:');
    console.log('Sweet Dreams Donuts:', merchants[0].walletAddress);
    console.log('Ice Cream Paradise:', merchants[1].walletAddress);
    console.log('Pizza Palace:', merchants[2].walletAddress);
    console.log('Burger House:', merchants[3].walletAddress);
    console.log('Sushi Express:', merchants[4].walletAddress);
    console.log('Taco Town:', merchants[5].walletAddress);
    console.log('Coffee Corner:', merchants[6].walletAddress);
    console.log('Bakery Bliss:', merchants[7].walletAddress);
    console.log('Noodle House:', merchants[8].walletAddress);
    console.log('\n🎫 Sample Claim Codes:');
    console.log('ABC12345 - User 1\'s claimed espresso');
    console.log('DEF67890 - User 1\'s pending NFT discount');
    console.log('GHI11111 - User 2\'s claimed trading fee reduction');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map