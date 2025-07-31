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

    // Deploy RewardManager contract first (without LoyaltyToken)
    console.log("\n2. Deploying RewardManager contract...");
    const RewardManager = await ethers.getContractFactory("contracts/LoyaltyPoint.sol:RewardManager");
    const rewardManager = await RewardManager.deploy(await idrxToken.getAddress());
    await rewardManager.waitForDeployment();
    console.log("✅ RewardManager deployed to:", await rewardManager.getAddress());

    // Deploy RedemptionRouter contract
    console.log("\n3. Deploying RedemptionRouter contract...");
    const platformFee = 200; // 2% in basis points (200/10000 = 2%)
    const feeRecipient = deployer.address; // Platform fee recipient
    
    const RedemptionRouter = await ethers.getContractFactory("contracts/LoyaltyPoint.sol:RedemptionRouter");
    const redemptionRouter = await RedemptionRouter.deploy(
      await idrxToken.getAddress(),
      platformFee,
      feeRecipient
    );
    await redemptionRouter.waitForDeployment();
    console.log("✅ RedemptionRouter deployed to:", await redemptionRouter.getAddress());

    // Deploy SwapRouter contract
    console.log("\n4. Deploying SwapRouter contract...");
    const swapFee = 30; // 0.3% in basis points (30/10000 = 0.3%)
    const SwapRouter = await ethers.getContractFactory("contracts/LoyaltyPoint.sol:SwapRouter");
    const swapRouter = await SwapRouter.deploy(
      await idrxToken.getAddress(),
      swapFee,
      feeRecipient
    );
    await swapRouter.waitForDeployment();
    console.log("✅ SwapRouter deployed to:", await swapRouter.getAddress());

    // Deploy LoyaltyToken contract with all addresses
    console.log("\n5. Deploying LoyaltyToken contract...");
    const LoyaltyToken = await ethers.getContractFactory("contracts/LoyaltyPoint.sol:LoyaltyToken");
    const loyaltyToken = await LoyaltyToken.deploy(
      await rewardManager.getAddress(),
      await redemptionRouter.getAddress(),
      await swapRouter.getAddress(),
      await idrxToken.getAddress()
    );
    await loyaltyToken.waitForDeployment();
    console.log("✅ LoyaltyToken deployed to:", await loyaltyToken.getAddress());

    // Update contract addresses
    console.log("\n6. Setting up contract connections...");
    await rewardManager.setLoyaltyToken(await loyaltyToken.getAddress());
    console.log("✅ RewardManager connected to LoyaltyToken");
    
    await redemptionRouter.setLoyaltyToken(await loyaltyToken.getAddress());
    await redemptionRouter.setRewardManager(await rewardManager.getAddress());
    console.log("✅ RedemptionRouter connected to LoyaltyToken and RewardManager");
    
    await swapRouter.setLoyaltyToken(await loyaltyToken.getAddress());
    console.log("✅ SwapRouter connected to LoyaltyToken");

    // Verify deployment
    console.log("\n7. Verifying deployment...");
    const deployedIdrxToken = await ethers.getContractAt("ERC20Mock", await idrxToken.getAddress());
    const deployedLoyaltyToken = await ethers.getContractAt("contracts/LoyaltyPoint.sol:LoyaltyToken", await loyaltyToken.getAddress());
    const deployedRewardManager = await ethers.getContractAt("contracts/LoyaltyPoint.sol:RewardManager", await rewardManager.getAddress());
    const deployedRedemptionRouter = await ethers.getContractAt("contracts/LoyaltyPoint.sol:RedemptionRouter", await redemptionRouter.getAddress());
    const deployedSwapRouter = await ethers.getContractAt("contracts/LoyaltyPoint.sol:SwapRouter", await swapRouter.getAddress());
    
    const deployerBalance = await deployedIdrxToken.balanceOf(deployer.address);
    const loyaltyTokenName = await deployedLoyaltyToken.name();
    const loyaltyTokenSymbol = await deployedLoyaltyToken.symbol();
    const rewardManagerIdrxToken = await deployedRewardManager.idrxToken();
    const redemptionRouterFee = await deployedRedemptionRouter.platformFee();
    const redemptionRouterFeeRecipient = await deployedRedemptionRouter.feeRecipient();

    console.log("✅ Verification successful!");
    console.log("   - Deployer IDRX balance:", ethers.formatEther(deployerBalance));
    console.log("   - LoyaltyToken name:", loyaltyTokenName);
    console.log("   - LoyaltyToken symbol:", loyaltyTokenSymbol);
    console.log("   - RewardManager IDRX token address:", rewardManagerIdrxToken);
    console.log("   - RedemptionRouter platform fee:", redemptionRouterFee.toString(), "basis points");
    console.log("   - RedemptionRouter fee recipient:", redemptionRouterFeeRecipient);

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
        LoyaltyToken: {
          address: await loyaltyToken.getAddress(),
          name: loyaltyTokenName,
          symbol: loyaltyTokenSymbol
        },
        RewardManager: {
          address: await rewardManager.getAddress(),
          idrxTokenAddress: await idrxToken.getAddress(),
          loyaltyTokenAddress: await loyaltyToken.getAddress()
        },
        RedemptionRouter: {
          address: await redemptionRouter.getAddress(),
          idrxTokenAddress: await idrxToken.getAddress(),
          loyaltyTokenAddress: await loyaltyToken.getAddress(),
          platformFee: platformFee,
          feeRecipient: feeRecipient
        },
        SwapRouter: {
          address: await swapRouter.getAddress(),
          loyaltyTokenAddress: await loyaltyToken.getAddress()
        }
      },
      deploymentTime: new Date().toISOString()
    };

    console.log("\n📋 Deployment Summary:");
    console.log("Network: Lisk Sepolia");
    console.log("Deployer:", deployer.address);
    console.log("ERC20Mock (IDRX):", await idrxToken.getAddress());
    console.log("LoyaltyToken (PLT):", await loyaltyToken.getAddress());
    console.log("RewardManager:", await rewardManager.getAddress());
    console.log("RedemptionRouter:", await redemptionRouter.getAddress());
    console.log("SwapRouter:", await swapRouter.getAddress());
    console.log("Platform Fee:", platformFee, "basis points (2%)");
    console.log("Fee Recipient:", feeRecipient);

    console.log("\n🔗 Explorer Links:");
    console.log("ERC20Mock:", `https://sepolia-blockscout.lisk.com/address/${await idrxToken.getAddress()}`);
    console.log("LoyaltyToken:", `https://sepolia-blockscout.lisk.com/address/${await loyaltyToken.getAddress()}`);
    console.log("RewardManager:", `https://sepolia-blockscout.lisk.com/address/${await rewardManager.getAddress()}`);
    console.log("RedemptionRouter:", `https://sepolia-blockscout.lisk.com/address/${await redemptionRouter.getAddress()}`);
    console.log("SwapRouter:", `https://sepolia-blockscout.lisk.com/address/${await swapRouter.getAddress()}`);

    console.log("\n💡 Next Steps:");
    console.log("1. Update contract addresses in .env file");
    console.log("2. Set up contract permissions (RedemptionRouter for LoyaltyToken)");
    console.log("3. Test the contracts on Lisk Sepolia");
    console.log("4. Verify contracts on Lisk Sepolia Explorer");

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