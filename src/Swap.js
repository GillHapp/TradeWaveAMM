import React, { useState, useEffect } from "react";
import Liquidity from "./Liquidity"; // Import your Liquidity component
import dexABI from "./contract.json";
import { ethers, parseEther, formatEther } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const tokenContractAddress = "0xb62C083283deB37fE243f301E8CD04933f0f1CA0";
const dexContractAddress = "0xA19B25d0d03822C1b0daBD82D38B55d8f3A13003";

const Swap = () => {
    const [topToken, setTopToken] = useState("XFI");
    const [bottomToken, setBottomToken] = useState("DXFI");
    const [inputValue, setInputValue] = useState("");
    const [calculatedValue, setCalculatedValue] = useState("");
    const [userBalanceDXFI, setUserBalanceDXFI] = useState("0");
    const [userBalanceETH, setUserBalanceETH] = useState("0");
    const [isLoading, setIsLoading] = useState(false);
    const [showLiquidity, setShowLiquidity] = useState(false);

    // Fetch balances on component mount
    useEffect(() => {
        fetchBalances();
    }, []);

    // Fetch user balances
    const fetchBalances = async () => {
        try {
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            // Fetch ETH balance
            const ethBalance = await provider.getBalance(userAddress);
            setUserBalanceETH(formatEther(ethBalance));

            // Fetch DXFI balance
            const tokenContract = new ethers.Contract(tokenContractAddress, dexABI, provider);
            const dxfiBalance = await tokenContract.balanceOf(userAddress);
            setUserBalanceDXFI(formatEther(dxfiBalance));
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    };

    const handleInputChange = async (e) => {
        const value = (e.target.value).toString();
        setInputValue(value);

        if (topToken === "XFI") {
            const calculated = await calculateEthToToken(value);
            setCalculatedValue(calculated);
        } else if (topToken === "DXFI") {
            const calculated = await calculateTokenToEth(value);
            setCalculatedValue(calculated);
        }
    };

    const handleSwapClick = () => {
        setTopToken(bottomToken);
        setBottomToken(topToken);
        setInputValue("");
        setCalculatedValue("");
    };

    const handleSwap = async () => {
        setIsLoading(true);
        try {
            if (topToken === "XFI") {
                await swapEthToToken(inputValue);
            } else if (topToken === "DXFI") {
                await swapTokenToEth(inputValue);
            }
            fetchBalances(); // Refresh balances after swap
        } catch (error) {
            console.error("Error during swap:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to call calculateEthToToken
    const calculateEthToToken = async (ethAmount) => {
        try {
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, provider);
            const ethInput = parseEther(ethAmount);
            const result = await dexContract.calculateEthToToken(ethInput);
            return ethers.formatUnits(result, 18); // Assuming 18 decimals
        } catch (error) {
            console.error("Error calling calculateEthToToken:", error);
        }
    };

    // Function to call calculateTokenToEth
    const calculateTokenToEth = async (tokenAmount) => {
        try {
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, provider);
            const tokenInput = parseEther(tokenAmount);
            const result = await dexContract.calculateTokenToEth(tokenInput);
            return ethers.formatUnits(result, 18); // Assuming 18 decimals
        } catch (error) {
            console.error("Error calling calculateTokenToEth:", error);
        }
    };

    // Function to swap ETH to Token (XFI)
    const swapEthToToken = async (ethAmount) => {
        try {
            const signer = await provider.getSigner();
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);
            const ethInput = parseEther(ethAmount);
            const tx = await dexContract.swapEthToToken({
                value: ethInput, // Sending ETH to the contract
            });
            console.log("Swap ETH to Token submitted:", tx);
            await tx.wait(); // Wait for the transaction to be mined
            alert(`Swap successful! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error swapping ETH to Token:", error);
        }
    };

    // Function to swap Token to ETH (DXFI)
    const swapTokenToEth = async (tokenAmount) => {
        try {
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenContractAddress, dexABI, signer);
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);

            // Check allowance
            const tokenInput = parseEther(tokenAmount);
            const allowance = await tokenContract.allowance(await signer.getAddress(), dexContractAddress);
            if (allowance < tokenInput) {
                const approveTx = await tokenContract.approve(dexContractAddress, tokenInput);
                console.log("Approval submitted:", approveTx);
                await approveTx.wait();
            }

            // Swap tokens to ETH
            const tx = await dexContract.swapTokenToEth(tokenInput);
            console.log("Swap Token to ETH submitted:", tx);
            await tx.wait();
            alert(`Swap successful! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error swapping Token to ETH:", error);
        }
    };

    return (

        <div style={styles.wrapper}>
            <div style={styles.infoParagraph}>
                <p>
                    Welcome to <strong>TradeWaves</strong>, the ultimate decentralized trading platform! With our advanced and seamless interface, you can swap ETH and DXFI effortlessly.
                </p>
                <p>
                    Explore CrossFi Testnet, leverage liquidity pools, and enjoy low fees and fast transactions. Make the most of your trading experience with <strong>TradeWaves</strong>. Start swapping now!
                </p>
            </div>
            <div style={styles.container}>
                <button
                    onClick={() => setShowLiquidity(!showLiquidity)}
                    style={styles.liquidityButton}
                >
                    ⚙️ Liquidity
                </button>

                {showLiquidity ? (
                    <Liquidity />
                ) : (
                    <>
                        <h2 style={styles.title}>Swap</h2>
                        <div style={styles.balanceContainer}>
                            <p style={styles.balanceText}>
                                <strong>ETH Balance:</strong> {userBalanceETH} ETH
                            </p>
                            <p style={styles.balanceText}>
                                <strong>DXFI Balance:</strong> {userBalanceDXFI} DXFI
                            </p>
                        </div>
                        <div style={styles.swapBox}>
                            <div style={styles.tokenGroup}>
                                <label style={styles.label}>{topToken}</label>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder={`Enter ${topToken} amount`}
                                />
                            </div>
                            <button onClick={handleSwapClick} style={styles.swapButton}>
                                ⇅
                            </button>
                            <div style={styles.tokenGroup}>
                                <label style={styles.label}>{bottomToken}</label>
                                <input
                                    type="text"
                                    value={calculatedValue}
                                    readOnly
                                    style={styles.input}
                                    placeholder={`Calculated ${bottomToken} amount`}
                                />
                            </div>
                            <button onClick={handleSwap} style={styles.actionButton}>
                                {isLoading ? (
                                    <div style={styles.spinner}></div>
                                ) : (
                                    `Swap ${topToken} to ${bottomToken}`
                                )}
                            </button>
                            {isLoading && (
                                <div style={styles.loadingText}>Processing your transaction...</div>
                            )}
                        </div>

                    </>
                )}
            </div>

        </div>
    );
};

const styles = {
    wrapper: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "2rem",
        minHeight: "100vh",

    },
    balanceText: {
        color: "black",
    },
    swapWrapper: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "2rem", // Space between the swap box and the paragraph
    },
    swapBox: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        position: "relative",
        flex: "auto", // Allow the swap box to take up available space
    },
    infoParagraph: {

        flex: 1, // Allow the paragraph to take up available space
        padding: "1rem",
        backgroundColor: "rgba(0, 0, 0, 0.2) 0px 4px 6px;",
        color: "#ffffff",
        borderRadius: "8px",
        lineHeight: "1.6",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
        fontSize: "1rem",
        textAlign: "justify",
        maxHight: "50vh",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginRight: "20vh",
        marginLeft: "10vh",
        marginBottom: "15vh",
        maxWidth: "450px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
        position: "relative",

    },
    balanceContainer: {
        marginBottom: "1rem",
        padding: "0.8rem",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        color: "#ffffff",
        fontSize: "1rem",
    },
    infoBanner: {
        background: "transparent", // Gradient background
        color: "#ffffff", // Text color
        padding: "1rem", // Padding for spacing
        borderRadius: "8px", // Rounded corners
        textAlign: "center", // Center align the text
        fontSize: "1.2rem", // Slightly larger font size
        lineHeight: "1.5", // Adjusted line spacing for readability
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
        marginBottom: "1rem", // Space below the banner
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Clean font
        transition: "transform 0.3s ease", // Smooth hover animation
        cursor: "default", // Pointer interaction
        ':hover': {
            transform: "scale(1.02)", // Slightly enlarge on hover
        },
    },
    container: {
        marginRight: "20rem",
        marginTop: "0px",
        padding: "2.5rem",
        background:
            "linear-gradient(135deg, rgba(72, 85, 247, 0.9), rgba(246, 79, 89, 0.9))",
        borderRadius: "20px",
        minWidth: "35vw",
        maxHight: "70vh",
        margin: "2rem auto",
        color: "#ffffff",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
        position: "relative",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        ":hover": {
            transform: "scale(1.02)",
            boxShadow: "0 15px 30px rgba(0, 0, 0, 0.7)",
        },
    },
    liquidityButton: {
        position: "absolute",
        top: "15px",
        left: "15px",
        padding: "0.5rem 0.5rem",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        fontWeight: "bold",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "1rem",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        ":hover": {
            transform: "scale(1.1)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.5)",
        },
    },
    title: {
        textAlign: "center",
        fontSize: "2rem",
        marginBottom: "0.5rem",
        fontWeight: "bold",
        color: "#ffffff",
        textShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
    },
    balanceContainer: {
        marginBottom: "1.5rem",
        padding: "1rem",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        color: "#ffffff",
        fontSize: "1.1rem",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    },
    balanceText: {
        color: "#e0e0e0",
        fontWeight: "500",
    },
    swapBox: {
        display: "flex",
        flexDirection: "column",
        gap: "1.8rem",
        position: "relative",
        padding: "1.5rem",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "15px",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
        transition: "transform 0.4s ease",
        ":hover": {
            transform: "scale(1.02)",
        },
    },
    tokenGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.7rem",
    },
    label: {
        fontWeight: "bold",
        fontSize: "1.2rem",
        color: "#ffffff",
    },
    input: {
        padding: "0.9rem",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        background: "rgba(255, 255, 255, 0.2)",
        color: "#ffffff",
        fontSize: "1rem",
        outline: "none",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
        ":focus": {
            boxShadow: "0 0 8px rgba(72, 85, 247, 0.8)",
            transform: "scale(1.02)",
        },
    },
    swapButton: {
        padding: "0.6rem",
        backgroundColor: "#4855f7",
        color: "#ffffff",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        alignSelf: "center",
        width: "3.5rem",
        height: "3.5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.6rem",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        ":hover": {
            transform: "scale(1.15)",
            boxShadow: "0 8px 16px rgba(72, 85, 247, 0.6)",
        },
    },
    actionButton: {
        marginTop: "1rem",
        padding: "1rem",
        backgroundColor: "#f64f59",
        color: "#ffffff",
        border: "none",
        borderRadius: "15px",
        cursor: "pointer",
        fontSize: "1.2rem",
        fontWeight: "bold",
        textAlign: "center",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
        transition: "transform 0.4s ease, box-shadow 0.4s ease",
        ":hover": {
            transform: "scale(1.05)",
            boxShadow: "0 8px 16px rgba(246, 79, 89, 0.6)",
        },
    },
    spinner: {
        border: "4px solid rgba(255, 255, 255, 0.3)",
        borderTop: "4px solid #ffffff",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        animation: "spin 1s linear infinite",
    },
    loadingText: {
        textAlign: "center",
        fontSize: "1.1rem",
        marginTop: "1.5rem",
        color: "#ffffff",
    },
};

export default Swap;
