const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoyaltyPoint", function () {
  let LoyaltyPoint, loyaltyPoint, idrxToken, owner, merchant, user1, user2, feeRecipient;
  const initialSupply = ethers.utils.parseEther("1000000");
  const platformFee = 200; // 2% in basis points

  beforeEach(async function () {
    [owner, merchant, user1, user2, feeRecipient] = await ethers.getSigners();

    // Deploy mock IDRX token (ERC20)
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    idrxToken = await ERC20Mock.deploy("IDRX", "IDRX", owner.address, initialSupply);
    await idrxToken.deployed();

    // Deploy LoyaltyPoint contract
    LoyaltyPoint = await ethers.getContractFactory("LoyaltyPoint");
    loyaltyPoint = await LoyaltyPoint.deploy(idrxToken.address, platformFee, feeRecipient.address);
    await loyaltyPoint.deployed();

    // Distribute IDRX to merchant
    await idrxToken.transfer(merchant.address, ethers.utils.parseEther("10000"));
  });

  it("should allow merchant to top up IDRX and increase quota", async function () {
    await idrxToken.connect(merchant).approve(loyaltyPoint.address, ethers.utils.parseEther("1000"));
    await expect(loyaltyPoint.connect(merchant).topUpIDRX(ethers.utils.parseEther("1000")))
      .to.emit(loyaltyPoint, "TopUpIDRX")
      .withArgs(merchant.address, ethers.utils.parseEther("1000"));
    expect(await loyaltyPoint.merchantQuota(merchant.address)).to.equal(ethers.utils.parseEther("1000"));
  });

  it("should allow merchant to withdraw IDRX if quota available", async function () {
    await idrxToken.connect(merchant).approve(loyaltyPoint.address, ethers.utils.parseEther("500"));
    await loyaltyPoint.connect(merchant).topUpIDRX(ethers.utils.parseEther("500"));
    await expect(loyaltyPoint.connect(merchant).withdrawIDRX(ethers.utils.parseEther("200")))
      .to.emit(loyaltyPoint, "WithdrawIDRX")
      .withArgs(merchant.address, ethers.utils.parseEther("200"));
    expect(await loyaltyPoint.merchantQuota(merchant.address)).to.equal(ethers.utils.parseEther("300"));
  });

  it("should allow merchant to issue point to user if quota sufficient", async function () {
    await idrxToken.connect(merchant).approve(loyaltyPoint.address, ethers.utils.parseEther("100"));
    await loyaltyPoint.connect(merchant).topUpIDRX(ethers.utils.parseEther("100"));
    await expect(loyaltyPoint.connect(merchant).issuePoint(user1.address, ethers.utils.parseEther("50")))
      .to.emit(loyaltyPoint, "IssuePoint")
      .withArgs(merchant.address, user1.address, ethers.utils.parseEther("50"));
    expect(await loyaltyPoint.userPoint(user1.address)).to.equal(ethers.utils.parseEther("50"));
    expect(await loyaltyPoint.merchantQuota(merchant.address)).to.equal(ethers.utils.parseEther("50"));
  });

  it("should allow user to transfer point to another user", async function () {
    await idrxToken.connect(merchant).approve(loyaltyPoint.address, ethers.utils.parseEther("100"));
    await loyaltyPoint.connect(merchant).topUpIDRX(ethers.utils.parseEther("100"));
    await loyaltyPoint.connect(merchant).issuePoint(user1.address, ethers.utils.parseEther("60"));
    await expect(loyaltyPoint.connect(user1).transferPoint(user2.address, ethers.utils.parseEther("20")))
      .to.emit(loyaltyPoint, "TransferPoint")
      .withArgs(user1.address, user2.address, ethers.utils.parseEther("20"));
    expect(await loyaltyPoint.userPoint(user1.address)).to.equal(ethers.utils.parseEther("40"));
    expect(await loyaltyPoint.userPoint(user2.address)).to.equal(ethers.utils.parseEther("20"));
  });

  it("should allow user to redeem point for IDRX and platform receives fee", async function () {
    await idrxToken.connect(merchant).approve(loyaltyPoint.address, ethers.utils.parseEther("100"));
    await loyaltyPoint.connect(merchant).topUpIDRX(ethers.utils.parseEther("100"));
    await loyaltyPoint.connect(merchant).issuePoint(user1.address, ethers.utils.parseEther("50"));
    const redeemAmount = ethers.utils.parseEther("50");
    const fee = redeemAmount.mul(platformFee).div(10000);
    const payout = redeemAmount.sub(fee);
    await expect(loyaltyPoint.connect(user1).redeemPoint(redeemAmount))
      .to.emit(loyaltyPoint, "RedeemPoint")
      .withArgs(user1.address, payout, fee);
    expect(await idrxToken.balanceOf(user1.address)).to.equal(payout);
    expect(await idrxToken.balanceOf(feeRecipient.address)).to.equal(fee);
    expect(await loyaltyPoint.userPoint(user1.address)).to.equal(0);
  });

  it("should not allow merchant to issue more point than quota", async function () {
    await idrxToken.connect(merchant).approve(loyaltyPoint.address, ethers.utils.parseEther("10"));
    await loyaltyPoint.connect(merchant).topUpIDRX(ethers.utils.parseEther("10"));
    await expect(loyaltyPoint.connect(merchant).issuePoint(user1.address, ethers.utils.parseEther("20")))
      .to.be.revertedWith("Not enough quota");
  });

  it("should not allow user to redeem more point than they have", async function () {
    await idrxToken.connect(merchant).approve(loyaltyPoint.address, ethers.utils.parseEther("100"));
    await loyaltyPoint.connect(merchant).topUpIDRX(ethers.utils.parseEther("100"));
    await loyaltyPoint.connect(merchant).issuePoint(user1.address, ethers.utils.parseEther("10"));
    await expect(loyaltyPoint.connect(user1).redeemPoint(ethers.utils.parseEther("20")))
      .to.be.revertedWith("Not enough point");
  });
}); 