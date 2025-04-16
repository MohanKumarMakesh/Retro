import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./contractABI";
import LoanRequestForm from "./components/LoanRequestForm";
import LoanList from "./components/LoanList";
import LoginWithMetamask from "./components/LoginWithMetamask";
import PiggyBank from "./components/PiggyBank"; // Import the new PiggyBank component
import RepayLoan from "./components/RepayLoan"; // Import the new RepayLoan component

const App = () => {
  const [loans, setLoans] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [account, setAccount] = useState(null);
  const [news, setNews] = useState([
    {
      author: "Matthew Carey",
      title: "Netflix Picks Up Nicholas Bruckman’s NFT Boom-And-Bust Documentary ‘Minted’ For Key Markets",
      description:
        "EXCLUSIVE: Netflix is set to premiere Nicholas Bruckman’s NFT documentary Minted in key global territories this week, including in North America. The film, subtitled The Rise (and Fall?) of the NFT, provides audiences with “a front-row seat to the explosive e…",
      content:
        "EXCLUSIVE:Netflix is set to premiere Nicholas Bruckman’s NFT documentary Minted in key global territories this week, including in North America.\r\nThe film, subtitled The Rise (and Fall?) of the NFT, … [+2624 chars]",
      publishedAt: "2025-04-07T17:25:31Z",
      source: { id: null, name: "Deadline" },
      url: "http://deadline.com/2025/04/minted-nft-documentary-netflix-premiere-date-1236362313/",
      urlToImage:
        "https://deadline.com/wp-content/uploads/2025/01/Beeple-looking-at-artwork-NFT-Film-LLC.jpg?w=1024",
    },
  ]);
  const [activeView, setActiveView] = useState("loan"); // State to toggle between views

  const fetchLoans = async () => {
    console.log("fetchLoans called");

    if (!window.ethereum) {
      console.error("MetaMask is not installed or not enabled.");
      alert("MetaMask is not installed. Please install it to use this application.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const loanCount = await contract.getId();
      const loanData = [];
      for (let i = 0; i < loanCount; i++) {
        const loan = await contract.getDetails(i);
        loanData.push({
          loanId: i,
          amount: ethers.utils.formatEther(loan.loanAmount),
          interest: loan.interest.toString(),
          loanDuration: loan.loanDuration.toString(),
          nftUrl: loan.nftUrl,
        });
      }
      setLoans(loanData);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  const fetchNews = async () => {
    console.log("Fetching NFT news...");
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=NFT&apiKey=5650bd4e863640528094736fedb570d2`,);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.articles || data.articles.length === 0) {
        console.error("No articles found in the response.");
        return;
      }
      setNews(data.articles);
      console.log("Fetched news:", data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };


  useEffect(() => {
    if (isLoggedIn) {
      fetchLoans();
    }
    fetchNews();
  }, [isLoggedIn]);

  const handleLogout = () => {
    console.log("User logged out");
    setIsLoggedIn(false);
    setAccount(null);
    localStorage.removeItem("metamaskAccount");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">NFT Lender</h1>
        {isLoggedIn && account ? (
          <div className="flex items-center gap-4">
            <span>
              Connected: {account.slice(0, 5)}...{account.slice(-5)}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : null}
      </nav>

      <div className="flex items-center justify-center p-4">
        {!isLoggedIn ? (
          <LoginWithMetamask
            onLogin={(userAccount) => {
              console.log("User logged in:", userAccount);
              setIsLoggedIn(true);
              setAccount(userAccount);
            }}
            onLogout={handleLogout}
          />
        ) : (
          <div className="w-full max-w-4xl">
            {/* Buttons to toggle views */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setActiveView("loan")}
                className={`px-4 py-2 ${activeView === "loan"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
                  } rounded-l`}
              >
                Loan Request
              </button>
              <button
                onClick={() => setActiveView("piggyBank")}
                className={`px-4 py-2 ${activeView === "piggyBank"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                Piggy Bank
              </button>
              <button
                onClick={() => setActiveView("repayLoan")}
                className={`px-4 py-2 ${activeView === "repayLoan"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
                  } rounded-r`}
              >
                Repay Loan
              </button>
            </div>

            {/* Conditional rendering based on activeView */}
            {activeView === "loan" && (
              <>
                <LoanRequestForm onSubmit={fetchLoans} />
                <LoanList loans={loans} />
              </>
            )}
            {activeView === "piggyBank" && <PiggyBank />}
            {activeView === "repayLoan" && <RepayLoan />}
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Latest NFT News</h2>
        {news.length > 0 ? (
          <ul className="space-y-4">
            {news.slice(0, 3).map((article, index) => (
              <li key={index} className="p-4 bg-white rounded shadow-md">
                <h3 className="text-lg font-bold">{article.title}</h3>
                <p>{article.description}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Read more
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No news available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default App;