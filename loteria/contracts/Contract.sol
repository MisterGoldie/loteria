// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoteriaRewards is Ownable {
    // USDC contract
    IERC20 public usdc;
    
    // Reward amount - 0.002 USDC (with 6 decimals = 2000)
    uint256 public constant REWARD_AMOUNT = 2000;
    
    // Events
    event RewardSent(address indexed player, uint256 amount);
    
    /**
     * @dev Constructor that sets the USDC contract address
     * @param _usdcAddress Address of the USDC contract on Base network
     */
    constructor(address _usdcAddress) {
        usdc = IERC20(_usdcAddress);
    }
    
    /**
     * @dev Send reward to a player
     * @param player Address of the player to send reward to
     * @return success Whether the transfer was successful
     */
    function sendReward(address player) external onlyOwner returns (bool success) {
        require(player != address(0), "Invalid player address");
        require(usdc.balanceOf(address(this)) >= REWARD_AMOUNT, "Insufficient USDC balance");
        
        bool transferSuccess = usdc.transfer(player, REWARD_AMOUNT);
        require(transferSuccess, "Transfer failed");
        
        emit RewardSent(player, REWARD_AMOUNT);
        return true;
    }
    
    /**
     * @dev Emergency withdraw function (only owner)
     * @return amount Amount of USDC withdrawn
     */
    function withdraw() external onlyOwner returns (uint256 amount) {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        
        bool success = usdc.transfer(owner(), balance);
        require(success, "Withdraw failed");
        
        return balance;
    }
}