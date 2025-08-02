const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🏦 Deploying Treasury Flow Contracts...");
    console.log("");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    console.log("");

    try {
        // Step 0: Deploy IDRXMock first
        console.log("📦 Deploying IDRXMock...");
        const IDRXMock = await ethers.getContractFactory("IDRXMock");
        const idrxMock = await IDRXMock.deploy(
            "Indonesian Rupiah X Mock",
            "IDRX-MOCK",
            deployer.address,
            ethers.parseEther("10000000") // 10M initial supply
        );
        await idrxMock.waitForDeployment();
        const idrxTokenAddress = await idrxMock.getAddress();
        console.log("✅ IDRXMock deployed to:", idrxTokenAddress);

        // Step 1: Deploy PointifyToken
        console.log("📦 Deploying PointifyToken...");
        const PointifyToken = await ethers.getContractFactory("PointifyToken");
        const pointifyToken = await PointifyToken.deploy(idrxTokenAddress);
        await pointifyToken.waitForDeployment();
        const pointifyTokenAddress = await pointifyToken.getAddress();
        console.log("✅ PointifyToken deployed to:", pointifyTokenAddress);

        // Step 2: Deploy Treasury
        console.log("📦 Deploying Treasury...");
        const Treasury = await ethers.getContractFactory("Treasury");
        // Treasury manager akan di-set setelah TreasuryManager deployed
        const treasury = await Treasury.deploy(idrxTokenAddress, deployer.address);
        await treasury.waitForDeployment();
        const treasuryAddress = await treasury.getAddress();
        console.log("✅ Treasury deployed to:", treasuryAddress);

        // Step 3: Deploy TreasuryManager
        console.log("📦 Deploying TreasuryManager...");
        const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
        const treasuryManager = await TreasuryManager.deploy(idrxTokenAddress, treasuryAddress);
        await treasuryManager.waitForDeployment();
        const treasuryManagerAddress = await treasuryManager.getAddress();
        console.log("✅ TreasuryManager deployed to:", treasuryManagerAddress);

        // Step 4: Setup connections
        console.log("");
        console.log("🔗 Setting up contract connections...");

        // Set TreasuryManager in PointifyToken
        console.log("   • Setting TreasuryManager in PointifyToken...");
        const setTreasuryManagerTx = await pointifyToken.setTreasuryManager(treasuryManagerAddress);
        await setTreasuryManagerTx.wait();
        console.log("   ✅ TreasuryManager set in PointifyToken");

        // Set PointifyToken in TreasuryManager
        console.log("   • Setting PointifyToken in TreasuryManager...");
        const setPointifyTokenTx = await treasuryManager.setPointifyToken(pointifyTokenAddress);
        await setPointifyTokenTx.wait();
        console.log("   ✅ PointifyToken set in TreasuryManager");

        // Update Treasury manager
        console.log("   • Updating Treasury manager...");
        const Treasury2 = await ethers.getContractFactory("Treasury");
        const treasury2 = Treasury2.attach(treasuryAddress);
        // Deploy new treasury with correct manager
        const newTreasury = await Treasury.deploy(idrxTokenAddress, treasuryManagerAddress);
        await newTreasury.waitForDeployment();
        const newTreasuryAddress = await newTreasury.getAddress();
        
        // Update treasury address in TreasuryManager
        const setTreasuryTx = await treasuryManager.setTreasury(newTreasuryAddress);
        await setTreasuryTx.wait();
        console.log("   ✅ Treasury updated with correct manager");

        console.log("");
        console.log("🔍 Verifying deployment...");

        // Verify PointifyToken
        const tokenName = await pointifyToken.name();
        const tokenSymbol = await pointifyToken.symbol();
        const tokenDecimals = await pointifyToken.decimals();
        const tokenTreasuryManager = await pointifyToken.treasuryManager();

        console.log("📊 PointifyToken:");
        console.log("   • Name:", tokenName);
        console.log("   • Symbol:", tokenSymbol);
        console.log("   • Decimals:", tokenDecimals);
        console.log("   • Treasury Manager:", tokenTreasuryManager);

        // Verify TreasuryManager
        const managerOwner = await treasuryManager.owner();
        const managerTreasury = await treasuryManager.treasury();
        const managerPointifyToken = await treasuryManager.pointifyToken();

        console.log("📊 TreasuryManager:");
        console.log("   • Owner:", managerOwner);
        console.log("   • Treasury:", managerTreasury);
        console.log("   • PointifyToken:", managerPointifyToken);

        // Verify Treasury
        const newTreasuryContract = Treasury.attach(newTreasuryAddress);
        const treasuryManagerAddr = await newTreasuryContract.treasuryManager();
        const treasuryIDRXBalance = await newTreasuryContract.getIDRXBalance();

        console.log("📊 Treasury:");
        console.log("   • Treasury Manager:", treasuryManagerAddr);
        console.log("   • IDRX Balance:", ethers.formatEther(treasuryIDRXBalance));

        console.log("");
        console.log("🎉 Treasury Flow Deployment Complete!");
        console.log("");

        // Save deployment info
        const deploymentInfo = {
            network: (await ethers.provider.getNetwork()).name,
            chainId: Number((await ethers.provider.getNetwork()).chainId),
            contracts: {
                idrxMock: idrxTokenAddress,
                pointifyToken: pointifyTokenAddress,
                treasuryManager: treasuryManagerAddress,
                treasury: newTreasuryAddress,
                idrxToken: idrxTokenAddress
            },
            deployer: deployer.address,
            timestamp: new Date().toISOString()
        };

        console.log("📋 Deployment Summary:");
        console.log(JSON.stringify(deploymentInfo, null, 2));
        console.log("");

        console.log("🎯 Next Steps:");
        console.log("1. Register merchants:");
        console.log(`   await treasuryManager.registerMerchant(merchantAddress, true)`);
        console.log("");
        console.log("2. Merchant swap IDRX → PLT:");
        console.log(`   await treasuryManager.swapIDRXToPLT(amount)`);
        console.log("");
        console.log("3. Merchant send rewards:");
        console.log(`   await treasuryManager.sendReward(userAddress, amount)`);
        console.log("");
        console.log("4. User redeem to merchant:");
        console.log(`   await treasuryManager.redeemToMerchant(merchantAddress, amount)`);
        console.log("");
        console.log("5. User swap PLT → IDRX:");
        console.log(`   await treasuryManager.swapPLTToIDRX(amount)`);
        console.log("");

        console.log("💡 Environment Variables to add:");
        console.log(`IDRX_MOCK_ADDRESS=${idrxTokenAddress}`);
        console.log(`POINTIFY_TOKEN_ADDRESS=${pointifyTokenAddress}`);
        console.log(`TREASURY_MANAGER_ADDRESS=${treasuryManagerAddress}`);
        console.log(`TREASURY_ADDRESS=${newTreasuryAddress}`);

        return {
            idrxMock: idrxTokenAddress,
            pointifyToken: pointifyTokenAddress,
            treasury: newTreasuryAddress,
            treasuryManager: treasuryManagerAddress
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("");
            console.log("💡 Tip: Make sure you have enough ETH for gas fees");
        }
        
        if (error.message.includes("nonce")) {
            console.log("");
            console.log("💡 Tip: Try resetting your MetaMask account or wait a moment");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });