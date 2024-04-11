// import MetaMaskSDK from "@metamask/sdk";
import { useEffect, useState } from "react";
import "./App.css";
// const ethers = require("ethers");

// MetaMask SDK initialization
// const MMSDK = new MetaMaskSDK();
// const ethereum = MMSDK.getProvider(); // You can also access via window.ethereum


function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [checkingTransaction, setCheckingTransaction] = useState(false);
  const ETHERSCAN_API_KEY = '1CX2SVF4YPPUWC7ZZ67DXGMSDYJ718EF4P';

  // Check if MetaMask is connected and fetch the current account
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            setIsConnected(true);
          }
        } else {
          alert("MetaMask is not detected. Please install MetaMask.");
        }
      } catch (error) {
        console.error("MetaMask connection error:", error);
      }
    };

    checkIfWalletIsConnected();
  }, []);

  // Function to handle form submission and fetch transaction details
  const handleSubmit = async (event) => {
    event.preventDefault();
    setCheckingTransaction(true);

    // Adjust the API URL based on the correct network as per your project requirements
    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${ETHERSCAN_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        console.log(data.result); // For debugging
        setTransactionDetails(data.result); // Save the transaction details to state
      } else {
        console.error("Transaction details not found.");
      }
    } catch (error) {
      console.error("Failed to fetch transaction details:", error);
    } finally {
      setCheckingTransaction(false);
    }
  };

  return (
    <div className="container">
      <h1>Transaction Security Checker</h1>
      {isConnected ? (
        <>
          <p>Connected with: {currentAccount}</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="transactionHash">Transaction Hash:</label>
            <input
              id="transactionHash"
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Enter transaction hash"
              required
            />
            <button type="submit" disabled={checkingTransaction}>Check Transaction</button>
          </form>
          {checkingTransaction && <p>Checking transaction...</p>}
          {transactionDetails && (
            <div>
              <h2>Transaction Details:</h2>
              <p>Block Number: {transactionDetails.blockNumber}</p>
            </div>
          )}
        </>
      ) : (
        <p>Please connect to MetaMask.</p>
      )}
    </div>
  );
}

export default App;
