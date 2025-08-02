const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🧪 Testing Treasury Flow...");
    console.log("");

    // Get signers
    const [deployer, merchant, user] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    console.log("🏪 Merchant:", merchant.address);
    console.log("👥 User:", user.address);
    console.log("");

    // Contract addresses from environment
    const POINTIFY_TOKEN_ADDRESS = process.env.POINTIFY_TOKEN_ADDRESS;
    const TREASURY_MANAGER_ADDRESS = process.env.TREASURY_MANAGER_ADDRESS;
    const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
    const IDRX_TOKEN_ADDRESS = process.env.IDRX_TOKEN_ADDRESS;

    if (!POINTIFY_TOKEN_ADDRESS || !TREASURY_MANAGER_ADDRESS || !TREASURY_ADDRESS || !IDRX_TOKEN_ADDRESS) {
        console.log("❌ Missing contract addresses in environment variables");
        console.log("Required: POINTIFY_TOKEN_ADDRESS, TREASURY_MANAGER_ADDRESS, TREASURY_ADDRESS, IDRX_TOKEN_ADDRESS");
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

        // Mock IDRX token (assuming it's an ERC20)
        const IDRX = await ethers.getContractAt("IERC20", IDRX_TOKEN_ADDRESS);

        console.log("📋 Initial State:");
        
        // Check initial balances
        const merchantIDRXBalance = await IDRX.balanceOf(merchant.address);
        const userIDRXBalance = await IDRX.balanceOf(user.address);
        const treasuryIDRXBalance = await treasury.getIDRXBalance();
        
        const merchantPLTBalance = await pointifyToken.balanceOf(merchant.address);
        const userPLTBalance = await pointifyToken.balanceOf(user.address);
        const totalSupply = await pointifyToken.totalSupply();

        console.log("💰 IDRX Balances:");
        console.log(`   • Merchant: ${ethers.formatEther(merchantIDRXBalance)} IDRX`);
        console.log(`   • User: ${ethers.formatEther(userIDRXBalance)} IDRX`);
        console.log(`   • Treasury: ${ethers.formatEther(treasuryIDRXBalance)} IDRX`);
        console.log("");
        console.log("🪙 PLT Balances:");
        console.log(`   • Merchant: ${ethers.formatEther(merchantPLTBalance)} PLT`);
        console.log(`   • User: ${ethers.formatEther(userPLTBalance)} PLT`);
        console.log(`   • Total Supply: ${ethers.formatEther(totalSupply)} PLT`);
        console.log("");

        // Step 0: Mint IDRX-Mock to merchant (required for registration)
        console.log("💰 Step 0: Minting IDRX-Mock to merchant for registration...");
        const idrxMockContract = await ethers.getContractAt("IDRXMock", idrxTokenAddress);
        const mintAmount = ethers.parseEther("100000"); // 100K IDRX-MOCK
        const mintTx = await idrxMockContract.mint(merchant.address, mintAmount);
        await mintTx.wait();
        console.log("✅ Minted", ethers.formatEther(mintAmount), "IDRX-MOCK to merchant");

        // Verify merchant has IDRX-Mock balance
        const merchantInitialIDRXBalance = await idrxMockContract.balanceOf(merchant.address);
        console.log("📊 Merchant IDRX-Mock balance:", ethers.formatEther(merchantInitialIDRXBalance));

        // Step 1: Register merchant
        console.log("🏪 Step 1: Register Merchant");
        const isRegisteredBefore = await treasuryManager.registeredMerchants(merchant.address);
        console.log(`   • Merchant registered before: ${isRegisteredBefore}`);
        
        if (!isRegisteredBefore) {
            const registerTx = await treasuryManager.registerMerchant(merchant.address, true);
            await registerTx.wait();
            console.log("   ✅ Merchant registered successfully");
        } else {
            console.log("   ✅ Merchant already registered");
        }
        console.log("");

        // Step 2: Give merchant some IDRX for testing (if needed)
        const swapAmount = ethers.parseEther("100"); // 100 IDRX
        
        if (merchantIDRXBalance < swapAmount) {
            console.log("💸 Giving merchant IDRX for testing...");
            // This assumes we have a way to mint IDRX or transfer from deployer
            // In real scenario, merchant would already have IDRX
            try {
                // Try to transfer from deployer if they have IDRX
                const deployerIDRXBalance = await IDRX.balanceOf(deployer.address);
                if (deployerIDRXBalance >= swapAmount) {
                    const transferTx = await IDRX.transfer(merchant.address, swapAmount);
                    await transferTx.wait();
                    console.log("   ✅ Transferred IDRX to merchant");
                } else {
                    console.log("   ⚠️ Deployer doesn't have enough IDRX, skipping transfer");
                }
            } catch (error) {
                console.log("   ⚠️ Could not transfer IDRX to merchant:", error.message);
            }
        }
        console.log("");

        // Step 3: Merchant swaps IDRX → PLT
        console.log("🔄 Step 2: Merchant Swap IDRX → PLT");
        const merchantCurrentIDRX = await IDRX.balanceOf(merchant.address);
        console.log(`   • Merchant IDRX balance: ${ethers.formatEther(merchantCurrentIDRX)} IDRX`);
        
        if (merchantCurrentIDRX >= swapAmount) {
            // Approve IDRX spending
            console.log("   • Approving IDRX spending...");
            const approveTx = await IDRX.connect(merchant).approve(TREASURY_MANAGER_ADDRESS, swapAmount);
            await approveTx.wait();
            console.log("   ✅ IDRX approved");

            // Swap IDRX to PLT
            console.log("   • Swapping IDRX to PLT...");
            const swapTx = await treasuryManager.connect(merchant).swapIDRXToPLT(swapAmount);
            await swapTx.wait();
            console.log("   ✅ Swap completed");

            // Check balances after swap
            const merchantIDRXAfter = await IDRX.balanceOf(merchant.address);
            const merchantPLTAfter = await pointifyToken.balanceOf(merchant.address);
            const treasuryIDRXAfter = await treasury.getIDRXBalance();
            const totalSupplyAfter = await pointifyToken.totalSupply();

            console.log("   📊 After swap:");
            console.log(`   • Merchant IDRX: ${ethers.formatEther(merchantIDRXAfter)} IDRX`);
            console.log(`   • Merchant PLT: ${ethers.formatEther(merchantPLTAfter)} PLT`);
            console.log(`   • Treasury IDRX: ${ethers.formatEther(treasuryIDRXAfter)} IDRX`);
            console.log(`   • Total PLT Supply: ${ethers.formatEther(totalSupplyAfter)} PLT`);
        } else {
            console.log("   ⚠️ Merchant doesn't have enough IDRX for swap");
        }
        console.log("");

        // Step 4: Merchant sends reward to user
        console.log("🎁 Step 3: Merchant Send Reward to User");
        const rewardAmount = ethers.parseEther("50"); // 50 PLT
        const merchantPLTCurrent = await pointifyToken.balanceOf(merchant.address);
        
        if (merchantPLTCurrent >= rewardAmount) {
            console.log(`   • Sending ${ethers.formatEther(rewardAmount)} PLT reward to user...`);
            const rewardTx = await treasuryManager.connect(merchant).sendReward(user.address, rewardAmount);
            await rewardTx.wait();
            console.log("   ✅ Reward sent");

            // Check balances after reward
            const merchantPLTAfterReward = await pointifyToken.balanceOf(merchant.address);
            const userPLTAfterReward = await pointifyToken.balanceOf(user.address);

            console.log("   📊 After reward:");
            console.log(`   • Merchant PLT: ${ethers.formatEther(merchantPLTAfterReward)} PLT`);
            console.log(`   • User PLT: ${ethers.formatEther(userPLTAfterReward)} PLT`);
        } else {
            console.log("   ⚠️ Merchant doesn't have enough PLT for reward");
        }
        console.log("");

        // Step 5: User redeems to merchant
        console.log("🔄 Step 4: User Redeem to Merchant");
        const redeemAmount = ethers.parseEther("20"); // 20 PLT
        const userPLTCurrent = await pointifyToken.balanceOf(user.address);
        
        if (userPLTCurrent >= redeemAmount) {
            console.log(`   • User redeeming ${ethers.formatEther(redeemAmount)} PLT to merchant...`);
            const redeemTx = await treasuryManager.connect(user).redeemToMerchant(merchant.address, redeemAmount);
            await redeemTx.wait();
            console.log("   ✅ Redemption completed");

            // Check balances after redemption
            const merchantPLTAfterRedeem = await pointifyToken.balanceOf(merchant.address);
            const userPLTAfterRedeem = await pointifyToken.balanceOf(user.address);

            console.log("   📊 After redemption:");
            console.log(`   • Merchant PLT: ${ethers.formatEther(merchantPLTAfterRedeem)} PLT`);
            console.log(`   • User PLT: ${ethers.formatEther(userPLTAfterRedeem)} PLT`);
        } else {
            console.log("   ⚠️ User doesn't have enough PLT for redemption");
        }
        console.log("");

        // Step 6: User swaps PLT → IDRX
        console.log("🔄 Step 5: User Swap PLT → IDRX");
        const swapBackAmount = ethers.parseEther("10"); // 10 PLT
        const userPLTFinal = await pointifyToken.balanceOf(user.address);
        
        if (userPLTFinal >= swapBackAmount) {
            console.log(`   • User swapping ${ethers.formatEther(swapBackAmount)} PLT to IDRX...`);
            const swapBackTx = await treasuryManager.connect(user).swapPLTToIDRX(swapBackAmount);
            await swapBackTx.wait();
            console.log("   ✅ Swap completed");

            // Check final balances
            const userIDRXFinal = await IDRX.balanceOf(user.address);
            const userPLTFinalAfterSwap = await pointifyToken.balanceOf(user.address);
            const treasuryIDRXFinal = await treasury.getIDRXBalance();
            const totalSupplyFinal = await pointifyToken.totalSupply();

            console.log("   📊 After swap:");
            console.log(`   • User IDRX: ${ethers.formatEther(userIDRXFinal)} IDRX`);
            console.log(`   • User PLT: ${ethers.formatEther(userPLTFinalAfterSwap)} PLT`);
            console.log(`   • Treasury IDRX: ${ethers.formatEther(treasuryIDRXFinal)} IDRX`);
            console.log(`   • Total PLT Supply: ${ethers.formatEther(totalSupplyFinal)} PLT`);
        } else {
            console.log("   ⚠️ User doesn't have enough PLT for swap");
        }
        console.log("");

        console.log("🎉 Treasury Flow Test Complete!");
        console.log("");

        // Final summary
        console.log("📊 Final Summary:");
        const finalMerchantIDRX = await IDRX.balanceOf(merchant.address);
        const finalUserIDRX = await IDRX.balanceOf(user.address);
        const finalTreasuryIDRX = await treasury.getIDRXBalance();
        const finalMerchantPLT = await pointifyToken.balanceOf(merchant.address);
        const finalUserPLT = await pointifyToken.balanceOf(user.address);
        const finalTotalSupply = await pointifyToken.totalSupply();

        console.log("💰 Final IDRX Balances:");
        console.log(`   • Merchant: ${ethers.formatEther(finalMerchantIDRX)} IDRX`);
        console.log(`   • User: ${ethers.formatEther(finalUserIDRX)} IDRX`);
        console.log(`   • Treasury: ${ethers.formatEther(finalTreasuryIDRX)} IDRX`);
        console.log("");
        console.log("🪙 Final PLT Balances:");
        console.log(`   • Merchant: ${ethers.formatEther(finalMerchantPLT)} PLT`);
        console.log(`   • User: ${ethers.formatEther(finalUserPLT)} PLT`);
        console.log(`   • Total Supply: ${ethers.formatEther(finalTotalSupply)} PLT`);

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });