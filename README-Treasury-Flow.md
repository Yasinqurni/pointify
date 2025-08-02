# Treasury Flow - Pointify Token System

## Overview

Treasury Flow adalah sistem baru untuk Pointify yang mengimplementasikan alur token yang lebih terpusat dan terkontrol. Sistem ini menggunakan Treasury sebagai pusat penyimpanan IDRX yang mendukung token PLT.

## Arsitektur

### Kontrak Utama

1. **PointifyToken** - Token ERC20 dengan fungsi mint/burn
2. **TreasuryManager** - Mengelola semua operasi treasury
3. **Treasury** - Menyimpan IDRX sebagai backing untuk PLT

### Alur Sistem

```
1. Merchant Registration
   Admin → TreasuryManager.registerMerchant()

2. Merchant Swap IDRX → PLT (Minting)
   Merchant → TreasuryManager.swapIDRXToPLT()
   - IDRX masuk ke Treasury
   - PLT di-mint untuk merchant

3. Merchant Reward User
   Merchant → TreasuryManager.sendReward()
   - PLT ditransfer dari merchant ke user

4. User Redeem to Merchant
   User → TreasuryManager.redeemToMerchant()
   - PLT ditransfer dari user ke merchant

5. User Swap PLT → IDRX (Burning)
   User → TreasuryManager.swapPLTToIDRX()
   - PLT di-burn
   - IDRX keluar dari Treasury ke user
```

## Deployment

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Set required variables
IDRX_TOKEN_ADDRESS=0x...
PRIVATE_KEY=0x...
```

### 2. Deploy Contracts

```bash
# Deploy semua kontrak Loyalty Point
npx hardhat deploy-loyalty

# Atau manual
npx hardhat run scripts/deploy-loyalty-point.js
```

### 3. Verify Deployment

```bash
# Test functionality
npx hardhat test-loyalty

# Run demo
npx hardhat demo-loyalty
```

## Penggunaan

### Merchant Registration

```javascript
// Admin mendaftarkan merchant
await treasuryManager.registerMerchant(merchantAddress, true);
```

### Merchant Operations

```javascript
// 1. Merchant swap IDRX → PLT
const amount = ethers.parseEther("100");
await idrxToken.connect(merchant).approve(treasuryManagerAddress, amount);
await treasuryManager.connect(merchant).swapIDRXToPLT(amount);

// 2. Merchant reward user
const rewardAmount = ethers.parseEther("50");
await treasuryManager.connect(merchant).sendReward(userAddress, rewardAmount);
```

### User Operations

```javascript
// 1. User redeem ke merchant
const redeemAmount = ethers.parseEther("25");
await treasuryManager.connect(user).redeemToMerchant(merchantAddress, redeemAmount);

// 2. User swap PLT → IDRX
const swapAmount = ethers.parseEther("10");
await treasuryManager.connect(user).swapPLTToIDRX(swapAmount);
```

## Keamanan

### Access Control

- **onlyOwner**: Hanya admin yang bisa register merchant
- **onlyTreasuryManager**: Hanya TreasuryManager yang bisa mint/burn PLT
- **onlyRegisteredMerchant**: Hanya merchant terdaftar yang bisa reward user

### Validasi

- Merchant harus terdaftar untuk melakukan operasi
- Balance check sebelum transfer/burn
- 1:1 ratio antara PLT dan IDRX backing

## Monitoring

### Events

```solidity
// TreasuryManager events
event MerchantRegistered(address merchant, bool status);
event IDRXSwappedToPLT(address merchant, uint256 idrxAmount, uint256 pltAmount);
event RewardSent(address merchant, address user, uint256 amount);
event RedeemedToMerchant(address user, address merchant, uint256 amount);
event PLTSwappedToIDRX(address user, uint256 pltAmount, uint256 idrxAmount);

// PointifyToken events
event Transfer(address from, address to, uint256 value);
event Mint(address to, uint256 amount);
event Burn(address from, uint256 amount);
```

### Queries

```javascript
// Check balances
const pltBalance = await pointifyToken.balanceOf(address);
const idrxBalance = await idrxToken.balanceOf(address);
const treasuryBalance = await treasury.getIDRXBalance();

// Check status
const isRegistered = await treasuryManager.registeredMerchants(merchantAddress);
const totalSupply = await pointifyToken.totalSupply();
```

## Testing

### Unit Tests

```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/TreasuryFlow.test.js
```

### Integration Tests

```bash
# Test complete flow
npx hardhat test-loyalty

# Demo with multiple participants
npx hardhat demo-loyalty
```

## Keuntungan Treasury Flow

### 1. Centralized Backing
- Semua IDRX tersimpan di Treasury
- Mudah untuk audit dan monitoring
- Transparansi penuh atas backing

### 2. Controlled Supply
- PLT hanya di-mint saat ada IDRX backing
- PLT di-burn saat user cash out
- Tidak ada inflasi tanpa backing

### 3. Flexibility
- Merchant bisa top up kapan saja
- User bisa cash out kapan saja
- Sistem reward yang fleksibel

### 4. Security
- Multi-layer access control
- Event logging untuk semua operasi
- Emergency functions untuk admin

## Roadmap

### Phase 1: Core Implementation ✅
- Basic Treasury Flow contracts
- Deployment scripts
- Testing framework

### Phase 2: Enhanced Features
- Fee system untuk operasi
- Batch operations
- Advanced analytics

### Phase 3: Integration
- Frontend integration
- Mobile app support
- Third-party integrations

## Support

Untuk pertanyaan atau bantuan:
- Check dokumentasi di `/docs`
- Run demo: `npx hardhat demo-loyalty`
- Contact: [support@pointify.com]