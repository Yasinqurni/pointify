const { ethers } = require("hardhat");

async function main() {
    // Contract addresses - UPDATE THESE AFTER DEPLOYMENT
    const IDRX_TOKEN_ADDRESS = "0x7222435AC83D6c44052eB635112842Da458AEfD8"; // IDRX Mock Token Contract
    const DISTRIBUTOR_ADDRESS = process.argv[2]; // Pass as command line argument

    if (!DISTRIBUTOR_ADDRESS) {
        console.log("❌ Please provide distributor contract address");
        console.log("Usage: npx hardhat run scripts/approve-idrx-distributor.js --network lisk-sepolia [DISTRIBUTOR_ADDRESS]");
        process.exit(1);
    }

    console.log("🔐 Approving IDRXDistributor Contract...\n");

    // Get admin account
    const [admin] = await ethers.getSigners();
    console.log("👤 Admin Address:", admin.address);

    // Get IDRX contract
    const idrxContract = await ethers.getContractAt("IDRXFaucet", IDRX_TOKEN_ADDRESS);

    // Check admin balance
    const balance = await idrxContract.balanceOf(admin.address);
    console.log("💰 Admin IDRX Balance:", ethers.formatEther(balance), "IDRX");

    // Approval amount (1 year = 365,000 IDRX)
    const approvalAmount = ethers.parseEther("365000");
    console.log("📝 Approval Amount:", ethers.formatEther(approvalAmount), "IDRX");

    // Check current allowance
    const currentAllowance = await idrxContract.allowance(admin.address, DISTRIBUTOR_ADDRESS);
    console.log("📋 Current Allowance:", ethers.formatEther(currentAllowance), "IDRX");

    if (currentAllowance >= approvalAmount) {
        console.log("✅ Already approved! No action needed.");
        return;
    }

    // Execute approval
    console.log("\n🔄 Executing approval...");
    const tx = await idrxContract.approve(DISTRIBUTOR_ADDRESS, approvalAmount);
    console.log("📝 Transaction Hash:", tx.hash);

    // Wait for confirmation
    console.log("⏳ Waiting for confirmation...");
    await tx.wait();

    // Verify
    const newAllowance = await idrxContract.allowance(admin.address, DISTRIBUTOR_ADDRESS);
    console.log("✅ Approval successful!");
    console.log("🎉 New Allowance:", ethers.formatEther(newAllowance), "IDRX");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });