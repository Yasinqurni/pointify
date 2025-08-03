const { ethers } = require("hardhat");

async function main() {
  console.log("Checking contract at 0x0e6A2cc12990B80943972E7E07828CeDb4119b0E...");

  const contractAddress = "0x0e6A2cc12990B80943972E7E07828CeDb4119b0E";
  
  const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.lisk.com");
  
  try {
    // Check if the contract exists by getting its code
    const code = await provider.getCode(contractAddress);
    console.log("Contract code length:", code.length);
    
    if (code === "0x") {
      console.log("❌ No contract found at this address");
      return;
    }
    
    console.log("✅ Contract exists at this address");
    
    // Try to get basic contract info
    const basicABI = [
      "function owner() view returns (address)",
      "function claim()",
      "function canClaim(address) view returns (bool)",
      "function DAILY_LIMIT() view returns (uint256)",
      "function pltToken() view returns (address)"
    ];
    
    const contract = new ethers.Contract(contractAddress, basicABI, provider);
    
    console.log("\n=== Contract Info ===");
    
    try {
      const owner = await contract.owner();
      console.log("Owner:", owner);
    } catch (e) {
      console.log("Owner: Not available -", e.message);
    }
    
    try {
      const dailyLimit = await contract.DAILY_LIMIT();
      console.log("Daily Limit:", ethers.formatEther(dailyLimit), "tokens");
    } catch (e) {
      console.log("Daily Limit: Not available -", e.message);
    }
    
    try {
      const pltToken = await contract.pltToken();
      console.log("PLT Token:", pltToken);
    } catch (e) {
      console.log("PLT Token: Not available -", e.message);
    }
    
    // Test if claim function exists by trying to estimate gas
    try {
      const [signer] = await ethers.getSigners();
      const contractWithSigner = new ethers.Contract(contractAddress, basicABI, signer);
      const gasEstimate = await contractWithSigner.estimateGas.claim();
      console.log("✅ Claim function exists, gas estimate:", gasEstimate.toString());
    } catch (e) {
      console.log("❌ Claim function not available:", e.message);
    }
    
  } catch (error) {
    console.error("Error checking contract:", error);
  }
}

main()
  .then(() => {
    console.log("Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Check failed:", error);
    process.exit(1);
  }); 