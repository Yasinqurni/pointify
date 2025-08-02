const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("💰 IDRX-Mock Minting Script");
    console.log("============================");
    console.log("");

    // Get signers
    const [owner, merchant, user] = await ethers.getSigners();
    console.log("👤 Owner:", owner.address);
    console.log("🏪 Merchant:", merchant.address);
    console.log("👥 User:", user.address);
    console.log("");

    try {
        // Get IDRX Mock address from environment or deploy new one
        let idrxMockAddress = process.env.IDRX_MOCK_ADDRESS;
        let idrxMock;

        if (!idrxMockAddress) {
            console.log("📦 Deploying new IDRXMock...");
            const IDRXMock = await ethers.getContractFactory("IDRXMock");
            idrxMock = await IDRXMock.deploy(
                "Indonesian Rupiah X Mock",
                "IDRX-MOCK",
                owner.address,
                ethers.parseEther("1000000") // 1M initial supply
            );
            await idrxMock.waitForDeployment();
            idrxMockAddress = await idrxMock.getAddress();
            console.log("✅ IDRXMock deployed to:", idrxMockAddress);
        } else {
            console.log("📋 Using existing IDRXMock at:", idrxMockAddress);
            const IDRXMock = await ethers.getContractFactory("IDRXMock");
            idrxMock = IDRXMock.attach(idrxMockAddress);
        }

        console.log("");
        console.log("📊 Initial Balances:");
        const ownerBalance = await idrxMock.balanceOf(owner.address);
        const merchantBalance = await idrxMock.balanceOf(merchant.address);
        const userBalance = await idrxMock.balanceOf(user.address);
        
        console.log("   Owner:", ethers.formatEther(ownerBalance), "IDRX-MOCK");
        console.log("   Merchant:", ethers.formatEther(merchantBalance), "IDRX-MOCK");
        console.log("   User:", ethers.formatEther(userBalance), "IDRX-MOCK");

        console.log("");
        console.log("💸 Minting IDRX-Mock to wallets...");

        // Mint to merchant (for merchant registration requirement)
        const mintToMerchantAmount = ethers.parseEther("50000"); // 50K IDRX-MOCK
        console.log("   • Minting", ethers.formatEther(mintToMerchantAmount), "IDRX-MOCK to merchant...");
        const mintToMerchantTx = await idrxMock.mint(merchant.address, mintToMerchantAmount);
        await mintToMerchantTx.wait();
        console.log("   ✅ Minted to merchant");

        // Mint to user
        const mintToUserAmount = ethers.parseEther("25000"); // 25K IDRX-MOCK
        console.log("   • Minting", ethers.formatEther(mintToUserAmount), "IDRX-MOCK to user...");
        const mintToUserTx = await idrxMock.mint(user.address, mintToUserAmount);
        await mintToUserTx.wait();
        console.log("   ✅ Minted to user");

        console.log("");
        console.log("📊 Final Balances:");
        const finalOwnerBalance = await idrxMock.balanceOf(owner.address);
        const finalMerchantBalance = await idrxMock.balanceOf(merchant.address);
        const finalUserBalance = await idrxMock.balanceOf(user.address);
        
        console.log("   Owner:", ethers.formatEther(finalOwnerBalance), "IDRX-MOCK");
        console.log("   Merchant:", ethers.formatEther(finalMerchantBalance), "IDRX-MOCK");
        console.log("   User:", ethers.formatEther(finalUserBalance), "IDRX-MOCK");

        console.log("");
        console.log("🧪 Testing onlyOwner restriction...");
        
        try {
            // Try to mint from non-owner account (should fail)
            const unauthorizedMintAmount = ethers.parseEther("1000");
            console.log("   • Attempting unauthorized mint from merchant account...");
            await idrxMock.connect(merchant).mint(user.address, unauthorizedMintAmount);
            console.log("   ❌ ERROR: Unauthorized mint should have failed!");
        } catch (error) {
            console.log("   ✅ Unauthorized mint correctly rejected:", error.message.split("(")[0]);
        }

        console.log("");
        console.log("🎯 Testing mintTo function...");
        
        // Test mintTo function (transfer from owner)
        const mintToAmount = ethers.parseEther("10000"); // 10K IDRX-MOCK
        console.log("   • Using mintTo to transfer", ethers.formatEther(mintToAmount), "IDRX-MOCK to user...");
        const mintToTx = await idrxMock.mintTo(user.address, mintToAmount);
        await mintToTx.wait();
        console.log("   ✅ MintTo successful");

        const finalUserBalanceAfterMintTo = await idrxMock.balanceOf(user.address);
        console.log("   📊 User balance after mintTo:", ethers.formatEther(finalUserBalanceAfterMintTo), "IDRX-MOCK");

        console.log("");
        console.log("📋 Contract Information:");
        console.log("   • Contract Address:", idrxMockAddress);
        console.log("   • Token Name:", await idrxMock.name());
        console.log("   • Token Symbol:", await idrxMock.symbol());
        console.log("   • Total Supply:", ethers.formatEther(await idrxMock.totalSupply()), "IDRX-MOCK");
        console.log("   • Owner:", await idrxMock.owner());

        console.log("");
        console.log("✅ IDRX-Mock minting completed successfully!");
        console.log("");
        console.log("💡 Environment Variable:");
        console.log(`IDRX_MOCK_ADDRESS=${idrxMockAddress}`);

        return {
            idrxMockAddress,
            ownerBalance: finalOwnerBalance,
            merchantBalance: finalMerchantBalance,
            userBalance: finalUserBalanceAfterMintTo
        };

    } catch (error) {
        console.error("❌ Minting failed:", error.message);
        
        if (error.message.includes("OwnableUnauthorizedAccount")) {
            console.log("");
            console.log("💡 Tip: Only the contract owner can mint IDRX-Mock tokens");
        }
        
        if (error.message.includes("insufficient funds")) {
            console.log("");
            console.log("💡 Tip: Make sure you have enough ETH for gas fees");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });