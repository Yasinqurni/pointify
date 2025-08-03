const { ethers } = require("hardhat");

async function main() {
    console.log("🔐 Starting Admin Approval Process for IDRXDistributor...\n");

    // Get deployer account (admin wallet)
    const [admin] = await ethers.getSigners();
    console.log("👤 Admin Wallet:", admin.address);
    console.log("💰 Admin Balance:", ethers.formatEther(await admin.provider.getBalance(admin.address)), "ETH\n");

    // Contract addresses
    const IDRX_TOKEN_ADDRESS = "0x7222435AC83D6c44052eB635112842Da458AEfD8"; // IDRX Mock Token Contract
    const DISTRIBUTOR_ADDRESS = "0x..."; // Will be filled after deployment

    console.log("📋 Contract Configuration:");
    console.log("   IDRX Token Address:", IDRX_TOKEN_ADDRESS);
    console.log("   Distributor Address:", DISTRIBUTOR_ADDRESS);
    console.log("");

    // Get contract instances
    const idrxContract = await ethers.getContractAt("IDRXFaucet", IDRX_TOKEN_ADDRESS);
    
    // Check admin's IDRX balance
    const adminBalance = await idrxContract.balanceOf(admin.address);
    console.log("📊 Current Admin IDRX Balance:", ethers.formatEther(adminBalance), "IDRX");

    // Calculate approval amount (1 year worth of claims)
    const DAILY_CLAIM_AMOUNT = ethers.parseEther("1000"); // 1000 IDRX
    const DAYS_IN_YEAR = 365;
    const APPROVAL_AMOUNT = DAILY_CLAIM_AMOUNT * BigInt(DAYS_IN_YEAR); // 365,000 IDRX

    console.log("💡 Approval Amount:", ethers.formatEther(APPROVAL_AMOUNT), "IDRX (1 year worth)");

    // Check if admin has enough balance
    if (adminBalance < APPROVAL_AMOUNT) {
        console.log("⚠️  Warning: Admin balance is less than approval amount");
        console.log("   Consider approving only available balance or top up admin wallet first");
        
        // Use available balance instead
        const safeApprovalAmount = adminBalance;
        console.log("   Using safe approval amount:", ethers.formatEther(safeApprovalAmount), "IDRX");
        
        if (safeApprovalAmount > 0) {
            await approveContract(idrxContract, DISTRIBUTOR_ADDRESS, safeApprovalAmount, admin);
        } else {
            console.log("❌ Admin has no IDRX tokens to approve");
            return;
        }
    } else {
        // Approve full amount
        await approveContract(idrxContract, DISTRIBUTOR_ADDRESS, APPROVAL_AMOUNT, admin);
    }
}

async function approveContract(idrxContract, distributorAddress, amount, admin) {
    try {
        console.log("\n🔄 Starting approval transaction...");
        
        // Check current allowance
        const currentAllowance = await idrxContract.allowance(admin.address, distributorAddress);
        console.log("📋 Current Allowance:", ethers.formatEther(currentAllowance), "IDRX");

        if (currentAllowance >= amount) {
            console.log("✅ Contract already has sufficient allowance!");
            return;
        }

        // Estimate gas for approval
        const gasEstimate = await idrxContract.approve.estimateGas(distributorAddress, amount);
        console.log("⛽ Estimated Gas:", gasEstimate.toString());

        // Execute approval
        const tx = await idrxContract.approve(distributorAddress, amount, {
            gasLimit: gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
        });

        console.log("📝 Approval Transaction Hash:", tx.hash);
        console.log("⏳ Waiting for confirmation...");

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("✅ Approval confirmed in block:", receipt.blockNumber);

        // Verify approval
        const newAllowance = await idrxContract.allowance(admin.address, distributorAddress);
        console.log("🎉 New Allowance:", ethers.formatEther(newAllowance), "IDRX");

        console.log("\n📊 Approval Summary:");
        console.log("   Admin Wallet:", admin.address);
        console.log("   Distributor Contract:", distributorAddress);
        console.log("   Approved Amount:", ethers.formatEther(amount), "IDRX");
        console.log("   Transaction Hash:", tx.hash);
        console.log("   Gas Used:", receipt.gasUsed.toString());

    } catch (error) {
        console.error("❌ Approval failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 Suggestion: Make sure admin wallet has enough ETH for gas fees");
        } else if (error.message.includes("allowance")) {
            console.log("💡 Suggestion: Check if approval amount is correct");
        }
    }
}

// Alternative: Manual approval steps
function printManualSteps() {
    console.log("\n📝 Manual Approval Steps:");
    console.log("1. Connect to admin wallet in MetaMask/Xellar");
    console.log("2. Go to IDRX token contract on block explorer");
    console.log("3. Call 'approve' function with:");
    console.log("   - spender: [DISTRIBUTOR_CONTRACT_ADDRESS]");
    console.log("   - amount: 365000000000000000000000 (365,000 IDRX in wei)");
    console.log("4. Confirm transaction");
    console.log("5. Wait for confirmation");
    
    console.log("\n🔗 Useful Links:");
    console.log("   IDRX Contract: https://sepolia-blockscout.lisk.com/address/0x7222435AC83D6c44052eB635112842Da458AEfD8");
    console.log("   Network: Lisk Sepolia");
    console.log("   Chain ID: 4202");
}

// Check if this is being run directly
if (require.main === module) {
    main()
        .then(() => {
            printManualSteps();
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Script failed:", error);
            printManualSteps();
            process.exit(1);
        });
}

module.exports = { approveContract };