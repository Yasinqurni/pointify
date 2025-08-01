const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🎬 Treasury Flow Demo");
    console.log("=".repeat(50));
    console.log("");

    // Get signers
    const [deployer, merchant1, merchant2, user1, user2] = await ethers.getSigners();
    
    console.log("👥 Demo Participants:");
    console.log(`   🏛️  Admin/Deployer: ${deployer.address}`);
    console.log(`   🏪  Merchant 1: ${merchant1.address}`);
    console.log(`   🏪  Merchant 2: ${merchant2.address}`);
    console.log(`   👤  User 1: ${user1.address}`);
    console.log(`   👤  User 2: ${user2.address}`);
    console.log("");

    // Contract addresses
    const POINTIFY_TOKEN_ADDRESS = process.env.POINTIFY_TOKEN_ADDRESS;
    const TREASURY_MANAGER_ADDRESS = process.env.TREASURY_MANAGER_ADDRESS;
    const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
    const IDRX_TOKEN_ADDRESS = process.env.IDRX_TOKEN_ADDRESS;

    if (!POINTIFY_TOKEN_ADDRESS || !TREASURY_MANAGER_ADDRESS || !TREASURY_ADDRESS || !IDRX_TOKEN_ADDRESS) {
        console.log("❌ Missing contract addresses. Please deploy contracts first.");
        return;
    }

    try {
        // Get contract instances
        const PointifyToken = await ethers.getContractFactory("PointifyToken");
        const pointifyToken = PointifyToken.attach(POINTIFY_TOKEN_ADDRESS);

        const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
        const treasuryManager = TreasuryManager.attach(TREASURY_MANAGER_ADDRESS);

        const Treasury = await ethers.getContractFactory("Treasury");
        const treasury = Treasury.attach(TREASURY_ADDRESS);

        const IDRX = await ethers.getContractAt("IERC20", IDRX_TOKEN_ADDRESS);

        console.log("📋 Contract Addresses:");
        console.log(`   🪙  PointifyToken: ${POINTIFY_TOKEN_ADDRESS}`);
        console.log(`   🏦  TreasuryManager: ${TREASURY_MANAGER_ADDRESS}`);
        console.log(`   💰  Treasury: ${TREASURY_ADDRESS}`);
        console.log(`   💵  IDRX Token: ${IDRX_TOKEN_ADDRESS}`);
        console.log("");

        // Helper function to display balances
        async function displayBalances(title) {
            console.log(`📊 ${title}:`);
            
            const merchant1IDRX = await IDRX.balanceOf(merchant1.address);
            const merchant2IDRX = await IDRX.balanceOf(merchant2.address);
            const user1IDRX = await IDRX.balanceOf(user1.address);
            const user2IDRX = await IDRX.balanceOf(user2.address);
            const treasuryIDRX = await treasury.getIDRXBalance();
            
            const merchant1PLT = await pointifyToken.balanceOf(merchant1.address);
            const merchant2PLT = await pointifyToken.balanceOf(merchant2.address);
            const user1PLT = await pointifyToken.balanceOf(user1.address);
            const user2PLT = await pointifyToken.balanceOf(user2.address);
            const totalSupply = await pointifyToken.totalSupply();

            console.log("   💵 IDRX Balances:");
            console.log(`      • Merchant 1: ${ethers.formatEther(merchant1IDRX)} IDRX`);
            console.log(`      • Merchant 2: ${ethers.formatEther(merchant2IDRX)} IDRX`);
            console.log(`      • User 1: ${ethers.formatEther(user1IDRX)} IDRX`);
            console.log(`      • User 2: ${ethers.formatEther(user2IDRX)} IDRX`);
            console.log(`      • Treasury: ${ethers.formatEther(treasuryIDRX)} IDRX`);
            console.log("");
            console.log("   🪙 PLT Balances:");
            console.log(`      • Merchant 1: ${ethers.formatEther(merchant1PLT)} PLT`);
            console.log(`      • Merchant 2: ${ethers.formatEther(merchant2PLT)} PLT`);
            console.log(`      • User 1: ${ethers.formatEther(user1PLT)} PLT`);
            console.log(`      • User 2: ${ethers.formatEther(user2PLT)} PLT`);
            console.log(`      • Total Supply: ${ethers.formatEther(totalSupply)} PLT`);
            console.log("");
        }

        // Initial state
        await displayBalances("Initial State");

        // Setup: Give participants some IDRX for demo
        console.log("🎯 Demo Setup: Distributing IDRX");
        const setupAmount = ethers.parseEther("1000");
        
        try {
            // Assuming deployer has IDRX to distribute
            const deployerBalance = await IDRX.balanceOf(deployer.address);
            if (deployerBalance >= setupAmount * 4n) {
                await IDRX.transfer(merchant1.address, setupAmount);
                await IDRX.transfer(merchant2.address, setupAmount);
                await IDRX.transfer(user1.address, setupAmount);
                await IDRX.transfer(user2.address, setupAmount);
                console.log("   ✅ IDRX distributed to all participants");
            } else {
                console.log("   ⚠️ Deployer doesn't have enough IDRX for full demo");
            }
        } catch (error) {
            console.log("   ⚠️ Could not distribute IDRX:", error.message);
        }
        console.log("");

        // Scene 0: Mint IDRX-Mock to merchants (required for registration)
        console.log("💰 Scene 0: Mint IDRX-Mock to Merchants");
        console.log("-".repeat(30));
        console.log("   • Minting IDRX-Mock to merchants for registration requirement...");
        const idrxMockContract = await ethers.getContractAt("IDRXMock", IDRX_TOKEN_ADDRESS);
        const mintAmount = ethers.parseEther("100000"); // 100K IDRX-MOCK
        const mintTx1 = await idrxMockContract.mint(merchant1.address, mintAmount);
        await mintTx1.wait();
        const mintTx2 = await idrxMockContract.mint(merchant2.address, mintAmount);
        await mintTx2.wait();
        console.log("   ✅ Minted", ethers.formatEther(mintAmount), "IDRX-MOCK to each merchant");
        console.log("");

        // Scene 1: Merchant Registration
        console.log("🎬 Scene 1: Merchant Registration");
        console.log("-".repeat(30));
        
        console.log("   📝 Admin registers merchants...");
        await treasuryManager.registerMerchant(merchant1.address, true);
        await treasuryManager.registerMerchant(merchant2.address, true);
        console.log("   ✅ Both merchants registered successfully");
        console.log("");

        // Scene 2: Merchants Swap IDRX → PLT
        console.log("🎬 Scene 2: Merchants Get PLT Tokens");
        console.log("-".repeat(30));
        
        const swapAmount1 = ethers.parseEther("500"); // Merchant 1 swaps 500 IDRX
        const swapAmount2 = ethers.parseEther("300"); // Merchant 2 swaps 300 IDRX
        
        console.log("   🏪 Merchant 1 swaps 500 IDRX → PLT...");
        await IDRX.connect(merchant1).approve(TREASURY_MANAGER_ADDRESS, swapAmount1);
        await treasuryManager.connect(merchant1).swapIDRXToPLT(swapAmount1);
        console.log("   ✅ Merchant 1 swap completed");
        
        console.log("   🏪 Merchant 2 swaps 300 IDRX → PLT...");
        await IDRX.connect(merchant2).approve(TREASURY_MANAGER_ADDRESS, swapAmount2);
        await treasuryManager.connect(merchant2).swapIDRXToPLT(swapAmount2);
        console.log("   ✅ Merchant 2 swap completed");
        console.log("");

        await displayBalances("After Merchants Get PLT");

        // Scene 3: Merchants Reward Users
        console.log("🎬 Scene 3: Merchants Reward Users");
        console.log("-".repeat(30));
        
        console.log("   🎁 Merchant 1 rewards User 1 with 100 PLT...");
        await treasuryManager.connect(merchant1).sendReward(user1.address, ethers.parseEther("100"));
        console.log("   ✅ User 1 received reward");
        
        console.log("   🎁 Merchant 1 rewards User 2 with 50 PLT...");
        await treasuryManager.connect(merchant1).sendReward(user2.address, ethers.parseEther("50"));
        console.log("   ✅ User 2 received reward");
        
        console.log("   🎁 Merchant 2 rewards User 1 with 75 PLT...");
        await treasuryManager.connect(merchant2).sendReward(user1.address, ethers.parseEther("75"));
        console.log("   ✅ User 1 received additional reward");
        console.log("");

        await displayBalances("After Rewards Distribution");

        // Scene 4: Users Redeem to Merchants
        console.log("🎬 Scene 4: Users Redeem Points");
        console.log("-".repeat(30));
        
        console.log("   🔄 User 1 redeems 50 PLT to Merchant 1...");
        await treasuryManager.connect(user1).redeemToMerchant(merchant1.address, ethers.parseEther("50"));
        console.log("   ✅ User 1 redemption completed");
        
        console.log("   🔄 User 2 redeems 25 PLT to Merchant 2...");
        await treasuryManager.connect(user2).redeemToMerchant(merchant2.address, ethers.parseEther("25"));
        console.log("   ✅ User 2 redemption completed");
        console.log("");

        await displayBalances("After Redemptions");

        // Scene 5: Users Cash Out PLT → IDRX
        console.log("🎬 Scene 5: Users Cash Out to IDRX");
        console.log("-".repeat(30));
        
        console.log("   💸 User 1 swaps 100 PLT → IDRX...");
        await treasuryManager.connect(user1).swapPLTToIDRX(ethers.parseEther("100"));
        console.log("   ✅ User 1 cash out completed");
        
        console.log("   💸 User 2 swaps 25 PLT → IDRX...");
        await treasuryManager.connect(user2).swapPLTToIDRX(ethers.parseEther("25"));
        console.log("   ✅ User 2 cash out completed");
        console.log("");

        await displayBalances("Final State");

        // Demo Summary
        console.log("🎉 Demo Summary");
        console.log("=".repeat(50));
        console.log("");
        console.log("✅ Successfully demonstrated:");
        console.log("   1. ✅ Merchant registration by admin");
        console.log("   2. ✅ Merchants swapping IDRX → PLT (minting)");
        console.log("   3. ✅ IDRX going to Treasury during minting");
        console.log("   4. ✅ Merchants rewarding users with PLT");
        console.log("   5. ✅ Users redeeming PLT back to merchants");
        console.log("   6. ✅ Users swapping PLT → IDRX (burning)");
        console.log("   7. ✅ IDRX coming from Treasury during burning");
        console.log("");
        
        console.log("🔍 Key Observations:");
        console.log("   • PLT tokens are minted when merchants swap IDRX → PLT");
        console.log("   • IDRX is stored in Treasury during minting");
        console.log("   • PLT tokens are burned when users swap PLT → IDRX");
        console.log("   • IDRX is released from Treasury during burning");
        console.log("   • 1:1 ratio maintained between PLT and IDRX backing");
        console.log("   • Treasury acts as the central reserve");
        console.log("");

        console.log("🎯 Treasury Flow Benefits:");
        console.log("   • ✅ Centralized IDRX backing");
        console.log("   • ✅ Controlled token supply");
        console.log("   • ✅ Transparent reserves");
        console.log("   • ✅ Flexible merchant operations");
        console.log("   • ✅ User cash-out guarantee");

    } catch (error) {
        console.error("❌ Demo failed:", error.message);
        console.error(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });