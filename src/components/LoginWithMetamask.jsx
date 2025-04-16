import React, { useState, useEffect } from "react";

const LoginWithMetamask = ({ onLogin, onLogout }) => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    console.log("Checking for MetaMask...");
    if (!window.ethereum) {
      console.error("MetaMask is not installed or not enabled.");
      alert("MetaMask is not installed. Please install it to use this application.");
      return;
    }

    const storedAccount = localStorage.getItem("metamaskAccount");
    if (storedAccount) {
      console.log("Stored account found:", storedAccount);
      setAccount(storedAccount);
      onLogin(storedAccount); // Pass the account to the parent component
    }

    // Listen for account changes
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        console.log("Account changed:", accounts[0]);
        setAccount(accounts[0]);
        localStorage.setItem("metamaskAccount", accounts[0]); // Update stored account
        onLogin(accounts[0]); // Notify parent component
      } else {
        console.log("No accounts connected");
        handleLogout(); // Handle logout if no accounts are connected
      }
    });

    // Cleanup event listener on component unmount
    return () => {
      window.ethereum.removeListener("accountsChanged", () => { });
    };
  }, []);

  const handleLogin = async () => {
    if (window.ethereum) {
      try {
        console.log("Requesting MetaMask accounts...");
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const userAccount = accounts[0];
        console.log("Connected account:", userAccount);
        setAccount(userAccount);
        localStorage.setItem("metamaskAccount", userAccount); // Save to local storage

        onLogin(userAccount); // Pass the account to the parent component
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this app.");
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setAccount(null);
    localStorage.removeItem("metamaskAccount"); // Clear stored account
    onLogout(); // Notify parent component to handle logout
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {account ? (
        <>
          <p className="text-lg font-bold mb-4">Connected Account: {account}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login with MetaMask
        </button>
      )}
    </div>
  );
};

export default LoginWithMetamask;