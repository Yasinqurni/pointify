# 🔐 Admin Approval Guide untuk IDRXDistributor

## Overview
Setelah deploy `IDRXDistributor` contract, admin wallet harus **approve** contract tersebut untuk bisa menggunakan IDRX tokens milik admin. Ini adalah langkah wajib agar user bisa claim IDRX tokens.

## 🚀 Cara 1: Otomatis (Recommended)

### Deploy + Auto Approve
```bash
npx hardhat run scripts/deploy-idrx-distributor.js --network lisk-sepolia
```

Script deployment akan otomatis:
1. Deploy contract
2. Check admin IDRX balance
3. Auto-approve jika admin punya IDRX tokens
4. Approve 365,000 IDRX (untuk 1 tahun)

## 🔧 Cara 2: Manual Approval Script

### Jika auto-approve gagal atau butuh approve ulang:
```bash
npx hardhat run scripts/approve-idrx-distributor.js --network lisk-sepolia [DISTRIBUTOR_ADDRESS]
```

**Contoh:**
```bash
npx hardhat run scripts/approve-idrx-distributor.js --network lisk-sepolia 0x1234567890abcdef...
```

## 🌐 Cara 3: Manual via Block Explorer

### Langkah-langkah:
1. **Buka Block Explorer**
   - URL: https://sepolia-blockscout.lisk.com/address/0x7222435AC83D6c44052eB635112842Da458AEfD8
   - Ini adalah IDRX token contract

2. **Connect Wallet**
   - Klik "Connect Wallet"
   - Pilih MetaMask/Xellar
   - Pastikan network: Lisk Sepolia (Chain ID: 4202)

3. **Call Approve Function**
   - Scroll ke "Write Contract"
   - Cari function `approve`
   - Input parameters:
     - `spender`: [DISTRIBUTOR_CONTRACT_ADDRESS]
     - `amount`: `365000000000000000000000` (365,000 IDRX dalam wei)

4. **Execute Transaction**
   - Klik "Write"
   - Confirm di wallet
   - Tunggu konfirmasi

## 📊 Cara 4: Programmatic (Advanced)

### Menggunakan ethers.js:
```javascript
const { ethers } = require("ethers");

async function approveDistributor() {
    // Setup provider dan signer
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.lisk.com");
    const adminWallet = new ethers.Wallet("PRIVATE_KEY", provider);
    
    // Contract addresses
    const IDRX_ADDRESS = "0x7222435AC83D6c44052eB635112842Da458AEfD8";
    const DISTRIBUTOR_ADDRESS = "0x..."; // Your distributor address
    
    // Get IDRX contract
    const idrxContract = await ethers.getContractAt("IDRXFaucet", IDRX_ADDRESS, adminWallet);
    
    // Approve 365,000 IDRX
    const approvalAmount = ethers.parseEther("365000");
    const tx = await idrxContract.approve(DISTRIBUTOR_ADDRESS, approvalAmount);
    
    console.log("Transaction Hash:", tx.hash);
    await tx.wait();
    console.log("Approval successful!");
}
```

## ✅ Verifikasi Approval

### Check via Script:
```bash
npx hardhat console --network lisk-sepolia
```

```javascript
// Di console
const idrx = await ethers.getContractAt("ERC20", "0x7222435AC83D6c44052eB635112842Da458AEfD8");
const distributor = "0x..."; // Your distributor address
const admin = "0x..."; // Admin wallet address

// Check allowance
const allowance = await idrx.allowance(admin, distributor);
console.log("Allowance:", ethers.formatEther(allowance), "IDRX");
```

### Check via Block Explorer:
1. Buka IDRX contract di block explorer
2. Go to "Read Contract"
3. Call `allowance` function:
   - `owner`: [ADMIN_WALLET_ADDRESS]
   - `spender`: [DISTRIBUTOR_CONTRACT_ADDRESS]

## 🔄 Maintenance

### Re-approval Diperlukan Jika:
1. **Allowance habis** - Setelah banyak user claim
2. **Ganti admin wallet** - Admin baru perlu approve
3. **Deploy contract baru** - Contract address berubah

### Monitoring Allowance:
```javascript
// Check remaining allowance
const remaining = await idrx.allowance(adminAddress, distributorAddress);
console.log("Remaining allowance:", ethers.formatEther(remaining), "IDRX");

// Jika < 10,000 IDRX, consider re-approval
if (remaining < ethers.parseEther("10000")) {
    console.log("⚠️ Low allowance, consider re-approval");
}
```

## 🚨 Troubleshooting

### Error: "Insufficient allowance"
- **Solusi**: Run approval script lagi
- **Penyebab**: Allowance habis atau belum di-approve

### Error: "Insufficient funds for gas"
- **Solusi**: Top up admin wallet dengan ETH
- **Penyebab**: Admin wallet tidak punya ETH untuk gas

### Error: "Transaction failed"
- **Solusi**: Check network connection dan gas price
- **Penyebab**: Network congestion atau gas price terlalu rendah

## 📋 Checklist Admin Setup

- [ ] Deploy IDRXDistributor contract
- [ ] Admin wallet punya IDRX tokens
- [ ] Admin wallet punya ETH untuk gas
- [ ] Approve distributor contract (365,000 IDRX)
- [ ] Verify allowance > 0
- [ ] Test claim function
- [ ] Update frontend contract address
- [ ] Monitor allowance regularly

## 🔗 Useful Links

- **Lisk Sepolia RPC**: https://rpc.sepolia.lisk.com
- **Block Explorer**: https://sepolia-blockscout.lisk.com
- **IDRX Contract**: 0x7222435AC83D6c44052eB635112842Da458AEfD8
- **Chain ID**: 4202

## 💡 Best Practices

1. **Approve large amount** (1 year worth) untuk mengurangi maintenance
2. **Monitor allowance** secara berkala
3. **Keep admin wallet secure** - jangan share private key
4. **Backup admin wallet** - simpan seed phrase dengan aman
5. **Test di testnet** sebelum production