// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20Mock.sol";

/**
 * @title IDRXFaucet
 * @dev Extended IDRX Mock contract with daily faucet functionality
 * Allows users to claim 1000 IDRX tokens once per day
 */
contract IDRXFaucet is IDRXMock {
    // Faucet configuration
    uint256 public constant DAILY_CLAIM_AMOUNT = 1000 * 10**18; // 1000 IDRX with 18 decimals
    uint256 public constant CLAIM_COOLDOWN = 24 hours; // 24 hours cooldown
    
    // Track last claim time for each address
    mapping(address => uint256) public lastClaimTime;
    
    // Events
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetRefilled(address indexed owner, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) IDRXMock(name, symbol, initialAccount, initialBalance) {
        // Constructor inherits from IDRXMock
    }
    
    /**
     * @dev Public faucet function - allows anyone to claim 1000 IDRX once per day
     * @return success Whether the claim was successful
     */
    function faucet() external returns (bool success) {
        return claimTokens(msg.sender);
    }
    
    /**
     * @dev Public claim function - alias for faucet
     * @return success Whether the claim was successful
     */
    function claim() external returns (bool success) {
        return claimTokens(msg.sender);
    }
    
    /**
     * @dev Internal function to handle token claiming logic
     * @param user Address to receive the tokens
     * @return success Whether the claim was successful
     */
    function claimTokens(address user) internal returns (bool success) {
        require(user != address(0), "Cannot claim to zero address");
        
        // Check if user can claim (24 hours cooldown)
        require(
            block.timestamp >= lastClaimTime[user] + CLAIM_COOLDOWN,
            "Claim cooldown not met. You can claim once every 24 hours"
        );
        
        // Check if contract has enough tokens to distribute
        require(
            balanceOf(owner()) >= DAILY_CLAIM_AMOUNT,
            "Faucet is empty. Please contact admin to refill"
        );
        
        // Update last claim time
        lastClaimTime[user] = block.timestamp;
        
        // Transfer tokens from owner to user
        _transfer(owner(), user, DAILY_CLAIM_AMOUNT);
        
        emit TokensClaimed(user, DAILY_CLAIM_AMOUNT, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Check if a user can claim tokens
     * @param user Address to check
     * @return canClaim Whether the user can claim
     * @return timeUntilNextClaim Seconds until next claim is available
     */
    function canUserClaim(address user) external view returns (bool canClaim, uint256 timeUntilNextClaim) {
        if (lastClaimTime[user] == 0) {
            // User has never claimed
            return (true, 0);
        }
        
        uint256 nextClaimTime = lastClaimTime[user] + CLAIM_COOLDOWN;
        
        if (block.timestamp >= nextClaimTime) {
            return (true, 0);
        } else {
            return (false, nextClaimTime - block.timestamp);
        }
    }
    
    /**
     * @dev Get user's last claim time
     * @param user Address to check
     * @return timestamp Last claim timestamp
     */
    function getUserLastClaimTime(address user) external view returns (uint256 timestamp) {
        return lastClaimTime[user];
    }
    
    /**
     * @dev Owner function to refill the faucet
     * @param amount Amount of tokens to mint to owner for faucet distribution
     */
    function refillFaucet(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        _mint(owner(), amount);
        emit FaucetRefilled(owner(), amount);
    }
    
    /**
     * @dev Get faucet status information
     * @return faucetBalance Current faucet balance (owner balance)
     * @return dailyAmount Amount distributed per claim
     * @return cooldownPeriod Cooldown period in seconds
     */
    function getFaucetInfo() external view returns (
        uint256 faucetBalance,
        uint256 dailyAmount,
        uint256 cooldownPeriod
    ) {
        return (
            balanceOf(owner()),
            DAILY_CLAIM_AMOUNT,
            CLAIM_COOLDOWN
        );
    }
    
    /**
     * @dev Emergency function to update claim amount (only owner)
     * @param newAmount New daily claim amount
     */
    function updateClaimAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Amount must be greater than zero");
        // Note: This would require making DAILY_CLAIM_AMOUNT non-constant
        // For now, this is just a placeholder for future upgrades
        revert("Claim amount is fixed at deployment");
    }
}