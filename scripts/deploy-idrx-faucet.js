const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying IDRX Faucet Contract...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy IDRXFaucet contract
  const IDRXFaucet = await ethers.getContractFactory("IDRXFaucet");
  
  // Constructor parameters
  const tokenName = "Indonesian Rupiah Mock";
  const tokenSymbol = "IDRX-MOCK";
  const initialAccount = deployer.address; // Owner will be the deployer
  const initialBalance = ethers.parseEther("1000000"); // 1M IDRX initial supply
  
  console.log("🔧 Contract parameters:");
  console.log("  - Name:", tokenName);
  console.log("  - Symbol:", tokenSymbol);
  console.log("  - Initial Account:", initialAccount);
  console.log("  - Initial Balance:", ethers.formatEther(initialBalance), "IDRX");
  
  // Deploy contract
  const faucetContract = await IDRXFaucet.deploy(
    tokenName,
    tokenSymbol,
    initialAccount,
    initialBalance
  );
  
  await faucetContract.waitForDeployment();
  
  console.log("✅ IDRX Faucet deployed successfully!");
  const contractAddress = await faucetContract.getAddress();
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Transaction hash:", faucetContract.deploymentTransaction().hash);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  const name = await faucetContract.name();
  const symbol = await faucetContract.symbol();
  const decimals = await faucetContract.decimals();
  const totalSupply = await faucetContract.totalSupply();
  const owner = await faucetContract.owner();
  const faucetInfo = await faucetContract.getFaucetInfo();
  
  console.log("✅ Contract verification:");
  console.log("  - Name:", name);
  console.log("  - Symbol:", symbol);
  console.log("  - Decimals:", decimals);
  console.log("  - Total Supply:", ethers.formatEther(totalSupply), "IDRX");
  console.log("  - Owner:", owner);
  console.log("  - Faucet Balance:", ethers.formatEther(faucetInfo.faucetBalance), "IDRX");
  console.log("  - Daily Claim Amount:", ethers.formatEther(faucetInfo.dailyAmount), "IDRX");
  console.log("  - Cooldown Period:", faucetInfo.cooldownPeriod.toString(), "seconds (24 hours)");
  
  // Test faucet functionality
  console.log("\n🧪 Testing faucet functionality...");
  
  // Check if deployer can claim
  const canClaim = await faucetContract.canUserClaim(deployer.address);
  console.log("  - Can deployer claim:", canClaim.canClaim);
  console.log("  - Time until next claim:", canClaim.timeUntilNextClaim.toString(), "seconds");
  
  // Try to claim tokens
  if (canClaim.canClaim) {
    console.log("  - Attempting to claim tokens...");
    const claimTx = await faucetContract.faucet();
    await claimTx.wait();
    console.log("  ✅ Claim successful! Transaction:", claimTx.hash);
    
    // Check balance after claim
    const balanceAfterClaim = await faucetContract.balanceOf(deployer.address);
    console.log("  - Balance after claim:", ethers.formatEther(balanceAfterClaim), "IDRX");
  }
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Contract Name: IDRX Faucet");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Lisk Sepolia");
  console.log("Owner:", owner);
  console.log("Daily Claim Amount: 1000 IDRX");
  console.log("Cooldown Period: 24 hours");
  console.log("=".repeat(50));
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "IDRXFaucet",
    contractAddress: contractAddress,
    transactionHash: faucetContract.deploymentTransaction().hash,
    network: "lisk-sepolia",
    owner: owner,
    deployedAt: new Date().toISOString(),
    parameters: {
      name: tokenName,
      symbol: tokenSymbol,
      initialAccount: initialAccount,
      initialBalance: ethers.formatEther(initialBalance)
    },
    faucetConfig: {
      dailyClaimAmount: "1000",
      cooldownPeriod: "24 hours",
      faucetBalance: ethers.formatEther(faucetInfo.faucetBalance)
    }
  };
  
  console.log("\n💾 Deployment info saved:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📍 Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });