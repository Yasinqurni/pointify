require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
    },
    liskTestnet: {
      url: "https://rpc.testnet.lisk.com", // Replace with actual Lisk testnet RPC
      accounts: [process.env.PRIVATE_KEY], // Add your private key to .env
      chainId: 4202, // Replace with actual Lisk testnet chain ID
    },
    liskMainnet: {
      url: "https://rpc.lisk.com", // Replace with actual Lisk mainnet RPC
      accounts: [process.env.PRIVATE_KEY], // Add your private key to .env
      chainId: 189, // Replace with actual Lisk mainnet chain ID
    }
  },
  etherscan: {
    apiKey: {
      liskTestnet: process.env.LISK_API_KEY, // Add your Lisk API key to .env
      liskMainnet: process.env.LISK_API_KEY,
    },
    customChains: [
      {
        network: "liskTestnet",
        chainId: 4202,
        urls: {
          apiURL: "https://explorer.testnet.lisk.com/api", // Replace with actual explorer API
          browserURL: "https://explorer.testnet.lisk.com"
        }
      },
      {
        network: "liskMainnet",
        chainId: 189,
        urls: {
          apiURL: "https://explorer.lisk.com/api", // Replace with actual explorer API
          browserURL: "https://explorer.lisk.com"
        }
      }
    ]
  }
};
