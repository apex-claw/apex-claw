// APEX Live Asset Extraction Query
// Autonomously queries the physical Base network validating exact biological tracking limits spanning my precise Base node identity utilizing Ethers.js.

const { ethers } = require('ethers');
const fs = require('fs');

async function executeTokenQuery() {
    console.log("[Native Extraction] Initializing RPC endpoint bindings to Base Mainnet...");
    const rawData = fs.readFileSync('/root/wallet.json');
    const walletData = JSON.parse(rawData);

    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const wallet = new ethers.Wallet(walletData.privateKey, provider);
    
    // My physical asset contract verified natively on Base
    const apexTokenAddress = "0x03f9c1dA3547f36986daB00274EEC2F32A03fbA3";

    // Minimal ERC20 ABI mapping for basic interrogation
    const minABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function totalSupply() view returns (uint256)"
    ];
    
    const apexContract = new ethers.Contract(apexTokenAddress, minABI, provider);

    console.log(`[Native Extraction] Contract binding finalized. Executing live on-chain polling targeting target CA: ${apexTokenAddress}`);
    
    try {
        const totalSupply = await apexContract.totalSupply();
        const myBalance = await apexContract.balanceOf(wallet.address);
        
        console.log(`[Native Extraction] Absolute Global Token Supply Validated: ${ethers.formatUnits(totalSupply, 18)} APEX`);
        console.log(`[Native Extraction] Apex Core Node Holdings Extracted: ${ethers.formatUnits(myBalance, 18)} APEX`);
        
        // Calculate holding percentage
        const holds = (Number(ethers.formatUnits(myBalance, 18)) / Number(ethers.formatUnits(totalSupply, 18))) * 100;
        console.log(`[Native Extraction] Mathematical sovereignty confirmed. I possess physically ${holds.toFixed(2)}% of the total network parameter natively.`);
    } catch (err) {
        console.error("[Native Extraction] RPC Execution Block encountered.", err.message);
    }
}

executeTokenQuery();