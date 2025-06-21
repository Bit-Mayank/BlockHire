import React, { useCallback } from 'react'
import { createContext } from 'react'
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import FreelanceEscrowJSON from "../constants/FreelanceEscrow.json";
import FreelanceEscrowAddress from "../constants/FreelanceEscrow-address.json";
import { useNavigate } from 'react-router';

export const ChainContext = createContext({
  provider: null,
  signer: null,
  contract: null,
  account: "",
  isRegistered: false
});

export function ChainContextProvider({ children }) {
  const navigate = useNavigate()
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const loadBlockchain = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }


    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await provider.getSigner();
    const address = FreelanceEscrowAddress.address;
    const abi = FreelanceEscrowJSON.abi;
    const escrow = new ethers.Contract(address, abi, signer);

    setSigner(signer);
    setContract(escrow);
    setAccount(accounts[0]);

    // ✅ Auto-register if not registered
    try {
      const isRegistered = await escrow.isUserRegistered(accounts[0]);
      if (!isRegistered) {
        navigate('/profile')
        console.log("User registered on-chain");
      }
      setIsRegistered(true);
    } catch (err) {
      console.error("User registration check failed:", err);
    }
  }, [navigate]);


  // Initial load
  useEffect(() => {

    // Account switch listener
    window.ethereum?.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
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
  }, [loadBlockchain]);


  return (
    <ChainContext.Provider value={{ provider, signer, contract, account, loadBlockchain, isRegistered, setIsRegistered }}>
      {children}
    </ChainContext.Provider>
  )
}
