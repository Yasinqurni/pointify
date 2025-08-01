import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.pointTransaction.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
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

  // Create sample merchants
  console.log('🏪 Creating sample merchants...');
  const merchants = await Promise.all([
    prisma.merchant.create({
      data: {
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
        name: 'Crypto Coffee Shop',
        description: 'Premium coffee and pastries with crypto rewards',
        logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a87c3?w=200',
      },
    }),
    prisma.merchant.create({
      data: {
        walletAddress: '0x8ba1f109551bD432803012645Hac136c772c3c8c',
        name: 'NFT Art Gallery',
        description: 'Digital art and collectibles marketplace',
        logoUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200',
      },
    }),
    prisma.merchant.create({
      data: {
        walletAddress: '0x1234567890123456789012345678901234567891',
        name: 'DeFi Trading Platform',
        description: 'Advanced trading tools and analytics',
        logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200',
      },
    }),
  ]);

  // Create sample rewards
  console.log('🎁 Creating sample rewards...');
  const rewards = await Promise.all([
    // Crypto Coffee Shop rewards
    prisma.reward.create({
      data: {
        title: 'Free Espresso',
        description: 'Get a free espresso with any purchase',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
        requiredPoints: 100,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
        merchantId: merchants[0].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'Free Coffee for a Week',
        description: 'One free coffee every day for a week',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300',
        requiredPoints: 500,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        merchantId: merchants[0].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'Buy 1 Get 1 Free',
        description: 'Buy any drink, get one free',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
        requiredPoints: 300,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        isActive: true,
        merchantId: merchants[0].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'Free Breakfast Sandwich',
        description: 'Get a free breakfast sandwich with any coffee',
        imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300',
        requiredPoints: 400,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        merchantId: merchants[0].id,
      },
    }),

    // NFT Art Gallery rewards
    prisma.reward.create({
      data: {
        title: '10% Off NFT Purchase',
        description: 'Get 10% off any NFT in our gallery',
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300',
        requiredPoints: 300,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        isActive: true,
        merchantId: merchants[1].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'Free Art Workshop',
        description: 'Join our digital art creation workshop',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300',
        requiredPoints: 800,
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        isActive: true,
        merchantId: merchants[1].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: '20% Off Limited Edition Prints',
        description: 'Get 20% off limited edition art prints',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
        requiredPoints: 600,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
        merchantId: merchants[1].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'Free Gallery Tour',
        description: 'Exclusive guided tour of our NFT gallery',
        imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300',
        requiredPoints: 250,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        merchantId: merchants[1].id,
      },
    }),

    // DeFi Trading Platform rewards
    prisma.reward.create({
      data: {
        title: 'Reduced Trading Fees',
        description: '50% off trading fees for one month',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300',
        requiredPoints: 400,
        expiryDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days
        isActive: true,
        merchantId: merchants[2].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'Premium Analytics Access',
        description: 'Access to advanced trading analytics for 30 days',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300',
        requiredPoints: 1000,
        expiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 150 days
        isActive: true,
        merchantId: merchants[2].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'Free Trading Course',
        description: 'Access to our premium trading course for 30 days',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300',
        requiredPoints: 700,
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        isActive: true,
        merchantId: merchants[2].id,
      },
    }),
    prisma.reward.create({
      data: {
        title: 'VIP Trading Signals',
        description: 'Get exclusive trading signals for one month',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300',
        requiredPoints: 1500,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        isActive: true,
        merchantId: merchants[2].id,
      },
    }),
  ]);

  // Create sample point transactions
  console.log('💰 Creating sample point transactions...');
  const transactions = await Promise.all([
    // Alice's transactions
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

    // Bob's transactions
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

    // Charlie's transactions
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

    // Diana's transactions
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

  // Create sample redemptions
  console.log('🎫 Creating sample redemptions...');
  const redemptions = await Promise.all([
    // Alice's redemptions
    prisma.redemption.create({
      data: {
        status: 'CLAIMED',
        claimCode: 'COFFEE123',
        redeemedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        userId: users[0].id,
        rewardId: rewards[0].id, // Free Espresso
        merchantId: merchants[0].id,
      },
    }),
    prisma.redemption.create({
      data: {
        status: 'PENDING',
        claimCode: 'NFTGALLERY456',
        userId: users[0].id,
        rewardId: rewards[5].id, // 10% Off NFT Purchase
        merchantId: merchants[1].id,
      },
    }),
    prisma.redemption.create({
      data: {
        status: 'PENDING',
        claimCode: 'BOGO789',
        userId: users[0].id,
        rewardId: rewards[3].id, // Buy 1 Get 1 Free
        merchantId: merchants[0].id,
      },
    }),

    // Bob's redemptions
    prisma.redemption.create({
      data: {
        status: 'CLAIMED',
        claimCode: 'TRADING2024',
        redeemedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        userId: users[1].id,
        rewardId: rewards[8].id, // Reduced Trading Fees
        merchantId: merchants[2].id,
      },
    }),
    prisma.redemption.create({
      data: {
        status: 'PENDING',
        claimCode: 'ARTWORKSHOP',
        userId: users[1].id,
        rewardId: rewards[6].id, // Free Art Workshop
        merchantId: merchants[1].id,
      },
    }),

    // Charlie's redemptions
    prisma.redemption.create({
      data: {
        status: 'CLAIMED',
        claimCode: 'PASTRY50',
        redeemedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        userId: users[2].id,
        rewardId: rewards[1].id, // 50% Off Pastry
        merchantId: merchants[0].id,
      },
    }),
    prisma.redemption.create({
      data: {
        status: 'PENDING',
        claimCode: 'GALLERYTOUR',
        userId: users[2].id,
        rewardId: rewards[7].id, // Free Gallery Tour
        merchantId: merchants[1].id,
      },
    }),
    prisma.redemption.create({
      data: {
        status: 'PENDING',
        claimCode: 'BREAKFASTFREE',
        userId: users[2].id,
        rewardId: rewards[4].id, // Free Breakfast Sandwich
        merchantId: merchants[0].id,
      },
    }),

    // Diana's redemptions
    prisma.redemption.create({
      data: {
        status: 'CLAIMED',
        claimCode: 'ANALYTICSVIP',
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        userId: users[3].id,
        rewardId: rewards[9].id, // Premium Analytics Access
        merchantId: merchants[2].id,
      },
    }),
    prisma.redemption.create({
      data: {
        status: 'PENDING',
        claimCode: 'TRADINGCOURSE',
        userId: users[3].id,
        rewardId: rewards[10].id, // Free Trading Course
        merchantId: merchants[2].id,
      },
    }),
    prisma.redemption.create({
      data: {
        status: 'PENDING',
        claimCode: 'PRINTS20OFF',
        userId: users[3].id,
        rewardId: rewards[6].id, // 20% Off Limited Edition Prints
        merchantId: merchants[1].id,
      },
    }),
  ]);

  // Create point transactions for redemptions
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
  console.log('Crypto Coffee Shop:', merchants[0].walletAddress);
  console.log('NFT Art Gallery:', merchants[1].walletAddress);
  console.log('DeFi Trading Platform:', merchants[2].walletAddress);

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