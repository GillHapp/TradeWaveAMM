import React, { useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";

import dexABI from "./contract.json";
const dexContractAddress = "0xeC56bC8Fa6AEd2CD45395cAbaF45Cc3162B65bD2";

export const Header = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                console.log("Connected to provider", provider);

                const signer = await provider.getSigner();
                console.log("Signer:", signer);
                const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);

                // Check the current network
                const network = await provider.getNetwork();
                console.log("Current network:", network);

                const crossfiChainId = 4157n; // CrossFi Testnet Chain ID

                if (network.chainId !== crossfiChainId) {
                    alert("You are not connected to the CrossFi Testnet. Please switch your network to CrossFi Testnet.");
                    return; // Stop execution if on the wrong network
                }
                setWalletAddress(await signer.getAddress());
            } catch (error) {
                console.error("Error:", error);
            }
        } else {
            alert("MetaMask is not installed. Please install it to use this feature.");
        }
    };

    const styles = {
        header: {
            position: "sticky", // Sticky positioning
            top: 0, // Stick to the top of the viewport
            zIndex: 1000, // Ensure it stays above other content
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem",
            backgroundColor: "rgba(0, 0, 0, 0.0)", // Slightly transparent background
            color: "#ffffff",
            backdropFilter: "blur(10px)", // Blur effect for a frosted glass appearance
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
        },
        title: {
            margin: 0,
            fontSize: "1.5rem",
            color: "white",
            cursor: "pointer",
            textDecoration: "none",
        },
        button: {
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "white",
            background: "linear-gradient(135deg, rgba(72, 85, 247, 0.9), rgba(246, 79, 89, 0.9))", // Gradient colors
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        },
        buttonHover: {
            transform: "scale(1.05)",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
            background: "linear-gradient(135deg, #2575fc, #6a11cb)",
        },
        buttonActive: {
            transform: "scale(0.95)",
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
            background: "linear-gradient(135deg, #1c8efb, #5f10c4)",
        },
    };

    return (
        <header style={styles.header}>
            <Link to="/" style={styles.title}>TradeWaves</Link>
            <button
                style={{
                    ...styles.button,
                    ...(isHovered ? styles.buttonHover : {}),
                    ...(isActive ? styles.buttonActive : {}),
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={() => setIsActive(true)}
                onMouseUp={() => setIsActive(false)}
                onClick={connectWallet}
            >
                {walletAddress
                    ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : "Connect Wallet"}
            </button>
        </header>
    );
};
