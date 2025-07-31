// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title LoyaltyToken - IDRX-backed ERC20 loyalty token with swap capability
contract LoyaltyToken {
    string private _name = "Pointify Loyalty Token";
    string private _symbol = "PLT";
    uint8 private _decimals = 18;
    uint256 public totalSupply;
    uint256 public totalIDRXBacking; // Total IDRX yang mem-back token

    address public owner;
    address public rewardManager;
    address public redemptionRouter;
    address public swapRouter; // NEW: Swap router untuk trading tanpa burn
    IERC20 public immutable idrxToken;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ERC20 standard functions
    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    constructor(address _rewardManager, address _redemptionRouter, address _swapRouter, address _idrxToken) {
        rewardManager = _rewardManager;
        redemptionRouter = _redemptionRouter;
        swapRouter = _swapRouter;
        idrxToken = IERC20(_idrxToken);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyRewardManager() {
        require(msg.sender == rewardManager, "Not reward manager");
        _;
    }

    modifier onlyRedemptionRouter() {
        require(msg.sender == redemptionRouter, "Not redemption router");
        _;
    }

    modifier onlySwapRouter() {
        require(msg.sender == swapRouter, "Not swap router");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == rewardManager || msg.sender == redemptionRouter || msg.sender == swapRouter, "Not authorized");
        _;
    }

    // Update swap router address
    function setSwapRouter(address _swapRouter) external onlyOwner {
        swapRouter = _swapRouter;
    }

    function mint(address to, uint256 amount) external onlyRewardManager {
        totalSupply += amount;
        totalIDRXBacking += amount; // 1:1 backing ratio
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyRedemptionRouter {
        require(balanceOf[from] >= amount, "Not enough balance to burn");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        totalIDRXBacking -= amount; // Reduce backing
        emit Transfer(from, address(0), amount);
    }

    // NEW: Transfer PLT untuk swap (tanpa burn, hanya transfer)
    function swapTransfer(address from, address to, uint256 amount) external onlySwapRouter returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    // Helper function untuk transfer IDRX (hanya bisa dipanggil oleh authorized contracts)
    function transferIDRX(address to, uint256 amount) external onlyAuthorized returns (bool) {
        return idrxToken.transfer(to, amount);
    }

    // NEW: Transfer PLT untuk redemption ke merchant (tanpa burn, hanya transfer)
    function redeemTransfer(address from, address to, uint256 amount) external onlyRedemptionRouter returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

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

    // View function untuk melihat backing ratio
    function getBackingRatio() external view returns (uint256) {
        if (totalSupply == 0) return 0;
        return (idrxToken.balanceOf(address(this)) * 1e18) / totalSupply;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/// @title RewardManager - Handles IDRX backing, merchant quota, and point issuance
contract RewardManager {
    address public owner;
    LoyaltyToken public loyaltyToken;
    IERC20 public immutable idrxToken;

    mapping(address => bool) public isApprovedMerchant;
    mapping(address => uint256) public merchantQuota; // IDRX quota untuk setiap merchant

    event MerchantApproved(address indexed merchant, bool approved);
    event UserRewarded(address indexed merchant, address indexed user, uint256 amount);
    event TopUpIDRX(address indexed merchant, uint256 amount);
    event WithdrawIDRX(address indexed merchant, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyApprovedMerchant() {
        require(isApprovedMerchant[msg.sender], "Not approved merchant");
        _;
    }

    constructor(address _idrxToken) {
        owner = msg.sender;
        idrxToken = IERC20(_idrxToken);
    }

    function setLoyaltyToken(address token) external onlyOwner {
        loyaltyToken = LoyaltyToken(token);
    }

    function approveMerchant(address merchant, bool approved) external onlyOwner {
        isApprovedMerchant[merchant] = approved;
        emit MerchantApproved(merchant, approved);
    }

    // Merchant top up IDRX untuk mendapat quota
    function topUpIDRX(uint256 amount) external onlyApprovedMerchant {
        require(amount > 0, "Amount must be > 0");
        require(idrxToken.transferFrom(msg.sender, address(loyaltyToken), amount), "IDRX transfer failed");
        merchantQuota[msg.sender] += amount;
        emit TopUpIDRX(msg.sender, amount);
    }

    // Merchant withdraw IDRX yang belum digunakan
    function withdrawIDRX(uint256 amount) external onlyApprovedMerchant {
        require(amount > 0, "Amount must be > 0");
        require(merchantQuota[msg.sender] >= amount, "Not enough quota");
        merchantQuota[msg.sender] -= amount;
        require(loyaltyToken.transferIDRX(msg.sender, amount), "IDRX transfer failed");
        emit WithdrawIDRX(msg.sender, amount);
    }

    // Issue loyalty points (harus ada quota IDRX)
    function rewardUser(address user, uint256 amount) external onlyApprovedMerchant {
        require(amount > 0, "Amount must be > 0");
        require(merchantQuota[msg.sender] >= amount, "Not enough quota");
        merchantQuota[msg.sender] -= amount;
        loyaltyToken.mint(user, amount);
        emit UserRewarded(msg.sender, user, amount);
    }

    // Emergency function untuk owner withdraw IDRX (jika diperlukan)
    function emergencyWithdrawIDRX(uint256 amount) external onlyOwner {
        require(loyaltyToken.transferIDRX(owner, amount), "IDRX transfer failed");
    }

    // Function untuk menambah quota merchant (dipanggil oleh RedemptionRouter)
    function addMerchantQuota(address merchant, uint256 amount) external {
        require(isApprovedMerchant[merchant], "Not approved merchant");
        merchantQuota[merchant] += amount;
        emit TopUpIDRX(merchant, amount); // Emit event untuk tracking
    }
}

/// @title RedemptionRouter - Handles automatic point redemption with IDRX payout (WITH BURN)
contract RedemptionRouter {
    address public owner;
    LoyaltyToken public loyaltyToken;
    RewardManager public rewardManager;
    IERC20 public immutable idrxToken;
    
    uint256 public platformFee; // Fee dalam basis points (100 = 1%)
    address public feeRecipient;

    event Redeemed(address indexed user, uint256 amount, uint256 payout, uint256 fee);
    event ManualRedemption(address indexed user, uint256 amount, string item);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _idrxToken, uint256 _platformFee, address _feeRecipient) {
        owner = msg.sender;
        idrxToken = IERC20(_idrxToken);
        platformFee = _platformFee;
        feeRecipient = _feeRecipient;
    }

    function setLoyaltyToken(address token) external onlyOwner {
        loyaltyToken = LoyaltyToken(token);
    }

    function setRewardManager(address _rewardManager) external onlyOwner {
        rewardManager = RewardManager(_rewardManager);
    }

    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _platformFee;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }

    // User bisa redeem sendiri (automatic) - TRANSFER TOKEN KE MERCHANT (TIDAK BURN)
    function redeemPoint(uint256 amount, address merchant) external {
        require(amount > 0, "Amount must be > 0");
        require(loyaltyToken.balanceOf(msg.sender) >= amount, "Not enough points");
        require(merchant != address(0), "Invalid merchant address");
        require(rewardManager.isApprovedMerchant(merchant), "Merchant not approved");
        
        uint256 totalIDRX = amount;
        require(idrxToken.balanceOf(address(loyaltyToken)) >= totalIDRX, "Not enough IDRX in treasury");
        
        // Transfer loyalty tokens ke merchant (TIDAK BURN!)
        require(loyaltyToken.redeemTransfer(msg.sender, merchant, amount), "PLT transfer to merchant failed");
        
        // Calculate fee and payout
        uint256 fee = (platformFee * amount) / 10000;
        uint256 payout = amount - fee;
        
        // Transfer IDRX ke user
        require(loyaltyToken.transferIDRX(msg.sender, payout), "IDRX transfer failed");
        if (fee > 0) {
            require(loyaltyToken.transferIDRX(feeRecipient, fee), "Fee transfer failed");
        }
        
        emit Redeemed(msg.sender, amount, payout, fee);
    }

    // Manual redemption oleh owner (untuk item fisik, dll) - TRANSFER TOKEN KE MERCHANT (TIDAK BURN)
    function manualRedeem(address user, uint256 amount, string memory item, address merchant) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(loyaltyToken.balanceOf(user) >= amount, "User not enough points");
        require(merchant != address(0), "Invalid merchant address");
        require(rewardManager.isApprovedMerchant(merchant), "Merchant not approved");
        
        // Transfer loyalty tokens ke merchant (TIDAK BURN!)
        require(loyaltyToken.redeemTransfer(user, merchant, amount), "PLT transfer to merchant failed");
        
        // Kembalikan IDRX ke quota merchant sebagai kompensasi produk yang diberikan
        rewardManager.addMerchantQuota(merchant, amount);
        
        emit ManualRedemption(user, amount, item);
    }

    // Emergency function untuk owner withdraw IDRX
    function emergencyWithdrawIDRX(uint256 amount) external onlyOwner {
        require(loyaltyToken.transferIDRX(owner, amount), "IDRX transfer failed");
    }
}

/// @title SwapRouter - Handles PLT swapping WITHOUT BURN (for trading)
contract SwapRouter {
    address public owner;
    LoyaltyToken public loyaltyToken;
    IERC20 public immutable idrxToken;
    
    // Swap pools untuk berbagai token pairs
    mapping(address => uint256) public tokenReserves; // Token reserves dalam pool
    mapping(address => uint256) public pltReserves;   // PLT reserves dalam pool
    mapping(address => bool) public supportedTokens;  // Token yang didukung untuk swap
    
    uint256 public swapFee; // Fee dalam basis points (30 = 0.3%)
    address public feeRecipient;

    event TokenAdded(address indexed token);
    event LiquidityAdded(address indexed token, uint256 tokenAmount, uint256 pltAmount);
    event LiquidityRemoved(address indexed token, uint256 tokenAmount, uint256 pltAmount);
    event Swapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _idrxToken, uint256 _swapFee, address _feeRecipient) {
        owner = msg.sender;
        idrxToken = IERC20(_idrxToken);
        swapFee = _swapFee;
        feeRecipient = _feeRecipient;
    }

    function setLoyaltyToken(address token) external onlyOwner {
        loyaltyToken = LoyaltyToken(token);
    }

    function setSwapFee(uint256 _swapFee) external onlyOwner {
        require(_swapFee <= 1000, "Fee too high"); // Max 10%
        swapFee = _swapFee;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }

    // Add supported token untuk swap
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    // Add liquidity ke pool (owner only untuk simplicity)
    function addLiquidity(address token, uint256 tokenAmount, uint256 pltAmount) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        require(tokenAmount > 0 && pltAmount > 0, "Invalid amounts");
        
        // Transfer tokens ke contract
        require(IERC20(token).transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        require(loyaltyToken.transferFrom(msg.sender, address(this), pltAmount), "PLT transfer failed");
        
        // Update reserves
        tokenReserves[token] += tokenAmount;
        pltReserves[token] += pltAmount;
        
        emit LiquidityAdded(token, tokenAmount, pltAmount);
    }

    // Remove liquidity dari pool (owner only)
    function removeLiquidity(address token, uint256 tokenAmount, uint256 pltAmount) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        require(tokenReserves[token] >= tokenAmount, "Not enough token reserves");
        require(pltReserves[token] >= pltAmount, "Not enough PLT reserves");
        
        // Update reserves
        tokenReserves[token] -= tokenAmount;
        pltReserves[token] -= pltAmount;
        
        // Transfer tokens back
        require(IERC20(token).transfer(msg.sender, tokenAmount), "Token transfer failed");
        require(loyaltyToken.transfer(msg.sender, pltAmount), "PLT transfer failed");
        
        emit LiquidityRemoved(token, tokenAmount, pltAmount);
    }

    // Swap PLT ke token lain (TANPA BURN!)
    function swapPLTForToken(address token, uint256 pltAmount) external {
        require(supportedTokens[token], "Token not supported");
        require(pltAmount > 0, "Invalid amount");
        require(loyaltyToken.balanceOf(msg.sender) >= pltAmount, "Not enough PLT");
        
        // Calculate output amount using constant product formula (x * y = k)
        uint256 tokenOut = getAmountOut(pltAmount, pltReserves[token], tokenReserves[token]);
        require(tokenOut > 0, "Insufficient output amount");
        require(tokenReserves[token] >= tokenOut, "Not enough token reserves");
        
        // Calculate fee
        uint256 fee = (swapFee * tokenOut) / 10000;
        uint256 finalTokenOut = tokenOut - fee;
        
        // Transfer PLT dari user ke contract (TIDAK BURN!)
        require(loyaltyToken.swapTransfer(msg.sender, address(this), pltAmount), "PLT transfer failed");
        
        // Update reserves
        pltReserves[token] += pltAmount;
        tokenReserves[token] -= tokenOut;
        
        // Transfer token ke user
        require(IERC20(token).transfer(msg.sender, finalTokenOut), "Token transfer failed");
        
        // Transfer fee ke fee recipient
        if (fee > 0) {
            require(IERC20(token).transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        emit Swapped(msg.sender, address(loyaltyToken), token, pltAmount, finalTokenOut);
    }

    // Swap token lain ke PLT (TANPA BURN!)
    function swapTokenForPLT(address token, uint256 tokenAmount) external {
        require(supportedTokens[token], "Token not supported");
        require(tokenAmount > 0, "Invalid amount");
        require(IERC20(token).balanceOf(msg.sender) >= tokenAmount, "Not enough tokens");
        
        // Calculate output amount
        uint256 pltOut = getAmountOut(tokenAmount, tokenReserves[token], pltReserves[token]);
        require(pltOut > 0, "Insufficient output amount");
        require(pltReserves[token] >= pltOut, "Not enough PLT reserves");
        
        // Calculate fee
        uint256 fee = (swapFee * pltOut) / 10000;
        uint256 finalPLTOut = pltOut - fee;
        
        // Transfer token dari user ke contract
        require(IERC20(token).transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        // Update reserves
        tokenReserves[token] += tokenAmount;
        pltReserves[token] -= pltOut;
        
        // Transfer PLT ke user (TIDAK BURN!)
        require(loyaltyToken.transfer(msg.sender, finalPLTOut), "PLT transfer failed");
        
        // Transfer fee ke fee recipient
        if (fee > 0) {
            require(loyaltyToken.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        emit Swapped(msg.sender, token, address(loyaltyToken), tokenAmount, finalPLTOut);
    }

    // Calculate output amount untuk swap (constant product formula)
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");
        
        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        
        return numerator / denominator;
    }

    // Get current exchange rate
    function getExchangeRate(address token) external view returns (uint256) {
        if (pltReserves[token] == 0) return 0;
        return (tokenReserves[token] * 1e18) / pltReserves[token];
    }

    // Emergency function untuk owner withdraw tokens
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(loyaltyToken)) {
            require(loyaltyToken.transfer(owner, amount), "PLT transfer failed");
        } else {
            require(IERC20(token).transfer(owner, amount), "Token transfer failed");
        }
    }
}