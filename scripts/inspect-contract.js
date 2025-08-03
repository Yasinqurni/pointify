const { ethers } = require("hardhat");

async function main() {
  console.log("Inspecting contract at 0x0e6A2cc12990B80943972E7E07828CeDb4119b0E...");

  const contractAddress = "0x0e6A2cc12990B80943972E7E07828CeDb4119b0E";
  
  // Try different common function names
  const functionNames = [
    "claim",
    "faucet", 
    "mint",
    "mintTo",
    "withdraw",
    "withdrawAll",
    "refillFaucet"
  ];

  const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.lisk.com");
  
  for (const funcName of functionNames) {
    try {
      // Create a minimal ABI for testing
      const testABI = [
        {
          "inputs": [],
          "name": funcName,
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      
      const contract = new ethers.Contract(contractAddress, testABI, provider);
      
      // Try to call the function (this will fail but we can see the error)
      await contract[funcName]();
      
    } catch (error) {
      if (error.message.includes("execution reverted")) {
        console.log(`✅ Function '${funcName}' exists but call failed (expected)`);
      } else if (error.message.includes("function not found")) {
        console.log(`❌ Function '${funcName}' not found`);
      } else {
        console.log(`❓ Function '${funcName}' - ${error.message}`);
      }
    }
  }

  // Also try to get some basic contract info
  try {
    const basicABI = [
      "function owner() view returns (address)",
      "function balanceOf(address) view returns (uint256)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function decimals() view returns (uint8)"
    ];
    
    const contract = new ethers.Contract(contractAddress, basicABI, provider);
    
    console.log("\n=== Contract Info ===");
    
    try {
      const owner = await contract.owner();
      console.log("Owner:", owner);
    } catch (e) {
      console.log("Owner: Not available");
    }
    
    try {
      const symbol = await contract.symbol();
      console.log("Symbol:", symbol);
    } catch (e) {
      console.log("Symbol: Not available");
    }
    
    try {
      const name = await contract.name();
      console.log("Name:", name);
    } catch (e) {
      console.log("Name: Not available");
    }
    
    try {
      const decimals = await contract.decimals();
      console.log("Decimals:", decimals);
    } catch (e) {
      console.log("Decimals: Not available");
    }
    
  } catch (error) {
    console.log("Could not get basic contract info:", error.message);
  }
}

main()
  .then(() => {
    console.log("Inspection complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Inspection failed:", error);
    process.exit(1);
  }); 