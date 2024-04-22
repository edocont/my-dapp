// import MetaMaskSDK from "@metamask/sdk";
import { useEffect, useState } from "react";
import "./App.css";
// Import the analyze function
import { analyzeSecurity } from "./Chatgpt";
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
  const [analysisResult, setAnalysisResult] = useState(''); 
  const [error, setError] = useState('');

  // Function to initiate connection with MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          setIsConnected(true);
          setError(`Connected: ${accounts[0]}`);
        } else {
          setError("No accounts found. Please ensure MetaMask is unlocked.");
        }
      } catch (error) {
        setError("Failed to connect to MetaMask. Please try again.");
        console.error("MetaMask connection error:", error);
      }
    } else {
      setError("MetaMask is not detected. Please install MetaMask.");
    }
  };

  // Check if MetaMask is connected and fetch the current account
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        if (!window.ethereum) {
          alert("MetaMask is not detected. Please install MetaMask.");
          return;
        }
        
        // Informing the user that the connection is being attempted
        setError("Connecting to MetaMask...");
        setIsConnected(false);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          setIsConnected(true);
          setError(`Connected to ${accounts[0]}`);
        } else {
          setError("No accounts found. Please ensure MetaMask is unlocked.");
        }
      } catch (error) {
        console.error("Failed to connect to MetaMask", error);
        setError("Failed to connect to MetaMask. Please ensure MetaMask is unlocked and refresh the page.");
      }
  };

  checkIfWalletIsConnected();
}, []);

  // Function to handle form submission, fetch transaction details and security analysis
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isConnected) {
      setError("Please connect to MetaMask first.");
      return;
    }
    setCheckingTransaction(true);
    setTransactionDetails(null);
    setAnalysisResult('');
    setError('');
  
    const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
    const transactionUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${ETHERSCAN_API_KEY}`;
  
    try {
      const response = await fetch(transactionUrl);
      const data = await response.json();
  
      if (data.result) {
        setTransactionDetails(data.result);
        
        // If the transaction has a 'to' address, attempt to fetch the contract source code
        if (data.result.to) {
          const contractSourceUrl = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${data.result.to}&apikey=${ETHERSCAN_API_KEY}`;
          const contractSourceResponse = await fetch(contractSourceUrl);
          const contractSourceData = await contractSourceResponse.json();
  
          if (contractSourceData.result && contractSourceData.result[0].SourceCode !== '0x') {
            // Parse the source code, removing surrounding array characters if they exist
            let sourceCode = contractSourceData.result[0].SourceCode;
            if (sourceCode.startsWith('[') && sourceCode.endsWith(']')) {
              sourceCode = JSON.parse(sourceCode)[0]; // Parsing the source code when it's provided as a JSON string
            }
  
            // Perform security analysis on the source code
            console.log("Calling analyzeSecurity with", sourceCode, transactionHash, JSON.stringify(data.result));
            try {
              console.log(sourceCode);
              const analysis = await analyzeSecurity(sourceCode, transactionHash, JSON.stringify(data.result)); // Utilizing the new analysis function
              setAnalysisResult(analysis);
            } catch (analysisError) {
              console.error("Error during analysis:", analysisError);
              setError("Analysis failed: " + analysisError.message);
              setAnalysisResult("Analysis failed. Please try again.");
            }
          } else {
            setAnalysisResult("No verified source code found at this address or it's not a contract.");
          }
        }
      } else {
        setError("Transaction details not found.");
        setAnalysisResult("Unable to perform security analysis.");
      }
    } catch (error) {
      console.error("Failed to fetch transaction details:", error);
      setError("Failed to fetch transaction details");
      setAnalysisResult("Analysis failed due to network error.");
    } finally {
      setCheckingTransaction(false);
    }
  };
  
  return (
    <div className="container">
      <h1>Transaction Security Checker</h1>
      {!isConnected && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={transactionHash}
          onChange={(e) => setTransactionHash(e.target.value)}
          placeholder="Enter transaction hash"
        />
        <button type="submit" disabled={checkingTransaction || !isConnected}>Check Transaction</button>
      </form>
      
      {error && <p className="status-message error">{error}</p>}
      {checkingTransaction && <p className="status-message">Checking transaction...</p>}
      {transactionDetails && (
        <div className="transaction-details">
          <h2>Transaction Details:</h2>
          <p>Block Number: {transactionDetails.blockNumber}</p>
          {/* Display other details as needed */}
        </div>
      )}
      {analysisResult && (
        <div>
          <h2>Analysis Result:</h2>
          <p>{analysisResult}</p>
        </div>
      )}
    </div>
  );
}

export default App;
