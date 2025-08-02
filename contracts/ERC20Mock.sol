// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IDRXMock is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) ERC20(name, symbol) Ownable(initialAccount) {
        _mint(initialAccount, initialBalance);
    }

    /**
     * @dev Mint IDRX-Mock tokens to specified address
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint
     * Only owner can mint new tokens
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        _mint(to, amount);
    }

    /**
     * @dev Transfer IDRX-Mock tokens from owner to specified address
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to transfer
     * Only owner can transfer tokens using this function
     */
    function mintTo(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot transfer to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(owner()) >= amount, "Insufficient owner balance");
        
        _transfer(owner(), to, amount);
    }
}