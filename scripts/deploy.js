const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ERC20Mock (for testing purposes)
  console.log("Deploying ERC20Mock...");
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  const idrxToken = await ERC20Mock.deploy("IDRX", "IDRX", deployer.address, ethers.utils.parseEther("1000000"));
  await idrxToken.deployed();
  console.log("ERC20Mock deployed to:", idrxToken.address);

  // Deploy LoyaltyPoint contract
  console.log("Deploying LoyaltyPoint...");
  const platformFee = 200; // 2% in basis points
  const feeRecipient = deployer.address; // Platform fee recipient
  const LoyaltyPoint = await ethers.getContractFactory("LoyaltyPoint");
  const loyaltyPoint = await LoyaltyPoint.deploy(idrxToken.address, platformFee, feeRecipient);
  await loyaltyPoint.deployed();
  console.log("LoyaltyPoint deployed to:", loyaltyPoint.address);

  console.log("Deployment completed successfully!");
  console.log("ERC20Mock (IDRX) address:", idrxToken.address);
  console.log("LoyaltyPoint address:", loyaltyPoint.address);
  console.log("Platform fee:", platformFee, "basis points (2%)");
  console.log("Fee recipient:", feeRecipient);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 