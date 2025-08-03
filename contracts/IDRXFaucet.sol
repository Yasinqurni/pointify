// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IIDRXToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title IDRXFaucet
 * @dev IDRX token faucet with daily claim functionality
 * Allows users to claim 10,000 IDRX tokens once per day
 */
contract IDRXFaucet {
    address public owner;
    IIDRXToken public idrxToken;
    uint256 public constant DAILY_LIMIT = 10_000 * 10**18; // 10,000 IDRX with 18 decimals
    uint256 public constant CLAIM_COOLDOWN = 1 days; // 24 hours cooldown
    
    mapping(address => uint256) public lastClaimedAt;
    
    // Events
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetRefilled(address indexed owner, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor(address _tokenAddress) {
        owner = msg.sender;
        idrxToken = IIDRXToken(_tokenAddress);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev Public claim function - allows anyone to claim 10,000 IDRX once per day
     */
    function claim() external {
        require(canClaim(msg.sender), "Already claimed in last 24h");
        require(idrxToken.balanceOf(address(this)) >= DAILY_LIMIT, "Faucet is empty");
        
        lastClaimedAt[msg.sender] = block.timestamp;
        
        require(idrxToken.transfer(msg.sender, DAILY_LIMIT), "Transfer failed");
        
        emit TokensClaimed(msg.sender, DAILY_LIMIT, block.timestamp);
    }
    
    /**
     * @dev Check if a user can claim tokens
     * @param user Address to check
     * @return canClaim Whether the user can claim
     */
    function canClaim(address user) public view returns (bool) {
        if (lastClaimedAt[user] == 0) {
            return true; // User has never claimed
        }
        return block.timestamp - lastClaimedAt[user] >= CLAIM_COOLDOWN;
    }
    
    /**
     * @dev Get user's last claim time
     * @param user Address to check
     * @return timestamp Last claim timestamp
     */
    function getUserLastClaimTime(address user) external view returns (uint256 timestamp) {
        return lastClaimedAt[user];
    }
    
    /**
     * @dev Check if a user can claim tokens with time until next claim
     * @param user Address to check
     * @return canClaim Whether the user can claim
     * @return timeUntilNextClaim Seconds until next claim is available
     */
    function canUserClaim(address user) external view returns (bool canClaim, uint256 timeUntilNextClaim) {
        if (lastClaimedAt[user] == 0) {
            // User has never claimed
            return (true, 0);
        }
        
        uint256 nextClaimTime = lastClaimedAt[user] + CLAIM_COOLDOWN;
        
        if (block.timestamp >= nextClaimTime) {
            return (true, 0);
        } else {
            return (false, nextClaimTime - block.timestamp);
        }
    }
    
    /**
     * @dev Get faucet status information
     * @return faucetBalance Current faucet balance
     * @return dailyAmount Amount distributed per claim
     * @return cooldownPeriod Cooldown period in seconds
     */
    function getFaucetInfo() external view returns (
        uint256 faucetBalance,
        uint256 dailyAmount,
        uint256 cooldownPeriod
    ) {
        return (
            idrxToken.balanceOf(address(this)),
            DAILY_LIMIT,
            CLAIM_COOLDOWN
        );
    }
    
    /**
     * @dev Owner function to refill the faucet
     * @param amount Amount of tokens to transfer to faucet
     */
    function refillFaucet(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(idrxToken.transfer(address(this), amount), "Transfer to faucet failed");
        emit FaucetRefilled(owner, amount);
    }
    
    /**
     * @dev Owner function to withdraw all tokens from faucet
     */
    function withdrawAll() external onlyOwner {
        uint256 balance = idrxToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(idrxToken.transfer(owner, balance), "Withdraw failed");
    }
    
    /**
     * @dev Owner function to withdraw specific amount of tokens from faucet
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(idrxToken.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(idrxToken.transfer(owner, amount), "Withdraw failed");
    }
    
    /**
     * @dev Transfer ownership to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}