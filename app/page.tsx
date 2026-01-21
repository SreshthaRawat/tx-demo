"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [balance, setBalance] = useState<string>("");

  const [toAddress, setToAddress] = useState<string>("");
  const [amountEth, setAmountEth] = useState<string>("0.0001");

  const [txHash, setTxHash] = useState<string>("");
  const [txStatus, setTxStatus] = useState<string>("");

  const [error, setError] = useState<string>("");

  // Helper function:- so it basically refreshes the balance
  const refreshBalance = async () => {
    try {
      setError("");

      if (!(window as any).ethereum) {
        setError("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const bal = await provider.getBalance(userAddress);
      setBalance(ethers.formatEther(bal));
    } catch (e: any) {
      setError(e?.message || "Failed to refresh balance");
    }
  };

  // here we connect to the wallet
  const connectWallet = async () => {
    try {
      setError("");
      setTxHash("");
      setTxStatus("");

      if (!(window as any).ethereum) {
        setError("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);

      // Request account access
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());

      const bal = await provider.getBalance(userAddress);
      setBalance(ethers.formatEther(bal));
    } catch (e: any) {
      setError(e?.message || "Wallet connection failed");
    }
  };

  // here we send ETH transaction
  const sendTransaction = async () => {
    try {
      setError("");
      setTxHash("");
      setTxStatus("");

      if (!address) {
        setError("Please connect your wallet first.");
        return;
      }

      if (!ethers.isAddress(toAddress)) {
        setError("Invalid recipient address.");
        return;
      }

      if (!amountEth || Number(amountEth) <= 0) {
        setError("Enter a valid ETH amount.");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      setTxStatus("Sending transaction... (confirm in MetaMask)");

      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amountEth),
      });

      setTxHash(tx.hash);
      setTxStatus("Transaction sent! Waiting for confirmation...");

      const receipt = await tx.wait(); // waits for 1 confirmation
      if (receipt) {
        setTxStatus(
          `Confirmed ✅ | Block: ${receipt.blockNumber} | Gas Used: ${receipt.gasUsed.toString()}`
        );
      }
      await refreshBalance();
    } catch (e: any) {
      // Common MetaMask reject message
      if (e?.code === 4001) {
        setError("Transaction rejected by user in MetaMask.");
        return;
      }
      setError(e?.message || "Transaction failed");
    }
  };

  // Auto refreshes if account or chain changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    const handleAccountsChanged = () => {
      setAddress("");
      setBalance("");
      setTxHash("");
      setTxStatus("");
      setError("Account changed. Please reconnect.");
    };

    const handleChainChanged = () => {
      setAddress("");
      setBalance("");
      setTxHash("");
      setTxStatus("");
      setError("Network changed. Please reconnect.");
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>
        Wallet Connect + Balance + Send Tx
      </h1>

      <p style={{ marginTop: 8, opacity: 0.8 }}>
        This mini project has MetaMask connect, transaction signing, gas + receipt tracking.
        there will be changes in future as I'm still learning.
      </p>

      <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Connect MetaMask
        </button>

        <div style={{ marginTop: 12 }}>
          <div><b>Address:</b> {address || "-"}</div>
          <div><b>Chain ID:</b> {chainId || "-"}</div>
          <div><b>Balance:</b> {balance ? `${Number(balance).toFixed(6)} ETH` : "-"}</div>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Send ETH Transaction</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          <input
            placeholder="Recipient address (0x...)"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />

          <input
            placeholder="Amount in ETH (example: 0.0001)"
            value={amountEth}
            onChange={(e) => setAmountEth(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />

          <button
            onClick={sendTransaction}
            style={{
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Send Transaction
          </button>

          <div>
            <b>Tx Hash:</b> {txHash || "-"}
          </div>
          <div>
            <b>Status:</b> {txStatus || "-"}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            background: "#ffe6e6",
            border: "1px solid #ffb3b3",
          }}
        >
          <b>Error:</b> {error}
        </div>
      )}

      <div style={{ marginTop: 20, opacity: 0.75 }}>
        <p>
          note (to myself or other users who are using this) : <br></br>
          Use Sepolia/Amoy Testnet with some faucet ETH/MATIC for testing.
        </p>
      </div>
    </main>
  );
}
