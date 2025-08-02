require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    console.log("💰 Pointify IDRX Top-Up Script");
    console.log("===============================");
    
    const merchantAddress = "0xfD8ee9b819FB95DA85d874202ffa7EA91332bE15";
    const topUpAmount = ethers.parseEther("1000"); // 1000 IDRX
    
    console.log(`Merchant: ${merchantAddress}`);
    console.log(`Top-Up Amount: ${ethers.formatEther(topUpAmount)} IDRX`);
    console.log("");

    try {
        // Setup provider and wallet for Lisk Sepolia
        const provider = new ethers.JsonRpcProvider("https://rpc.sepolia-api.lisk.com");
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`Deployer/Admin: ${wallet.address}`);
        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
        
        const network = await provider.getNetwork();
        console.log(`Network: Lisk Sepolia (Chain ID: ${network.chainId})`);
        console.log("");

        // Contract addresses
        const rewardManagerAddress = process.env.REWARD_MANAGER_ADDRESS;
        const idrxTokenAddress = process.env.IDRX_TOKEN_ADDRESS;
        
        console.log("📋 Contract Addresses:");
        console.log(`RewardManager: ${rewardManagerAddress}`);
        console.log(`IDRX Token: ${idrxTokenAddress}`);
        console.log("");

        // Get contract instances
        const RewardManager = await ethers.getContractFactory("RewardManager");
        const rewardManager = RewardManager.attach(rewardManagerAddress).connect(wallet);
        
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        const idrxToken = ERC20Mock.attach(idrxTokenAddress).connect(wallet);

        // Verify contracts
        console.log("🔍 Verifying contracts...");
        try {
            await rewardManager.owner();
            await idrxToken.name();
            console.log("✅ Contracts verified");
        } catch (error) {
            console.log("❌ Contract verification failed:", error.message);
            return;
        }
        console.log("");

        // Check current IDRX balance
        console.log("📊 Checking current IDRX balance...");
        try {
            const idrxBalance = await idrxToken.balanceOf(wallet.address);
            console.log(`Current IDRX Balance: ${ethers.formatEther(idrxBalance)} IDRX`);
            
            if (idrxBalance < topUpAmount) {
                console.log("⚠️  Not enough IDRX balance, minting more...");
                const mintTx = await idrxToken.mint(wallet.address, topUpAmount);
                await mintTx.wait();
                console.log("✅ IDRX minted successfully");
            }
        } catch (error) {
            console.log("⚠️  Could not check IDRX balance, proceeding...");
        }
        console.log("");

        // Check current quota
        console.log("📊 Checking current quota...");
        try {
            const currentQuota = await rewardManager.merchantQuota(merchantAddress);
            console.log(`Current Quota: ${ethers.formatEther(currentQuota)} IDRX`);
        } catch (error) {
            console.log("⚠️  Could not check quota, proceeding...");
        }
        console.log("");

        // Approve IDRX spending
        console.log("🔓 Approving IDRX spending...");
        const approveTx = await idrxToken.approve(rewardManagerAddress, topUpAmount);
        console.log(`Approval transaction hash: ${approveTx.hash}`);
        await approveTx.wait();
        console.log("✅ IDRX spending approved");
        console.log("");

        // Top up IDRX
        console.log("💰 Topping up IDRX...");
        const topUpTx = await rewardManager.topUpIDRX(topUpAmount);
        console.log(`Transaction hash: ${topUpTx.hash}`);
        
        console.log("⏳ Waiting for confirmation...");
        const receipt = await topUpTx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log("");

        // Check new quota
        console.log("📊 Verifying new quota...");
        try {
            const newQuota = await rewardManager.merchantQuota(merchantAddress);
            console.log(`New Quota: ${ethers.formatEther(newQuota)} IDRX`);
        } catch (error) {
            console.log("⚠️  Could not verify new quota, but transaction was successful");
        }
        console.log("");

        console.log("🔍 View on Explorer: https://sepolia-blockscout.lisk.com/tx/" + topUpTx.hash);
        console.log("");
        console.log("🎉 IDRX top-up completed successfully!");
        console.log(`💼 Merchant ${merchantAddress} now has quota to mint PLT tokens`);
        console.log("🎁 You can now mint PLT tokens using the mint-points.js script");

    } catch (error) {
        console.error("❌ Error during top-up:", error.message);
        if (error.reason) {
            console.error("Reason:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });