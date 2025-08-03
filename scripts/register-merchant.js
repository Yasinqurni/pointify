const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Registering merchant with account:", deployer.address);

  // Get the TreasuryManager contract
  const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
  const treasuryManager = await TreasuryManager.attach("0xC2ad80E574f02D984E0fD3dA3C4cD221431A8818"); // Replace with actual address

  // Merchant address to register
  const merchantAddress = "0x03722Ff08dd735567B2c3fF82eB331d92c307c3b";

  console.log("Registering merchant:", merchantAddress);
  
  try {
    const tx = await treasuryManager.registerMerchant(merchantAddress, true);
    await tx.wait();
    console.log("✅ Merchant registered successfully!");
    console.log("Transaction hash:", tx.hash);
  } catch (error) {
    console.error("❌ Failed to register merchant:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 