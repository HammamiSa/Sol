import React, { useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet, WalletProvider } from "@phantom-labs/react";

const App = () => {
  const { connected, publicKey, connect } = useWallet();
  const [tokenAddress, setTokenAddress] = useState("");
  const [mintAmount, setMintAmount] = useState(1000);
  const [transactionStatus, setTransactionStatus] = useState("");

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  const createToken = async () => {
    if (!publicKey) {
      alert("Please connect your Phantom wallet first.");
      return;
    }

    try {
      // Create a new token
      const token = await Token.createMint(
        connection,
        publicKey, // Owner
        publicKey, // Mint authority
        publicKey, // Freeze authority
        9, // Decimals (e.g., 9 for 1 billion tokens)
        TOKEN_PROGRAM_ID
      );

      setTokenAddress(token.publicKey.toString());
      setTransactionStatus("Token created successfully!");
    } catch (error) {
      console.error("Error creating token:", error);
      setTransactionStatus("Failed to create token.");
    }
  };

  const mintTokens = async () => {
    if (!publicKey || !tokenAddress) {
      alert("Please create a token first.");
      return;
    }

    try {
      const token = new Token(
        connection,
        new PublicKey(tokenAddress),
        TOKEN_PROGRAM_ID,
        publicKey
      );

      // Create an associated account to hold the tokens
      const associatedAccount = await token.getOrCreateAssociatedAccountInfo(
        publicKey
      );

      // Mint tokens
      await token.mintTo(
        associatedAccount.address,
        publicKey,
        [],
        mintAmount * Math.pow(10, 9) // Convert amount to smallest units
      );

      setTransactionStatus(`Successfully minted ${mintAmount} tokens!`);
    } catch (error) {
      console.error("Error minting tokens:", error);
      setTransactionStatus("Failed to mint tokens.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Create a Solana Token</h1>
      {!connected ? (
        <button onClick={connect} style={{ padding: "10px", fontSize: "16px" }}>
          Connect Phantom Wallet
        </button>
      ) : (
        <div>
          <p>Wallet connected: {publicKey.toString()}</p>
          <button onClick={createToken} style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}>
            Create New Token
          </button>
          {tokenAddress && (
            <div>
              <p>Token Address: {tokenAddress}</p>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(Number(e.target.value))}
                placeholder="Token Amount"
                style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
              />
              <button onClick={mintTokens} style={{ padding: "10px", fontSize: "16px" }}>
                Mint Tokens
              </button>
            </div>
          )}
          {transactionStatus && <p>{transactionStatus}</p>}
        </div>
      )}
    </div>
  );
};

export default function AppWrapper() {
  return (
    <WalletProvider>
      <App />
    </WalletProvider>
  );
};
