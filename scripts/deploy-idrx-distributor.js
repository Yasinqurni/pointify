const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting IDRXDistributor deployment...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

    // Contract addresses
    const IDRX_TOKEN_ADDRESS = "0x7222435AC83D6c44052eB635112842Da458AEfD8"; // IDRX Mock Token Contract
    
    // Use deployer as admin wallet (yang akan approve dan menyediakan tokens)
    const ADMIN_WALLET = deployer.address;
    
    // Note: If using custom admin wallet, that address must:
    // 1. Have IDRX tokens
    // 2. Approve this contract to spend tokens
    // 3. Have ETH for gas fees (for approval transaction)

    console.log("📋 Deployment Configuration:");
    console.log("   IDRX Token Address:", IDRX_TOKEN_ADDRESS);
    console.log("   Admin Wallet:", ADMIN_WALLET);
    console.log("");

    // Deploy IDRXDistributor
    console.log("🔨 Deploying IDRXDistributor...");
    const IDRXDistributor = await ethers.getContractFactory("IDRXDistributor");
    const distributorContract = await IDRXDistributor.deploy(IDRX_TOKEN_ADDRESS, ADMIN_WALLET);

    // Wait for deployment
    await distributorContract.waitForDeployment();
    const contractAddress = await distributorContract.getAddress();
    const deploymentTx = distributorContract.deploymentTransaction();

    console.log("✅ IDRXDistributor deployed successfully!");
    console.log("   Contract Address:", contractAddress);
    console.log("   Transaction Hash:", deploymentTx.hash);
    console.log("");

    // Verify deployment by calling contract functions
    console.log("🔍 Verifying deployment...");
    
    try {
        // Get distributor info
        const distributorInfo = await distributorContract.getDistributorInfo();
        console.log("📊 Distributor Information:");
        console.log("   Token Address:", distributorInfo[0]);
        console.log("   Admin Wallet:", distributorInfo[1]);
        console.log("   Daily Claim Amount:", ethers.formatEther(distributorInfo[2]), "IDRX");
        console.log("   Cooldown Period:", distributorInfo[3].toString(), "seconds (24 hours)");
        console.log("   Admin Balance:", ethers.formatEther(distributorInfo[4]), "IDRX");
        console.log("   Admin Allowance:", ethers.formatEther(distributorInfo[5]), "IDRX");
        console.log("");

        // Check admin status
        const adminStatus = await distributorContract.checkAdminStatus();
        console.log("🔐 Admin Status:");
        console.log("   Has Sufficient Balance:", adminStatus[0]);
        console.log("   Has Sufficient Allowance:", adminStatus[1]);
        console.log("   Current Balance:", ethers.formatEther(adminStatus[2]), "IDRX");
        console.log("   Current Allowance:", ethers.formatEther(adminStatus[3]), "IDRX");
        console.log("");

        // Check if deployer can claim
        const canClaim = await distributorContract.canUserClaim(deployer.address);
        console.log("👤 Deployer Claim Status:");
        console.log("   Can Claim:", canClaim[0]);
        console.log("   Time Until Next Claim:", canClaim[1].toString(), "seconds");
        console.log("");

        console.log("🎉 Deployment verification completed successfully!");
        console.log("");
        console.log("📝 Next Steps:");
        console.log("1. Admin wallet needs to approve this contract to spend IDRX tokens");
        console.log("2. Use the approve function on the IDRX token contract");
        console.log("3. Update frontend to use the new contract address");
        console.log("");
        console.log("💡 To approve the contract, run:");
        console.log(`   npx hardhat run scripts/approve-idrx-distributor.js --network lisk-sepolia ${contractAddress}`);

        // Auto-approve if admin has IDRX tokens
        if (distributorInfo[4] > 0) { // adminBalance > 0
            console.log("\n🔄 Auto-approving contract...");
            
            try {
                // Get IDRX contract instance
                const idrxContract = await ethers.getContractAt("IDRXFaucet", IDRX_TOKEN_ADDRESS);
                
                // Approval amount (1 year worth of claims)
                const approvalAmount = ethers.parseEther("365000"); // 365,000 IDRX
                
                // Check current allowance
                const currentAllowance = await idrxContract.allowance(deployer.address, contractAddress);
                
                if (currentAllowance < approvalAmount) {
                    console.log("   Approving", ethers.formatEther(approvalAmount), "IDRX...");
                    
                    const approveTx = await idrxContract.approve(contractAddress, approvalAmount);
                    console.log("   Approval Transaction Hash:", approveTx.hash);
                    
                    await approveTx.wait();
                    console.log("   ✅ Auto-approval successful!");
                    
                    // Verify new allowance
                    const newAllowance = await idrxContract.allowance(deployer.address, contractAddress);
                    console.log("   New Allowance:", ethers.formatEther(newAllowance), "IDRX");
                } else {
                    console.log("   ✅ Already approved!");
                }
                
            } catch (approveError) {
                console.log("   ⚠️ Auto-approval failed:", approveError.message);
                console.log("   Please run manual approval script");
            }
        }

    } catch (error) {
        console.error("❌ Error during verification:", error.message);
    }

    console.log("📋 Deployment Summary:");
    console.log("   Network:", network.name);
    console.log("   Contract Address:", contractAddress);
    console.log("   Transaction Hash:", deploymentTx.hash);
    console.log("   Deployer:", deployer.address);
    console.log("   Gas Used:", deploymentTx.gasLimit?.toString() || "N/A");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });