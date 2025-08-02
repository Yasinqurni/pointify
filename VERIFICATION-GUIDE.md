# 🔍 Smart Contract Verification Guide

Panduan lengkap untuk verify smart contract Pointify Loyalty System di berbagai network.

## 📋 Prerequisites

1. **API Key**: Dapatkan API key dari block explorer yang sesuai
2. **Deployed Contracts**: Contract harus sudah di-deploy di network target
3. **Constructor Arguments**: Pastikan Anda tahu parameter yang digunakan saat deploy

## 🌐 Supported Networks

### 1. **Lisk Sepolia Testnet**
- **RPC URL**: `https://rpc.sepolia-api.lisk.com`
- **Chain ID**: `4202`
- **Explorer**: https://sepolia-blockscout.lisk.com
- **API Key**: Tidak diperlukan (gunakan `abc123`)

### 2. **Lisk Mainnet**
- **RPC URL**: `https://rpc.lisk.com`
- **Chain ID**: `189`
- **Explorer**: https://explorer.lisk.com
- **API Key**: Diperlukan dari Lisk Explorer

## 🚀 Quick Start

### Step 1: Setup Environment
```bash
# Tambahkan ke .env file
LISK_API_KEY=your_api_key_here
```

### Step 2: Deploy ke Testnet
```bash
# Deploy semua contract ke Lisk Sepolia
npx hardhat deploy-loyalty --network lisk-sepolia
```

### Step 3: Verify Contracts
```bash
# Verify semua contract sekaligus
npx hardhat verify-contracts --network lisk-sepolia

# Atau verify manual per contract
npx hardhat verify --network lisk-sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📝 Manual Verification Commands

### IDRXMock (ERC20Mock)
```bash
npx hardhat verify --network lisk-sepolia <IDRX_MOCK_ADDRESS> \
  "IDRX-MOCK" \
  "IDRX-MOCK" \
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
  "1000000000000000000000000"
```

### PointifyToken
```bash
npx hardhat verify --network lisk-sepolia <POINTIFY_TOKEN_ADDRESS> \
  <IDRX_MOCK_ADDRESS>
```

### Treasury
```bash
npx hardhat verify --network lisk-sepolia <TREASURY_ADDRESS> \
  <IDRX_MOCK_ADDRESS>
```

### TreasuryManager
```bash
npx hardhat verify --network lisk-sepolia <TREASURY_MANAGER_ADDRESS> \
  <POINTIFY_TOKEN_ADDRESS> \
  <IDRX_MOCK_ADDRESS> \
  <TREASURY_ADDRESS>
```

## 🛠️ Available Commands

### Hardhat Tasks
```bash
# Deploy contracts
npx hardhat deploy-loyalty --network <network>

# Verify contracts
npx hardhat verify-contracts --network <network>

# Test functionality
npx hardhat test-loyalty --network <network>
```

### Makefile Commands
```bash
# Deploy to testnet
make deploy-testnet

# Verify on testnet
make verify-testnet CONTRACT_ADDRESS=<address> IDRX_TOKEN_ADDRESS=<address> PLATFORM_FEE=200 FEE_RECIPIENT=<address>

# Deploy to mainnet
make deploy-mainnet

# Verify on mainnet
make verify-mainnet CONTRACT_ADDRESS=<address> IDRX_TOKEN_ADDRESS=<address> PLATFORM_FEE=200 FEE_RECIPIENT=<address>
```

## ⚠️ Common Issues & Solutions

### 1. **API Key Error**
```
Error: You are trying to verify a contract in 'liskTestnet', but no API token was found
```
**Solution**: Tambahkan `LISK_API_KEY` ke file `.env`

### 2. **Constructor Arguments Mismatch**
```
Error: The constructor arguments provided do not match the constructor arguments
```
**Solution**: Pastikan constructor arguments exact match dengan yang digunakan saat deploy

### 3. **Already Verified**
```
Error: Contract source code already verified
```
**Solution**: Contract sudah verified, tidak perlu verify lagi

### 4. **Network Not Supported**
```
Error: Cannot verify contracts on localhost network
```
**Solution**: Deploy ke testnet atau mainnet terlebih dahulu

## 📊 Contract Information

### Current Localhost Deployment
```
IDRX Mock: 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
Pointify Token: 0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
Treasury Manager: 0x0B306BF915C4d645ff596e518fAf3F9669b97016
Treasury: 0x68B1D87F95878fE05B998F19b66F4baba5De1aed
```

### Constructor Arguments
- **IDRXMock**: `("IDRX-MOCK", "IDRX-MOCK", deployer, 1000000 * 10^18)`
- **PointifyToken**: `(idrxMockAddress)`
- **Treasury**: `(idrxMockAddress)`
- **TreasuryManager**: `(pointifyTokenAddress, idrxMockAddress, treasuryAddress)`

## 🔗 Useful Links

- [Lisk Sepolia Explorer](https://sepolia-blockscout.lisk.com)
- [Lisk Mainnet Explorer](https://explorer.lisk.com)
- [Hardhat Verification Plugin](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html)

## 💡 Tips

1. **Always verify on testnet first** sebelum mainnet
2. **Save constructor arguments** untuk reference
3. **Use environment variables** untuk sensitive data
4. **Check explorer** untuk memastikan verification berhasil
5. **Flatten contracts** jika diperlukan untuk complex contracts

## 🎯 Next Steps

Setelah verification berhasil:
1. Update frontend dengan contract addresses
2. Test semua functionality di testnet
3. Deploy ke mainnet jika sudah siap
4. Verify di mainnet explorer