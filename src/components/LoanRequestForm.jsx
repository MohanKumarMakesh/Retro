import React, { useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractABI";

const LoanRequestForm = ({ onSubmit }) => {
  const [transactions, setTransactions] = useState([]); // State to store the last 5 transactions

  const handleShowTransactions = async (nftAddress) => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      const provider = new ethers.providers.EtherscanProvider("homestead", "51BJP2RMS6UVMAVK9VKNFHZFEKWCBUJF6T");
      const history = await provider.getHistory(nftAddress);
      console.log(nftAddress, history);
      // Get the last 5 transactions
      const lastFiveTransactions = history.slice(-5).reverse();
      setTransactions(lastFiveTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    const formData = {
      nftId: e.target.nftId.value,
      nftAddress: e.target.nftAddress.value,
      amount: e.target.amount.value,
      loanDuration: e.target.loanDuration.value,
      interest: e.target.interest.value,
    };
    console.log("Form data:", formData);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Check wallet balance
      const balance = await signer.getBalance();
      console.log("Wallet Balance:", ethers.utils.formatEther(balance));
      if (balance.lt(ethers.utils.parseEther("0.01"))) {
        alert("Insufficient funds in wallet");
        return;
      }

      // Approve NFT transfer
      const erc721ABI = [
        {
          "constant": false,
          "inputs": [
            { "name": "to", "type": "address" },
            { "name": "tokenId", "type": "uint256" },
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ];
      const nftContract = new ethers.Contract(formData.nftAddress, erc721ABI, signer);
      const approvalTx = await nftContract.approve(contractAddress, formData.nftId);
      await approvalTx.wait(); // Wait for the approval transaction to be mined
      console.log("NFT approved for transfer");

      // Call askForLoan
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.askForLoan(
        formData.nftId,
        formData.nftAddress,
        ethers.utils.parseEther(formData.amount),
        formData.loanDuration,
        formData.interest,
        { gasLimit: 500000 } // Set a manual gas limit
      );
      await tx.wait();
      console.log("Loan request created!");
      onSubmit(formData);
    } catch (error) {
      console.error("Error creating loan request:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!window.ethereum) {
    return (
      <div className="p-4 bg-white rounded shadow-md">
        <p className="text-lg font-bold text-red-500">
          MetaMask is not installed. Please install it to use this application.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <form onSubmit={handleSubmit} className="mb-4">
        <h2 className="text-xl font-bold mb-4">Request a Loan</h2>
        <input
          type="text"
          name="nftId"
          placeholder="NFT ID"
          className="block w-full mb-2 p-2 border rounded"
          required
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            name="nftAddress"
            placeholder="NFT Address"
            className="block w-full mb-2 p-2 border rounded"
            required
          />
          <button
            type="button"
            onClick={() => handleShowTransactions(document.querySelector('input[name="nftAddress"]').value)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Last Transactions
          </button>
        </div>
        <input
          type="text"
          name="amount"
          placeholder="Loan Amount (ETH)"
          className="block w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          name="loanDuration"
          placeholder="Loan Duration (minutes)"
          className="block w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          name="interest"
          placeholder="Interest (%)"
          className="block w-full mb-2 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit Loan Request
        </button>
      </form>

      {/* Display Last 5 Transactions */}
      {transactions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Last 5 Transactions:</h3>
          <ul className="list-disc pl-5">
            {transactions.map((tx, index) => (
              <li key={index}>
                <p>
                  <strong>Hash:</strong>{" "}
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {tx.hash}
                  </a>
                </p>
                <p>
                  <strong>From:</strong> {tx.from}
                </p>
                <p>
                  <strong>To:</strong> {tx.to}
                </p>
                <p>
                  <strong>Value:</strong> {ethers.utils.formatEther(tx.value)} ETH
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoanRequestForm;