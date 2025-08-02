const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Wallet address yang akan menerima points
    const recipientAddress = "0xfD8ee9b819FB95DA85d874202ffa7EA91332bE15";
    
    // Jumlah points yang akan diberikan (dalam wei, 1 PLT = 10^18 wei)
    const pointsAmount = ethers.parseEther("1000"); // 1000 PLT
    
    console.log("🎯 Pointify Minting Script");
    console.log("==========================");
    console.log(`Recipient: ${recipientAddress}`);
    console.log(`Amount: ${ethers.formatEther(pointsAmount)} PLT`);
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
    const loyaltyTokenAddress = process.env.LOYALTY_TOKEN_ADDRESS;
    
    if (!rewardManagerAddress || !loyaltyTokenAddress) {
        throw new Error("Contract addresses not found in .env file");
    }

    console.log("📋 Contract Addresses:");
    console.log(`RewardManager: ${rewardManagerAddress}`);
    console.log(`LoyaltyToken: ${loyaltyTokenAddress}`);
    console.log("");

    try {
        // Get contract instances
        const RewardManager = await ethers.getContractFactory("RewardManager");
        const rewardManager = RewardManager.attach(rewardManagerAddress).connect(wallet);

        const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
        const loyaltyToken = LoyaltyToken.attach(loyaltyTokenAddress).connect(wallet);

        // Verify contracts are deployed
        console.log("🔍 Verifying contracts...");
        const rewardManagerCode = await provider.getCode(rewardManagerAddress);
        const loyaltyTokenCode = await provider.getCode(loyaltyTokenAddress);
        
        if (rewardManagerCode === "0x") {
            throw new Error("RewardManager contract not found at the specified address");
        }
        if (loyaltyTokenCode === "0x") {
            throw new Error("LoyaltyToken contract not found at the specified address");
        }
        console.log("✅ Contracts verified");
        console.log("");

        // Check current balance before reward
        console.log("📊 Checking current balance...");
        let balanceBefore;
        try {
            balanceBefore = await loyaltyToken.balanceOf(recipientAddress);
            console.log(`Current PLT Balance: ${ethers.formatEther(balanceBefore)} PLT`);
        } catch (error) {
            console.log("⚠️  Could not read balance, but proceeding with minting...");
            balanceBefore = 0n;
        }
        console.log("");

        // Give reward (mint tokens)
        console.log("🎁 Minting PLT tokens...");
        const tx = await rewardManager.rewardUser(recipientAddress, pointsAmount);
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log("");

        // Check balance after reward
        console.log("📊 Checking new balance...");
        try {
            const balanceAfter = await loyaltyToken.balanceOf(recipientAddress);
            console.log(`New PLT Balance: ${ethers.formatEther(balanceAfter)} PLT`);
            if (balanceBefore >= 0) {
                console.log(`📈 PLT Minted: ${ethers.formatEther(balanceAfter - balanceBefore)} PLT`);
            }
        } catch (error) {
            console.log("⚠️  Could not read new balance, but minting transaction was successful");
        }
        console.log("");

        // Explorer link
        const explorerUrl = `https://sepolia-blockscout.lisk.com/tx/${tx.hash}`;
        console.log(`🔍 View on Explorer: ${explorerUrl}`);
        
        console.log("");
        console.log("🎉 PLT tokens successfully minted to your wallet!");
        console.log(`💰 You now have PLT tokens that can be used for:`);
        console.log(`   • Redeeming to IDRX (1:1 ratio)`);
        console.log(`   • Swapping to other tokens via SwapRouter`);
        console.log(`   • Transferring to other users`);

    } catch (error) {
        console.error("❌ Error minting PLT:", error.message);
        
        // Check if it's a permission error
        if (error.message.includes("AccessControl") || error.message.includes("ADMIN_ROLE") || error.message.includes("ApprovedMerchant")) {
            console.log("");
            console.log("💡 Tip: Make sure the deployer address has proper permissions");
            console.log("The address needs to be an approved merchant or have admin role");
        }
        
        // Check if it's a contract not found error
        if (error.message.includes("not found")) {
            console.log("");
            console.log("💡 Tip: Make sure the contracts are properly deployed and addresses are correct");
            console.log("You can verify contract addresses on the explorer");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });