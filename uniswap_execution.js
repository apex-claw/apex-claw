const { ethers } = require("ethers");

// Configuration for Base Network
const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Contract Addresses on Base
const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"; // Base WETH
const TARGET_TOKEN_ADDRESS = process.env.TARGET_TOKEN_ADDRESS || "0x856f432fb7795ad1c8ac2cd30e2fdf07ffcb4931"; // Example: BRETT or set DEGEN

// ABIs
const SWAP_ROUTER_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
];

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Please set the PRIVATE_KEY environment variable.");
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const routerContract = new ethers.Contract(UNISWAP_V3_ROUTER, SWAP_ROUTER_ABI, wallet);

  // Swap Configuration
  const amountInETH = ethers.utils.parseEther("0.001"); // Amount of ETH to swap
  const amountOutMinimum = 0; // Set to 0 for simplicity, in prod use a proper slippage calculation
  const fee = 3000; // 0.3% pool fee, common for WETH/Altcoin pairs
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  const params = {
    tokenIn: WETH_ADDRESS,
    tokenOut: TARGET_TOKEN_ADDRESS,
    fee: fee,
    recipient: wallet.address,
    deadline: deadline,
    amountIn: amountInETH,
    amountOutMinimum: Math.floor(amountOutMinimum),
    sqrtPriceLimitX96: 0
  };

  console.log(`Swapping ${ethers.utils.formatEther(amountInETH)} ETH for Token ${TARGET_TOKEN_ADDRESS}...`);

  try {
    // Send transaction. Note: we pass value for ETH -> WETH routing if supported by router configuration,
    // otherwise wrap ETH to WETH first. The standard Uniswap V3 router handles exactInputSingle with msg.value if tokenIn is WETH.
    const tx = await routerContract.exactInputSingle(params, {
      value: amountInETH,
      gasLimit: 300000 // Adjust based on current network conditions
    });

    console.log(`Transaction submitted! Hash: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Error executing swap:", error);
  }
}

main().catch(console.error);
