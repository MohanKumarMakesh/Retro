import React, { useState } from "react";
import { ethers } from "ethers";

const PiggyBank = () => {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0"); // State to store the balance
  const piggyBankABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address",
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256",
        },
      ],
      "name": "Deposit",
      "type": "event",
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "receiver",
          "type": "address",
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256",
        },
      ],
      "name": "Withdraw",
      "type": "event",
    },
    {
      "inputs": [],
      "name": "breakPiggyBank",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address",
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256",
        },
      ],
      "name": "Deposit",
      "type": "event",
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "receiver",
          "type": "address",
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256",
        },
      ],
      "name": "Withdraw",
      "type": "event",
    },
    {
      "inputs": [],
      "name": "breakPiggyBank",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256",
        },
      ],
      "stateMutability": "view",
      "type": "function",
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address",
        },
      ],
      "stateMutability": "view",
      "type": "function",
    },
  ];
  const piggyBankAddress = "0x74403A436C43060f1f9347FbA53E1ab444a5F1eE"; // Replace with your contract address

  const handleDeposit = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();



      const contract = new ethers.Contract(piggyBankAddress, piggyBankABI, signer);
      const tx = await contract.deposit({
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      alert("Deposit successful!");
    } catch (error) {
      console.error("Error depositing to piggy bank:", error);
    }
  };

  const handleBreakPiggyBank = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(piggyBankAddress, piggyBankABI, signer);
      const tx = await contract.breakPiggyBank();
      await tx.wait();
      alert("Piggy Bank broken! Funds withdrawn successfully.");
    } catch (error) {
      console.error("Error breaking the piggy bank:", error);
    }
  };

  const handleGetBalance = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(piggyBankAddress, piggyBankABI, signer);
      const balance = await contract.getBalance();
      setBalance(ethers.utils.formatEther(balance)); // Convert balance to ETH and update state
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Piggy Bank</h2>
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
      />
      <button
        onClick={handleDeposit}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
      >
        Deposit
      </button>
      <br />

      <button
        onClick={handleBreakPiggyBank}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-4"
      >
        Break Piggy Bank
      </button>
      <br />

      <button
        onClick={handleGetBalance}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Balance
      </button>
      <p className="mt-4 text-lg font-bold">Balance: {balance} ETH</p>
    </div>
  );
};

export default PiggyBank;