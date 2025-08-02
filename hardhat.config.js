require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.23",
  networks: {
    hardhat: {
    },
    'lisk-sepolia': {
      url: 'https://rpc.sepolia-api.lisk.com',
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4202,
      gasPrice: 1000000000,
    },
    liskTestnet: {
      url: "https://rpc.testnet.lisk.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4202,
      gasPrice: 1000000000,
    },
    liskMainnet: {
      url: "https://rpc.lisk.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 189,
      gasPrice: 1000000000,
    }
  },
  etherscan: {
    apiKey: {
      "lisk-sepolia": process.env.LISK_API_KEY || "abc123",
      liskTestnet: process.env.LISK_API_KEY || "abc123",
      liskMainnet: process.env.LISK_API_KEY || "abc123",
    },
    customChains: [
      {
        network: "lisk-sepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      },
      {
        network: "liskTestnet",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      },
      {
        network: "liskMainnet",
        chainId: 189,
        urls: {
          apiURL: "https://explorer.lisk.com/api",
          browserURL: "https://explorer.lisk.com"
        }
      }
    ]
  }
};

// Loyalty Point Tasks
task("deploy-loyalty", "Deploy Loyalty Point contracts")
  .setAction(async () => {
    await run("run", { script: "scripts/deploy-loyalty-point.js" });
  });

task("test-loyalty", "Test Loyalty Point functionality")
  .setAction(async () => {
    await run("run", { script: "scripts/test-loyalty-point.js" });
  });

task("demo-loyalty", "Run Loyalty Point demo")
  .setAction(async () => {
    await run("run", { script: "scripts/demo-loyalty-point.js" });
  });

// Task untuk mint IDRX-Mock
task("mint-idrx", "Mint IDRX-Mock tokens to wallets")
    .addOptionalParam("address", "Target address to mint to")
    .addOptionalParam("amount", "Amount to mint (in ether)", "10000")
    .setAction(async (taskArgs, hre) => {
        await hre.run("compile");
        await hre.run("run", { script: "scripts/mint-idrx-mock.js" });
    });

// Task untuk test merchant validation
task("test-merchant", "Test merchant registration validation")
    .setAction(async (taskArgs, hre) => {
        await hre.run("compile");
        await hre.run("run", { script: "scripts/test-merchant-validation.js" });
    });

// Task untuk verify contracts
task("verify-contracts", "Verify deployed contracts on block explorer")
    .setAction(async (taskArgs, hre) => {
        await hre.run("run", { script: "scripts/verify-contracts.js" });
    });
