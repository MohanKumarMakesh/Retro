import React, { useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractABI";

const RepayLoan = () => {
  const [loanId, setLoanId] = useState("");
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleRepayLoan = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      setStatusMessage("Processing repayment...");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Initialize the contract
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Fetch loan details to verify borrower and repayment amount
      const loanDetails = await contract.getDetails(loanId);



      const requiredRepaymentAmount = ethers.utils.formatEther(loanDetails.amountToBeRepayed);

      if (repaymentAmount !== requiredRepaymentAmount) {
        alert(`Incorrect repayment amount. Required: ${requiredRepaymentAmount} ETH`);
        setStatusMessage("");
        return;
      }

      // Call the repayLoan function
      const tx = await contract.repayLoan(loanId, {
        value: ethers.utils.parseEther(repaymentAmount),
        gasLimit: 300000,
      });
      await tx.wait();

      setStatusMessage("Repayment successful! NFT has been returned to your wallet.");
    } catch (error) {
      console.error("Error repaying loan:", error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Repay Loan</h2>
      <input
        type="text"
        placeholder="Loan ID"
        value={loanId}
        onChange={(e) => setLoanId(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Repayment Amount (ETH)"
        value={repaymentAmount}
        onChange={(e) => setRepaymentAmount(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
      />
      <button
        onClick={handleRepayLoan}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Repay Loan
      </button>
      {statusMessage && <p className="mt-4 text-lg">{statusMessage}</p>}
    </div>
  );
};

export default RepayLoan;