const { ethers } = require("hardhat");

async function main() {
  console.log("Testing IDRX Faucet...");

  // IDRX token address
  const idrxTokenAddress = "0x7222435AC83D6c44052eB635112842Da458AEfD8";
  
  // Get the contract factory
  const IDRXFaucet = await ethers.getContractFactory("IDRXFaucet");
  
  // Deploy the faucet for testing
  const idrxFaucet = await IDRXFaucet.deploy(idrxTokenAddress);
  await idrxFaucet.waitForDeployment();
  
  const faucetAddress = await idrxFaucet.getAddress();
  const [deployer] = await ethers.getSigners();
  
  console.log("Faucet deployed to:", faucetAddress);
  console.log("Testing with account:", deployer.address);
  
  // Test faucet info
  console.log("\n=== Faucet Information ===");
  const faucetInfo = await idrxFaucet.getFaucetInfo();
  console.log("Faucet balance:", ethers.formatEther(faucetInfo.faucetBalance), "IDRX");
  console.log("Daily limit:", ethers.formatEther(faucetInfo.dailyAmount), "IDRX");
  console.log("Cooldown period:", faucetInfo.cooldownPeriod.toString(), "seconds");
  
  // Test can claim function
  console.log("\n=== Testing Claim Eligibility ===");
  const canClaim = await idrxFaucet.canClaim(deployer.address);
  console.log("Can claim:", canClaim);
  
  const canUserClaim = await idrxFaucet.canUserClaim(deployer.address);
  console.log("Can user claim:", canUserClaim.canClaim);
  console.log("Time until next claim:", canUserClaim.timeUntilNextClaim.toString(), "seconds");
  
  // Test last claim time
  console.log("\n=== Last Claim Time ===");
  const lastClaimTime = await idrxFaucet.getUserLastClaimTime(deployer.address);
  console.log("Last claim time:", lastClaimTime.toString());
  
  // Test claim function (if possible)
  if (canClaim) {
    console.log("\n=== Attempting to Claim ===");
    try {
      const claimTx = await idrxFaucet.claim();
      await claimTx.wait();
      console.log("✅ Claim successful! Transaction:", claimTx.hash);
      
      // Check updated info
      const newLastClaimTime = await idrxFaucet.getUserLastClaimTime(deployer.address);
      console.log("Updated last claim time:", newLastClaimTime.toString());
      
      const newCanClaim = await idrxFaucet.canClaim(deployer.address);
      console.log("Can claim again:", newCanClaim);
      
    } catch (error) {
      console.log("❌ Claim failed:", error.message);
    }
  } else {
    console.log("⏳ Cannot claim yet - cooldown period not met");
  }
  
  // Test owner functions
  console.log("\n=== Owner Functions ===");
  const owner = await idrxFaucet.owner();
  console.log("Faucet owner:", owner);
  console.log("Deployer is owner:", owner === deployer.address);
  
  // Test refill function (would need tokens to be transferred to faucet first)
  console.log("\n=== Testing Refill Function ===");
  try {
    // This would fail if deployer doesn't have enough tokens
    await idrxFaucet.refillFaucet(ethers.parseEther("1000"));
    console.log("✅ Refill successful");
  } catch (error) {
    console.log("❌ Refill failed (expected if no tokens):", error.message);
  }
  
  console.log("\n=== Test Complete ===");
}

main()
  .then(() => {
    console.log("Testing completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Testing failed:", error);
    process.exit(1);
  }); 