const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Wallet address yang akan dijadikan approved merchant
    const merchantAddress = "0xfD8ee9b819FB95DA85d874202ffa7EA91332bE15";
    
    console.log("🏪 Pointify Merchant Setup Script");
    console.log("=================================");
    console.log(`Merchant Address: ${merchantAddress}`);
    console.log("");

    // Setup provider for lisk-sepolia
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia-api.lisk.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`Deployer/Admin: ${wallet.address}`);
    console.log(`Balance: ${ethers.formatEther(await provider.getBalance(wallet.address))} ETH`);
    console.log(`Network: Lisk Sepolia (Chain ID: ${(await provider.getNetwork()).chainId})`);
    console.log("");

    // Contract addresses from .env
    const rewardManagerAddress = process.env.REWARD_MANAGER_ADDRESS;
    
    if (!rewardManagerAddress) {
        throw new Error("RewardManager address not found in .env file");
    }

    console.log("📋 Contract Address:");
    console.log(`RewardManager: ${rewardManagerAddress}`);
    console.log("");

    try {
        // Get contract instance
        const RewardManager = await ethers.getContractFactory("RewardManager");
        const rewardManager = RewardManager.attach(rewardManagerAddress).connect(wallet);

        // Verify contract is deployed
        console.log("🔍 Verifying contract...");
        const rewardManagerCode = await provider.getCode(rewardManagerAddress);
        
        if (rewardManagerCode === "0x") {
            throw new Error("RewardManager contract not found at the specified address");
        }
        console.log("✅ Contract verified");
        console.log("");

        // Check if already approved
        console.log("📊 Checking current merchant status...");
        try {
            const isApproved = await rewardManager.approvedMerchants(merchantAddress);
            console.log(`Current status: ${isApproved ? 'APPROVED' : 'NOT APPROVED'}`);
            
            if (isApproved) {
                console.log("✅ Address is already an approved merchant!");
                return;
            }
        } catch (error) {
            console.log("⚠️  Could not check merchant status, proceeding with approval...");
        }
        console.log("");

        // Add as approved merchant
        console.log("🏪 Adding as approved merchant...");
        const tx = await rewardManager.approveMerchant(merchantAddress, true);
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log("");

        // Verify approval
        console.log("📊 Verifying merchant approval...");
        try {
            const isApproved = await rewardManager.approvedMerchants(merchantAddress);
            console.log(`New status: ${isApproved ? 'APPROVED ✅' : 'NOT APPROVED ❌'}`);
        } catch (error) {
            console.log("⚠️  Could not verify approval, but transaction was successful");
        }
        console.log("");

        // Explorer link
        const explorerUrl = `https://sepolia-blockscout.lisk.com/tx/${tx.hash}`;
        console.log(`🔍 View on Explorer: ${explorerUrl}`);
        
        console.log("");
        console.log("🎉 Merchant setup completed successfully!");
        console.log(`💼 Address ${merchantAddress} is now an approved merchant`);
        console.log(`🎁 You can now mint PLT tokens using the mint-points.js script`);

    } catch (error) {
        console.error("❌ Error setting up merchant:", error.message);
        
        // Check if it's a permission error
        if (error.message.includes("AccessControl") || error.message.includes("ADMIN_ROLE") || error.message.includes("Ownable")) {
            console.log("");
            console.log("💡 Tip: Make sure the deployer address has admin/owner permissions");
            console.log("Only the contract owner can add approved merchants");
        }
        
        // Check if it's a contract not found error
        if (error.message.includes("not found")) {
            console.log("");
            console.log("💡 Tip: Make sure the contract is properly deployed and address is correct");
            console.log("You can verify contract address on the explorer");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });