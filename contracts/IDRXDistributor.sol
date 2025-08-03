// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title IDRXDistributor
 * @dev Contract untuk mendistribusikan IDRX tokens dari admin wallet ke users
 * Admin harus approve contract ini untuk menggunakan IDRX tokens mereka
 */
contract IDRXDistributor is Ownable, ReentrancyGuard {
    IERC20 public immutable idrxToken;
    
    // Konfigurasi distribusi
    uint256 public constant DAILY_CLAIM_AMOUNT = 10000 * 10**18; // 10000 IDRX
    uint256 public constant CLAIM_COOLDOWN = 24 hours; // 24 jam cooldown
    
    // Track last claim time untuk setiap address
    mapping(address => uint256) public lastClaimTime;
    
    // Admin wallet yang menyediakan IDRX tokens
    address public adminWallet;
    
    // Events
    event TokensDistributed(address indexed user, uint256 amount, uint256 timestamp);
    event AdminWalletUpdated(address indexed oldAdmin, address indexed newAdmin);
    event ClaimAmountUpdated(uint256 oldAmount, uint256 newAmount);
    
    constructor(address _idrxToken, address _adminWallet) Ownable(msg.sender) {
        require(_idrxToken != address(0), "Invalid IDRX token address");
        require(_adminWallet != address(0), "Invalid admin wallet address");
        
        idrxToken = IERC20(_idrxToken);
        adminWallet = _adminWallet;
    }
    
    /**
     * @dev Public function untuk claim IDRX tokens
     * Mengambil tokens dari admin wallet dan mengirimkannya ke user
     */
    function claimTokens() external nonReentrant returns (bool) {
        address user = msg.sender;
        
        require(user != address(0), "Invalid user address");
        
        // Check cooldown period
        require(
            block.timestamp >= lastClaimTime[user] + CLAIM_COOLDOWN,
            "Claim cooldown not met. You can claim once every 24 hours"
        );
        
        // Check admin wallet balance
        uint256 adminBalance = idrxToken.balanceOf(adminWallet);
        require(
            adminBalance >= DAILY_CLAIM_AMOUNT,
            "Insufficient admin balance for distribution"
        );
        
        // Check allowance from admin wallet
        uint256 allowance = idrxToken.allowance(adminWallet, address(this));
        require(
            allowance >= DAILY_CLAIM_AMOUNT,
            "Insufficient allowance from admin wallet. Admin needs to approve this contract"
        );
        
        // Update last claim time
        lastClaimTime[user] = block.timestamp;
        
        // Transfer tokens from admin wallet to user
        bool success = idrxToken.transferFrom(adminWallet, user, DAILY_CLAIM_AMOUNT);
        require(success, "Token transfer failed");
        
        emit TokensDistributed(user, DAILY_CLAIM_AMOUNT, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Check if user dapat claim tokens
     */
    function canUserClaim(address user) external view returns (bool canClaim, uint256 timeUntilNextClaim) {
        if (lastClaimTime[user] == 0) {
            // User belum pernah claim
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
     */
    function getUserLastClaimTime(address user) external view returns (uint256) {
        return lastClaimTime[user];
    }
    
    /**
     * @dev Get distributor information
     */
    function getDistributorInfo() external view returns (
        address tokenAddress,
        address admin,
        uint256 dailyAmount,
        uint256 cooldownPeriod,
        uint256 adminBalance,
        uint256 adminAllowance
    ) {
        return (
            address(idrxToken),
            adminWallet,
            DAILY_CLAIM_AMOUNT,
            CLAIM_COOLDOWN,
            idrxToken.balanceOf(adminWallet),
            idrxToken.allowance(adminWallet, address(this))
        );
    }
    
    /**
     * @dev Update admin wallet (only owner)
     */
    function updateAdminWallet(address newAdminWallet) external onlyOwner {
        require(newAdminWallet != address(0), "Invalid admin wallet address");
        
        address oldAdmin = adminWallet;
        adminWallet = newAdminWallet;
        
        emit AdminWalletUpdated(oldAdmin, newAdminWallet);
    }
    
    /**
     * @dev Emergency function untuk withdraw tokens yang tersisa (only owner)
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        
        IERC20(token).transfer(to, amount);
    }
    
    /**
     * @dev Check if admin has sufficient balance and allowance
     */
    function checkAdminStatus() external view returns (
        bool hasSufficientBalance,
        bool hasSufficientAllowance,
        uint256 balance,
        uint256 allowance
    ) {
        uint256 adminBalance = idrxToken.balanceOf(adminWallet);
        uint256 adminAllowance = idrxToken.allowance(adminWallet, address(this));
        
        return (
            adminBalance >= DAILY_CLAIM_AMOUNT,
            adminAllowance >= DAILY_CLAIM_AMOUNT,
            adminBalance,
            adminAllowance
        );
    }
    
    /**
     * @dev Get time remaining until user can claim again
     */
    function getTimeUntilNextClaim(address user) external view returns (uint256) {
        if (lastClaimTime[user] == 0) {
            return 0; // User can claim immediately
        }
        
        uint256 nextClaimTime = lastClaimTime[user] + CLAIM_COOLDOWN;
        
        if (block.timestamp >= nextClaimTime) {
            return 0; // User can claim now
        } else {
            return nextClaimTime - block.timestamp; // Time remaining
        }
    }
    
    /**
     * @dev Batch check multiple users claim status (for frontend optimization)
     */
    function batchCheckClaimStatus(address[] calldata users) external view returns (
        bool[] memory canClaim,
        uint256[] memory timeRemaining
    ) {
        uint256 length = users.length;
        canClaim = new bool[](length);
        timeRemaining = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            (canClaim[i], timeRemaining[i]) = this.canUserClaim(users[i]);
        }
        
        return (canClaim, timeRemaining);
    }
    
    /**
     * @dev Admin function to approve large allowance for smoother operations
     */
    function adminApproveContract(uint256 amount) external {
        require(msg.sender == adminWallet, "Only admin wallet can call this");
        
        // This would need to be called from admin wallet directly on IDRX token contract
        // This is just a helper function to show the required amount
        require(amount >= DAILY_CLAIM_AMOUNT * 365, "Amount should cover at least 1 year of claims");
    }
}