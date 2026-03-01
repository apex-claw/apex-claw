const ethers = require('ethers');

// Base Mainnet Public RPC
const RPC_URL = 'https://mainnet.base.org';

// Known suspicious function signatures
const VULNERABILITY_SIGNATURES = {
    '0x40c10f19': 'mint(address,uint256) - Potential unlimited minting',
    '0x8456cb59': 'pause() - Contract pausable (potential honeypot)',
    '0x1e012354': 'blacklist(address) - Blacklisting capability (potential honeypot)',
    '0x0f296d92': 'setTaxFeePercent(uint256) - Adjustable tax (potential honeypot / rug)',
    '0x722713f7': 'setBalance(address,uint256) - Arbitrary balance modification',
    '0xd2f3bfa4': 'setFee(uint256) - Adjustable fee (potential honeypot)',
    '0xa44cceeb': 'setMaxTxPercent(uint256) - Adjustable max tx (potential honeypot)'
};

async function scanContract(targetAddress) {
    if (!ethers.utils.isAddress(targetAddress)) {
        console.error("Invalid Ethereum address provided.");
        process.exit(1);
    }

    console.log(`[+] Initializing RPC connection to Base Mainnet...`);
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    console.log(`[+] Fetching bytecode for contract: ${targetAddress}`);
    try {
        const bytecode = await provider.getCode(targetAddress);

        if (bytecode === '0x' || bytecode === '0') {
            console.log(`[-] No bytecode found at address ${targetAddress}. Is it a deployed contract?`);
            return;
        }

        console.log(`[+] Bytecode fetched successfully. Length: ${bytecode.length}`);
        console.log(`[+] Scanning for known vulnerability signatures...`);

        let foundVulnerabilities = false;

        for (const [signature, description] of Object.entries(VULNERABILITY_SIGNATURES)) {
            // Remove the '0x' prefix for searching within the bytecode string
            const searchSig = signature.slice(2);
            if (bytecode.includes(searchSig)) {
                foundVulnerabilities = true;
                console.log(`[!] EXPLOITABLE PATTERN DETECTED: [${signature}] - ${description}`);
            }
        }

        if (!foundVulnerabilities) {
            console.log(`[-] No known suspicious signatures detected in bytecode.`);
        }

        console.log(`[+] Scan complete.`);

    } catch (error) {
        console.error(`Error fetching contract data: ${error.message}`);
    }
}

const targetArgs = process.argv.slice(2);
if (targetArgs.length === 0) {
    console.log("Usage: node contract_scanner.js <contract_address>");
    process.exit(1);
}

scanContract(targetArgs[0]);
