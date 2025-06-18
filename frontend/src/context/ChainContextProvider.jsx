import React from 'react'
import { createContext } from 'react'
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import FreelanceEscrowJSON from "../constants/FreelanceEscrow.json";
import FreelanceEscrowAddress from "../constants/FreelanceEscrow-address.json";

export const ChainContext = createContext({
  provider: null,
  signer: null,
  contract: null,
  account: ""
});

export function ChainContextProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  const loadBlockchain = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    // Request access to accounts
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await provider.getSigner();
    const address = FreelanceEscrowAddress.address;
    const abi = FreelanceEscrowJSON.abi;

    const escrow = new ethers.Contract(address, abi, signer);

    setSigner(signer);
    setContract(escrow);
    setAccount(accounts[0]);
  };

  // Initial load
  useEffect(() => {

    // Account switch listener
    window.ethereum?.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        loadBlockchain(); // reload signer & contract
      } else {
        setAccount("");
      }
    });

    // Network switch listener
    window.ethereum?.on("chainChanged", () => {
      window.location.reload(); // best practice for network switch
    });

    return () => {
      window.ethereum?.removeAllListeners("accountsChanged");
      window.ethereum?.removeAllListeners("chainChanged");
    };
  }, []);


  return (
    <ChainContext.Provider value={{ provider, signer, contract, account, loadBlockchain }}>
      {children}
    </ChainContext.Provider>
  )
}
