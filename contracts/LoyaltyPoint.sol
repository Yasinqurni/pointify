// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract LoyaltyPoint {
    IERC20 public immutable idrxToken;
    address public owner;
    uint256 public platformFee;
    address public feeRecipient;

    mapping(address => uint256) public merchantQuota;
    mapping(address => uint256) public userPoint;

    event TopUpIDRX(address indexed merchant, uint256 amount);
    event WithdrawIDRX(address indexed merchant, uint256 amount);
    event IssuePoint(address indexed merchant, address indexed to, uint256 amount);
    event TransferPoint(address indexed from, address indexed to, uint256 amount);
    event RedeemPoint(address indexed user, uint256 amount, uint256 fee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not platform owner");
        _;
    }

    constructor(address _idrxToken, uint256 _platformFee, address _feeRecipient) {
        idrxToken = IERC20(_idrxToken);
        owner = msg.sender;
        platformFee = _platformFee;
        feeRecipient = _feeRecipient;
    }

    function topUpIDRX(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(idrxToken.transferFrom(msg.sender, address(this), amount), "IDRX transfer failed");
        merchantQuota[msg.sender] += amount;
        emit TopUpIDRX(msg.sender, amount);
    }

    function withdrawIDRX(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(merchantQuota[msg.sender] >= amount, "Not enough quota");
        merchantQuota[msg.sender] -= amount;
        require(idrxToken.transfer(msg.sender, amount), "IDRX transfer failed");
        emit WithdrawIDRX(msg.sender, amount);
    }

    function issuePoint(address to, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(merchantQuota[msg.sender] >= amount, "Not enough quota");
        merchantQuota[msg.sender] -= amount;
        userPoint[to] += amount;
        emit IssuePoint(msg.sender, to, amount);
    }

    function transferPoint(address to, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(userPoint[msg.sender] >= amount, "Not enough point");
        userPoint[msg.sender] -= amount;
        userPoint[to] += amount;
        emit TransferPoint(msg.sender, to, amount);
    }

    function redeemPoint(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(userPoint[msg.sender] >= amount, "Not enough point");
        uint256 totalIDRX = amount;
        require(idrxToken.balanceOf(address(this)) >= totalIDRX, "Not enough IDRX in treasury");
        userPoint[msg.sender] -= amount;
        uint256 fee = (platformFee * amount) / 10000;
        uint256 payout = amount - fee;
        require(idrxToken.transfer(msg.sender, payout), "IDRX transfer failed");
        if (fee > 0) {
            require(idrxToken.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        emit RedeemPoint(msg.sender, payout, fee);
    }


    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        platformFee = _platformFee;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
} 