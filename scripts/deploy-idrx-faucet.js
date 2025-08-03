const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying IDRX Faucet...");

  // IDRX token address (using the address provided by user)
  const idrxTokenAddress = "0x7222435AC83D6c44052eB635112842Da458AEfD8";
  
  // Get the contract factory
  const IDRXFaucet = await ethers.getContractFactory("IDRXFaucet");
  
  // Deploy the faucet
  const idrxFaucet = await IDRXFaucet.deploy(idrxTokenAddress);
  
  // Wait for deployment to complete
  await idrxFaucet.waitForDeployment();
  
  const faucetAddress = await idrxFaucet.getAddress();
  
  console.log("IDRX Faucet deployed to:", faucetAddress);
  console.log("IDRX Token address:", idrxTokenAddress);
  console.log("Owner:", await idrxFaucet.owner());
  console.log("Daily limit:", await idrxFaucet.DAILY_LIMIT());
  console.log("Claim cooldown:", await idrxFaucet.CLAIM_COOLDOWN());
  
  // Verify the deployment
  console.log("\nVerifying deployment...");
  console.log("Faucet owner:", await idrxFaucet.owner());
  console.log("IDRX token contract:", await idrxFaucet.idrxToken());
  
  return {
    faucetAddress,
    idrxTokenAddress,
    owner: await idrxFaucet.owner()
  };
}

main()
  .then((result) => {
    console.log("\nDeployment successful!");
    console.log("Faucet address:", result.faucetAddress);
    console.log("IDRX token address:", result.idrxTokenAddress);
    console.log("Owner:", result.owner);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });