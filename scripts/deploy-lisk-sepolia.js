const { ethers } = require("hardhat");

async function main() {
  // Check if private key is available
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required. Please add it to your .env file");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts to Lisk Sepolia with account:", deployer.address);
  
  // Get balance using provider
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "LSK");

  // Check if account has enough balance for deployment
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance. Please ensure your account has at least 0.01 LSK for gas fees");
  }

  try {
    // Deploy ERC20Mock (IDRX Token)
    console.log("\n1. Deploying ERC20Mock (IDRX Token)...");
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const idrxToken = await ERC20Mock.deploy(
      "IDRX Token", 
      "IDRX", 
      deployer.address, 
      ethers.parseEther("1000000") // 1 million IDRX tokens
    );
    await idrxToken.waitForDeployment();
    console.log("✅ ERC20Mock deployed to:", await idrxToken.getAddress());

    // Deploy LoyaltyPoint contract
    console.log("\n2. Deploying LoyaltyPoint contract...");
    const platformFee = 200; // 2% in basis points (200/10000 = 2%)
    const feeRecipient = deployer.address; // Platform fee recipient
    
    const LoyaltyPoint = await ethers.getContractFactory("LoyaltyPoint");
    const loyaltyPoint = await LoyaltyPoint.deploy(
      await idrxToken.getAddress(), 
      platformFee, 
      feeRecipient
    );
    await loyaltyPoint.waitForDeployment();
    console.log("✅ LoyaltyPoint deployed to:", await loyaltyPoint.getAddress());

    // Verify deployment
    console.log("\n3. Verifying deployment...");
    const deployedIdrxToken = await ethers.getContractAt("ERC20Mock", await idrxToken.getAddress());
    const deployedLoyaltyPoint = await ethers.getContractAt("LoyaltyPoint", await loyaltyPoint.getAddress());
    
    const deployerBalance = await deployedIdrxToken.balanceOf(deployer.address);
    const loyaltyPointIdrxToken = await deployedLoyaltyPoint.idrxToken();
    const loyaltyPointFee = await deployedLoyaltyPoint.platformFee();
    const loyaltyPointFeeRecipient = await deployedLoyaltyPoint.feeRecipient();

    console.log("✅ Verification successful!");
    console.log("   - Deployer IDRX balance:", ethers.formatEther(deployerBalance));
    console.log("   - LoyaltyPoint IDRX token address:", loyaltyPointIdrxToken);
    console.log("   - Platform fee:", loyaltyPointFee.toString(), "basis points");
    console.log("   - Fee recipient:", loyaltyPointFeeRecipient);

    // Save deployment info
    const deploymentInfo = {
      network: "lisk-sepolia",
      deployer: deployer.address,
      contracts: {
        ERC20Mock: {
          address: await idrxToken.getAddress(),
          name: "IDRX Token",
          symbol: "IDRX",
          totalSupply: "1000000",
          deployerBalance: ethers.formatEther(deployerBalance)
        },
        LoyaltyPoint: {
          address: await loyaltyPoint.getAddress(),
          idrxTokenAddress: await idrxToken.getAddress(),
          platformFee: platformFee,
          feeRecipient: feeRecipient
        }
      },
      deploymentTime: new Date().toISOString()
    };

    console.log("\n📋 Deployment Summary:");
    console.log("Network: Lisk Sepolia");
    console.log("Deployer:", deployer.address);
    console.log("ERC20Mock (IDRX):", await idrxToken.getAddress());
    console.log("LoyaltyPoint:", await loyaltyPoint.getAddress());
    console.log("Platform Fee:", platformFee, "basis points (2%)");
    console.log("Fee Recipient:", feeRecipient);

    console.log("\n🔗 Explorer Links:");
    console.log("ERC20Mock:", `https://sepolia-blockscout.lisk.com/address/${await idrxToken.getAddress()}`);
    console.log("LoyaltyPoint:", `https://sepolia-blockscout.lisk.com/address/${await loyaltyPoint.getAddress()}`);

    console.log("\n💡 Next Steps:");
    console.log("1. Update LOYALTY_POINT_ADDRESS in frontend/app/page.tsx");
    console.log("2. Test the contracts on Lisk Sepolia");
    console.log("3. Verify contracts on Lisk Sepolia Explorer");

    return deploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((deploymentInfo) => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error);
    process.exit(1);
  }); 