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
      "lisk-sepolia": "123",
      liskTestnet: process.env.LISK_API_KEY,
      liskMainnet: process.env.LISK_API_KEY,
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
          apiURL: "https://explorer.testnet.lisk.com/api",
          browserURL: "https://explorer.testnet.lisk.com"
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
