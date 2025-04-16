import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractABI";

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [currentLoanDetails, setCurrentLoanDetails] = useState(null); // State to store current loan details

  // Fetch loans from the blockchain
  const fetchLoans = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const loanCount = await contract.getId(); // Get the total number of loans
      const fetchedLoans = [];

      for (let i = 0; i < loanCount; i++) {
        const loan = await contract.getDetails(i);
        if (loan.status === 0) { // Only include loans with "Open" status
          fetchedLoans.push({
            loanId: i,
            amount: ethers.utils.formatEther(loan.loanAmount),
            nftAddress: loan.nftAddress,
            nftId: loan.nftId.toString(),
            interest: loan.interest.toString(),
            repayTime: loan.loanDuration.toString(),
            receiverAddress: loan.borrower,
          });
        }
      }

      setLoans(fetchedLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  // Fetch details of a specific loan
  const fetchLoanDetails = async (loanId) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const loan = await contract.getDetails(loanId);
      setCurrentLoanDetails({
        loanId,
        amount: ethers.utils.formatEther(loan.loanAmount),
        nftAddress: loan.nftAddress,
        nftId: loan.nftId.toString(),
        interest: loan.interest.toString(),
        repayTime: loan.loanDuration.toString(),
        receiverAddress: loan.borrower,
        lenderAddress: loan.lender,
        status: loan.status,
      });
    } catch (error) {
      console.error("Error fetching loan details:", error);
    }
  };

  useEffect(() => {
    fetchLoans(); // Fetch loans when the component loads
  }, []);

  const lendMoney = async (loanId) => {
    try {
      console.log("Lending money for loan ID:", loanId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const loanDetails = await contract.getDetails(loanId);

      console.log("Loan Details:", loanDetails);
      console.log("Loan Amount:", loanDetails.loanAmount.toString());

      const tx = await contract.lendMoney(loanId, {
        value: ethers.BigNumber.from(loanDetails.loanAmount.toString()),
        gasLimit: 300000,
      });
      await tx.wait();
      console.log("Money lent successfully!");

      // Refresh the loan list
      fetchLoans();
    } catch (error) {
      console.error("Error lending money:", error);
    }
  };

  const onDelete = async (loanId) => {
    try {
      console.log("Closing loan request for loan ID:", loanId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Call closeBorrowRequest in the smart contract
      const tx = await contract.closeBorrowRequest(loanId, { gasLimit: 300000 });
      await tx.wait();
      console.log("Loan request closed and NFT returned to borrower!");

      // Refresh the loan list
      fetchLoans();
    } catch (error) {
      console.error("Error closing loan request:", error);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Loan Requests</h2>
      {loans.length > 0 ? (
        loans.map((loan, index) => (
          <div
            key={index}
            className="p-4 mb-4 border rounded shadow-sm bg-gray-50"
          >
            <p><strong>Amount:</strong> {loan.amount} Sepolia</p>
            <p><strong>NFT Address:</strong> {loan.nftAddress}</p>
            <p><strong>NFT ID:</strong> {loan.nftId}</p>
            <p><strong>Interest:</strong> {loan.interest}%</p>
            <p><strong>Repayment Time:</strong> {loan.repayTime} minutes</p>
            <p><strong>Receiver Address:</strong> {loan.receiverAddress}</p>
            <button
              onClick={() => onDelete(loan.loanId)} // Pass loanId directly
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Request
            </button>
            <br />
            <button
              onClick={() => lendMoney(loan.loanId)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Lend Money
            </button>
            <br />

            <button
              onClick={() => fetchLoanDetails(loan.loanId)} // Fetch loan details
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Show Details
            </button>
          </div>
        ))
      ) : (
        <p>No loan requests available.</p>
      )}

      {/* Display current loan details */}
      {currentLoanDetails && (
        <div className="p-4 mt-4 border rounded shadow-sm bg-gray-100">
          <h3 className="text-lg font-bold mb-2">Loan Details</h3>
          <p><strong>Loan ID:</strong> {currentLoanDetails.loanId}</p>
          <p><strong>Amount:</strong> {currentLoanDetails.amount} Sepolia</p>
          <p><strong>NFT Address:</strong> {currentLoanDetails.nftAddress}</p>
          <p><strong>NFT ID:</strong> {currentLoanDetails.nftId}</p>
          <p><strong>Interest:</strong> {currentLoanDetails.interest}%</p>
          <p><strong>Repayment Time:</strong> {currentLoanDetails.repayTime} minutes</p>
          <p><strong>Receiver Address:</strong> {currentLoanDetails.receiverAddress}</p>
          <p><strong>Lender Address:</strong> {currentLoanDetails.lenderAddress}</p>
          <p><strong>Status:</strong> {currentLoanDetails.status === 0 ? "Open" : currentLoanDetails.status === 1 ? "Loaned" : "Closed"}</p>
        </div>
      )}
    </div>
  );
};

export default LoanList;