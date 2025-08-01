const { run, network } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔍 Verifying Deployed Contracts...");
    console.log("🌐 Network:", network.name);
    console.log("");

    // Check if we're on localhost
    if (network.name === "localhost" || network.name === "hardhat") {
        console.log("⚠️  Cannot verify contracts on localhost network!");
        console.log("💡 To verify contracts, please:");
        console.log("   1. Deploy to testnet: npx hardhat deploy-loyalty --network lisk-sepolia");
        console.log("   2. Then verify: npx hardhat verify-contracts --network lisk-sepolia");
        console.log("");
        return;
    }

    // Contract addresses (update these with your deployed addresses)
    const contracts = {
        idrxMock: process.env.IDRX_MOCK_ADDRESS,
        pointifyToken: process.env.POINTIFY_TOKEN_ADDRESS,
        treasuryManager: process.env.TREASURY_MANAGER_ADDRESS,
        treasury: process.env.TREASURY_ADDRESS
    };

    console.log("📋 Contract Addresses:");
    console.log("• IDRX Mock:", contracts.idrxMock);
    console.log("• Pointify Token:", contracts.pointifyToken);
    console.log("• Treasury Manager:", contracts.treasuryManager);
    console.log("• Treasury:", contracts.treasury);
    console.log("");

    try {
        // Verify IDRXMock (ERC20Mock)
        console.log("🔍 Verifying IDRXMock...");
        await run("verify:verify", {
            address: contracts.idrxMock,
            constructorArguments: [
                "IDRX-MOCK",  // name
                "IDRX-MOCK",  // symbol
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // initial owner (deployer)
                "1000000000000000000000000" // initial supply (1M tokens)
            ],
        });
        console.log("✅ IDRXMock verified!");

        // Verify PointifyToken
        console.log("🔍 Verifying PointifyToken...");
        await run("verify:verify", {
            address: contracts.pointifyToken,
            constructorArguments: [
                contracts.idrxMock // idrxToken address
            ],
        });
        console.log("✅ PointifyToken verified!");

        // Verify Treasury
        console.log("🔍 Verifying Treasury...");
        await run("verify:verify", {
            address: contracts.treasury,
            constructorArguments: [
                contracts.idrxMock,      // idrxToken address
                contracts.treasuryManager // treasuryManager address
            ],
        });
        console.log("✅ Treasury verified!");

        // Verify TreasuryManager
        console.log("🔍 Verifying TreasuryManager...");
        await run("verify:verify", {
            address: contracts.treasuryManager,
            constructorArguments: [
                contracts.idrxMock,      // idrxToken address
                contracts.treasury       // treasury address
            ],
        });
        console.log("✅ TreasuryManager verified!");

        console.log("");
        console.log("🎉 All contracts verified successfully!");
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        
        // If already verified
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️  Contract already verified!");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });