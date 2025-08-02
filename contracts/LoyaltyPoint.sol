// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Mock.sol";

/// @title PointifyToken - Treasury-backed loyalty token
contract PointifyToken {
    string public name = "Pointify Token";
    string public symbol = "PLT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public treasuryManager;
    IERC20 public immutable idrxToken;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyTreasuryManager() {
        require(msg.sender == treasuryManager, "Not treasury manager");
        _;
    }

    constructor(address _idrxToken) {
        // Validasi bahwa token yang digunakan adalah IDRXMock
        require(_idrxToken != address(0), "IDRX token address cannot be zero");
        idrxToken = IERC20(_idrxToken);
        
        // Verifikasi bahwa ini adalah IDRXMock token
        try IDRXMock(_idrxToken).symbol() returns (string memory tokenSymbol) {
            require(
                keccak256(abi.encodePacked(tokenSymbol)) == keccak256(abi.encodePacked("IDRX-MOCK")),
                "Must use IDRX-Mock token"
            );
        } catch {
            revert("Invalid IDRX-Mock token");
        }
    }

    function setTreasuryManager(address _treasuryManager) external {
        require(treasuryManager == address(0), "Already set");
        treasuryManager = _treasuryManager;
    }

    // Mint PLT (hanya TreasuryManager yang bisa)
    function mint(address to, uint256 amount) external onlyTreasuryManager {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    // Burn PLT (hanya TreasuryManager yang bisa)
    function burn(address from, uint256 amount) external onlyTreasuryManager {
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    // Standard ERC20 functions
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

/// @title TreasuryManager - Mengelola treasury dan flow baru
contract TreasuryManager {
    address public owner;
    PointifyToken public pointifyToken;
    IERC20 public immutable idrxToken;
    address public treasury; // Treasury address untuk menyimpan IDRX

    // Merchant management
    mapping(address => bool) public isApprovedMerchant;
    mapping(address => uint256) public merchantPLTBalance; // PLT balance merchant

    // Events
    event MerchantRegistered(address indexed merchant, bool approved);
    event IDRXSwappedToPLT(address indexed merchant, uint256 idrxAmount, uint256 pltAmount);
    event RewardSent(address indexed merchant, address indexed user, uint256 amount);
    event RedemptionProcessed(address indexed user, address indexed merchant, uint256 pltAmount);
    event PLTSwappedToIDRX(address indexed user, uint256 pltAmount, uint256 idrxAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyApprovedMerchant() {
        require(isApprovedMerchant[msg.sender], "Not approved merchant");
        _;
    }

    constructor(address _idrxToken, address _treasury) {
        owner = msg.sender;
        require(_idrxToken != address(0), "IDRX token address cannot be zero");
        require(_treasury != address(0), "Treasury address cannot be zero");
        
        // Validasi bahwa token yang digunakan adalah IDRXMock
        try IDRXMock(_idrxToken).symbol() returns (string memory tokenSymbol) {
            require(
                keccak256(abi.encodePacked(tokenSymbol)) == keccak256(abi.encodePacked("IDRX-MOCK")),
                "TreasuryManager must use IDRX-Mock token"
            );
        } catch {
            revert("Invalid IDRX-Mock token for TreasuryManager");
        }
        
        idrxToken = IERC20(_idrxToken);
        treasury = _treasury;
    }

    function setPointifyToken(address _pointifyToken) external onlyOwner {
        pointifyToken = PointifyToken(_pointifyToken);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /// @notice Step 1: Merchant Registration
    function registerMerchant(address merchant, bool approved) external onlyOwner {
        require(merchant != address(0), "Invalid merchant address");
        
        // Validasi merchant harus memiliki IDRX-Mock di wallet
        uint256 merchantIDRXBalance = idrxToken.balanceOf(merchant);
        require(merchantIDRXBalance > 0, "Merchant must have IDRX-Mock balance to register");
        
        isApprovedMerchant[merchant] = approved;
        emit MerchantRegistered(merchant, approved);
    }

    /// @notice Step 2: Swap IDRX → PLT (Merchant)
    /// IDRX dari merchant → Treasury, PLT di-mint → Merchant
    function swapIDRXToPLT(uint256 idrxAmount) external onlyApprovedMerchant {
        require(idrxAmount > 0, "Amount must be > 0");
        
        // Transfer IDRX dari merchant ke treasury
        require(idrxToken.transferFrom(msg.sender, treasury, idrxAmount), "IDRX transfer to treasury failed");
        
        // Mint PLT untuk merchant (1:1 ratio)
        pointifyToken.mint(msg.sender, idrxAmount);
        
        // Update merchant PLT balance tracking
        merchantPLTBalance[msg.sender] += idrxAmount;
        
        emit IDRXSwappedToPLT(msg.sender, idrxAmount, idrxAmount);
    }

    /// @notice Step 3: Merchant Send Reward to User
    function sendReward(address user, uint256 amount) external onlyApprovedMerchant {
        require(amount > 0, "Amount must be > 0");
        require(pointifyToken.balanceOf(msg.sender) >= amount, "Insufficient PLT balance");
        require(merchantPLTBalance[msg.sender] >= amount, "Insufficient merchant quota");
        
        // Transfer PLT dari merchant ke user
        require(pointifyToken.transferFrom(msg.sender, user, amount), "PLT transfer failed");
        
        // Update merchant balance tracking
        merchantPLTBalance[msg.sender] -= amount;
        
        emit RewardSent(msg.sender, user, amount);
    }

    /// @notice Step 4: User Redeem to Merchant
    /// PLT dari user → Merchant (kembali ke merchant)
    function redeemToMerchant(address merchant, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(isApprovedMerchant[merchant], "Merchant not approved");
        require(pointifyToken.balanceOf(msg.sender) >= amount, "Insufficient PLT balance");
        
        // Transfer PLT dari user kembali ke merchant
        require(pointifyToken.transferFrom(msg.sender, merchant, amount), "PLT transfer failed");
        
        // Update merchant balance tracking
        merchantPLTBalance[merchant] += amount;
        
        emit RedemptionProcessed(msg.sender, merchant, amount);
    }

    /// @notice Step 5: Swap PLT → IDRX (User)
    /// PLT di-burn, IDRX dari treasury → User
    function swapPLTToIDRX(uint256 pltAmount) external {
        require(pltAmount > 0, "Amount must be > 0");
        require(pointifyToken.balanceOf(msg.sender) >= pltAmount, "Insufficient PLT balance");
        
        // Check treasury has enough IDRX
        Treasury treasuryContract = Treasury(treasury);
        uint256 treasuryIDRXBalance = treasuryContract.getIDRXBalance();
        require(treasuryIDRXBalance >= pltAmount, "Insufficient treasury IDRX");
        
        // Burn PLT dari user
        pointifyToken.burn(msg.sender, pltAmount);
        
        // Transfer IDRX dari treasury ke user (1:1 ratio)
        require(treasuryContract.transferIDRX(msg.sender, pltAmount), "IDRX transfer from treasury failed");
        
        emit PLTSwappedToIDRX(msg.sender, pltAmount, pltAmount);
    }

    /// @notice Get treasury IDRX balance
    function getTreasuryIDRXBalance() external view returns (uint256) {
        return idrxToken.balanceOf(treasury);
    }

    /// @notice Get total PLT supply
    function getTotalPLTSupply() external view returns (uint256) {
        return pointifyToken.totalSupply();
    }

    /// @notice Get backing ratio (Treasury IDRX / Total PLT)
    function getBackingRatio() external view returns (uint256) {
        uint256 totalPLT = pointifyToken.totalSupply();
        if (totalPLT == 0) return 1e18; // 100% if no PLT exists
        
        uint256 treasuryIDRX = idrxToken.balanceOf(treasury);
        return (treasuryIDRX * 1e18) / totalPLT; // Returns ratio in 18 decimals
    }

    /// @notice Emergency functions
    function emergencyWithdrawFromTreasury(uint256 amount) external onlyOwner {
        Treasury treasuryContract = Treasury(treasury);
        require(treasuryContract.transferIDRX(owner, amount), "Emergency withdrawal failed");
    }

    function emergencyMint(address to, uint256 amount) external onlyOwner {
        pointifyToken.mint(to, amount);
    }

    function emergencyBurn(address from, uint256 amount) external onlyOwner {
        pointifyToken.burn(from, amount);
    }
}

/// @title Treasury - Simple treasury contract untuk menyimpan IDRX
contract Treasury {
    address public treasuryManager;
    IERC20 public immutable idrxToken;

    modifier onlyTreasuryManager() {
        require(msg.sender == treasuryManager, "Not treasury manager");
        _;
    }

    constructor(address _idrxToken, address _treasuryManager) {
        require(_idrxToken != address(0), "IDRX token address cannot be zero");
        require(_treasuryManager != address(0), "Treasury manager address cannot be zero");
        
        // Validasi bahwa token yang digunakan adalah IDRXMock
        try IDRXMock(_idrxToken).symbol() returns (string memory tokenSymbol) {
            require(
                keccak256(abi.encodePacked(tokenSymbol)) == keccak256(abi.encodePacked("IDRX-MOCK")),
                "Treasury must use IDRX-Mock token"
            );
        } catch {
            revert("Invalid IDRX-Mock token for Treasury");
        }
        
        idrxToken = IERC20(_idrxToken);
        treasuryManager = _treasuryManager;
    }

    /// @notice Allow treasury manager to transfer IDRX
    function transferIDRX(address to, uint256 amount) external onlyTreasuryManager returns (bool) {
        return idrxToken.transfer(to, amount);
    }

    /// @notice Get IDRX balance
    function getIDRXBalance() external view returns (uint256) {
        return idrxToken.balanceOf(address(this));
    }

    /// @notice Emergency function
    function emergencyWithdraw(address to, uint256 amount) external onlyTreasuryManager {
        idrxToken.transfer(to, amount);
    }
}