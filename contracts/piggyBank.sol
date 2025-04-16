// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PiggyBank {
    address public owner; // Owner of the piggy bank
    uint256 public balance; // Total balance in the piggy bank

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed receiver, uint256 amount);

    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
    }

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Function to deposit Ether into the piggy bank
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balance += msg.value; // Update the balance
        emit Deposit(msg.sender, msg.value);
    }

    // Function to check the balance of the piggy bank
    function getBalance() external view returns (uint256) {
        return balance;
    }

    // Function to withdraw all funds and break the piggy bank
    function breakPiggyBank() external onlyOwner {
        require(balance > 0, "No funds available to withdraw");
        uint256 amount = balance;
        balance = 0; // Reset the balance
        payable(owner).transfer(amount); // Transfer the funds to the owner
        emit Withdraw(owner, amount);
    }
}