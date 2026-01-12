// ============================================
// MNEE Invoice Pay - JavaScript
// Web3 Invoice Generator & Payment System
// ============================================

// ============================================
// CONFIGURATION
// ============================================

// MNEE Token Contract Address
// NOTE: Replace this with the actual MNEE token contract address on your network
// This is a placeholder ERC-20 token contract address for demonstration
const MNEE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // REPLACE WITH REAL MNEE CONTRACT

// Standard ERC-20 Token ABI (Application Binary Interface)
// This defines how to interact with any ERC-20 token contract
// We only need the 'transfer' function for this MVP
const ERC20_ABI = [
    // Function to transfer tokens from sender to recipient
    "function transfer(address to, uint amount) returns (bool)",
    // Function to check token balance of an address
    "function balanceOf(address owner) view returns (uint256)",
    // Function to get token decimals (usually 18 for most tokens)
    "function decimals() view returns (uint8)",
    // Function to get token symbol
    "function symbol() view returns (string)"
];

// ============================================
// GLOBAL STATE
// ============================================

let provider = null;           // Ethereum provider (MetaMask)
let signer = null;             // User's wallet signer (to sign transactions)
let userAddress = null;        // Connected wallet address
let currentInvoice = null;     // Current invoice data
let isConnecting = false;      // Track if wallet connection is in progress

// ============================================
// DOM ELEMENTS
// ============================================

// Get references to all important HTML elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletStatus = document.getElementById('walletStatus');
const walletAddress = document.getElementById('walletAddress');
const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
const payInvoiceBtn = document.getElementById('payInvoiceBtn');
const invoiceEmpty = document.getElementById('invoiceEmpty');
const invoiceDetails = document.getElementById('invoiceDetails');
const transactionStatus = document.getElementById('transactionStatus');

// Form inputs
const invoiceAmountInput = document.getElementById('invoiceAmount');
const invoiceDescriptionInput = document.getElementById('invoiceDescription');
const recipientAddressInput = document.getElementById('recipientAddress');

// Preview elements
const previewDescription = document.getElementById('previewDescription');
const previewAmount = document.getElementById('previewAmount');
const previewRecipient = document.getElementById('previewRecipient');
const previewTotal = document.getElementById('previewTotal');

// ============================================
// WALLET CONNECTION
// ============================================

// Function to check if MetaMask is installed
function checkMetaMaskInstalled() {
    // MetaMask injects 'ethereum' object into the browser window
    if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask is installed!');
        return true;
    } else {
        console.log('❌ MetaMask is NOT installed');
        return false;
    }
}

// Function to connect to MetaMask wallet
async function connectWallet() {
    console.log('🔌 Attempting to connect wallet...');

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
        console.log('⚠️ Connection already in progress, ignoring duplicate request');
        showStatus(walletStatus, 'warning',
            '⏳ Please check MetaMask and approve the connection request.');
        return;
    }

    // Check if ethers.js library is loaded
    if (typeof ethers === 'undefined') {
        showStatus(walletStatus, 'error',
            '⚠️ Loading required libraries... Please refresh the page and try again.');
        console.error('❌ ethers.js library not loaded!');
        return;
    }

    // Check if MetaMask is installed
    if (!checkMetaMaskInstalled()) {
        showStatus(walletStatus, 'error',
            '⚠️ MetaMask not found! Please install MetaMask extension to continue.');
        return;
    }

    try {
        // Set connecting state
        isConnecting = true;

        // Disable button and show loading state
        connectWalletBtn.disabled = true;
        connectWalletBtn.textContent = '⏳ Connecting...';

        showStatus(walletStatus, 'info',
            '⏳ Please check MetaMask and approve the connection request.');

        // Request access to the user's MetaMask accounts
        console.log('📝 Requesting account access...');
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        // Create an ethers.js provider connected to MetaMask
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // Get the signer (this is what allows us to send transactions)
        signer = provider.getSigner();

        // Get the connected wallet address
        userAddress = accounts[0];

        console.log('✅ Wallet connected:', userAddress);

        // Update UI to show connected state
        displayWalletConnected(userAddress);

        // Enable the pay button if invoice exists
        if (currentInvoice) {
            payInvoiceBtn.disabled = false;
            document.querySelector('.payment-note').textContent =
                'Click to pay invoice with MetaMask';
        }

    } catch (error) {
        console.error('❌ Wallet connection failed:', error);

        // Handle specific error cases with user-friendly messages
        let errorMessage = '';

        if (error.message.includes('already pending')) {
            errorMessage = '⏳ A connection request is already open in MetaMask. Please check your MetaMask extension and approve or reject the pending request.';
        } else if (error.code === 4001 || error.message.includes('User rejected')) {
            errorMessage = '❌ Connection rejected. Click the button again to reconnect.';
        } else if (error.message.includes('User denied')) {
            errorMessage = '❌ Connection denied. Click the button again to reconnect.';
        } else {
            errorMessage = `❌ Connection failed: ${error.message}`;
        }

        showStatus(walletStatus, 'error', errorMessage);

        // Re-enable button on error
        connectWalletBtn.disabled = false;
        connectWalletBtn.textContent = 'Connect MetaMask Wallet';
    } finally {
        // Always reset connecting state
        isConnecting = false;
    }
}

// Function to display connected wallet in UI
function displayWalletConnected(address) {
    // Shorten the address for display (0x1234...5678)
    const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;

    walletAddress.textContent = `Connected: ${shortAddress}`;
    walletAddress.style.display = 'block';

    connectWalletBtn.textContent = '✅ Wallet Connected';
    connectWalletBtn.style.background = 'var(--success-color)';
    connectWalletBtn.disabled = true;

    showStatus(walletStatus, 'success',
        '✅ Wallet connected successfully! You can now pay invoices.');
}

// ============================================
// INVOICE GENERATION
// ============================================

// Function to generate invoice from form data
function generateInvoice() {
    console.log('📄 Generating invoice...');

    // Get values from form inputs
    const amount = invoiceAmountInput.value;
    const description = invoiceDescriptionInput.value;
    const recipient = recipientAddressInput.value;

    // Validate inputs
    if (!amount || !description || !recipient) {
        alert('⚠️ Please fill in all fields');
        return;
    }

    // Validate Ethereum address format
    if (!ethers.utils.isAddress(recipient)) {
        alert('⚠️ Invalid recipient address. Must be a valid Ethereum address.');
        return;
    }

    // Create invoice object
    currentInvoice = {
        amount: parseFloat(amount),
        description: description,
        recipient: recipient,
        createdAt: new Date().toISOString()
    };

    console.log('✅ Invoice created:', currentInvoice);

    // Update UI with invoice preview
    displayInvoicePreview(currentInvoice);
}

// Function to display invoice preview
function displayInvoicePreview(invoice) {
    // Hide empty state
    invoiceEmpty.style.display = 'none';

    // Show invoice details
    invoiceDetails.style.display = 'block';

    // Populate invoice data
    previewDescription.textContent = invoice.description;
    previewAmount.textContent = `${invoice.amount} MNEE`;

    // Shorten recipient address for display
    const shortRecipient = `${invoice.recipient.substring(0, 10)}...${invoice.recipient.substring(38)}`;
    previewRecipient.textContent = shortRecipient;
    previewRecipient.title = invoice.recipient; // Show full address on hover

    previewTotal.textContent = `${invoice.amount} MNEE`;

    // Enable pay button if wallet is connected
    if (userAddress) {
        payInvoiceBtn.disabled = false;
        document.querySelector('.payment-note').textContent =
            'Click to pay invoice with MetaMask';
    }

    // Clear any previous transaction status
    transactionStatus.innerHTML = '';
}

// ============================================
// PAYMENT PROCESSING
// ============================================

// Function to pay invoice with MNEE tokens
async function payInvoice() {
    if (!currentInvoice) {
        alert('⚠️ No invoice to pay!');
        return;
    }

    if (!userAddress) {
        alert('⚠️ Please connect your wallet first!');
        return;
    }

    console.log('💳 Initiating payment...');
    console.log('Invoice:', currentInvoice);

    try {
        // Show loading state
        payInvoiceBtn.disabled = true;
        payInvoiceBtn.innerHTML = '<span class="loading"></span> Processing...';
        showStatus(transactionStatus, 'info',
            '⏳ Preparing transaction... Please confirm in MetaMask.');

        // Create contract instance for MNEE token
        const mneeContract = new ethers.Contract(
            MNEE_TOKEN_ADDRESS,
            ERC20_ABI,
            signer
        );

        // Get token decimals (usually 18)
        const decimals = await mneeContract.decimals();
        console.log('Token decimals:', decimals);

        // Convert amount to proper format with decimals
        // For example: 100 MNEE with 18 decimals = 100000000000000000000
        const amountInTokenUnits = ethers.utils.parseUnits(
            currentInvoice.amount.toString(),
            decimals
        );

        console.log('Amount to send:', amountInTokenUnits.toString());
        console.log('Recipient:', currentInvoice.recipient);

        // Execute the transfer transaction
        console.log('📤 Sending transaction...');
        const tx = await mneeContract.transfer(
            currentInvoice.recipient,
            amountInTokenUnits
        );

        console.log('Transaction sent:', tx.hash);
        showStatus(transactionStatus, 'info',
            `⏳ Transaction submitted! Hash: ${tx.hash.substring(0, 10)}...`);

        // Wait for transaction to be confirmed on blockchain
        console.log('⏳ Waiting for confirmation...');
        showStatus(transactionStatus, 'info',
            '⏳ Waiting for blockchain confirmation...');

        const receipt = await tx.wait();

        console.log('✅ Transaction confirmed!', receipt);

        // Show success message
        showStatus(transactionStatus, 'success',
            `✅ Payment successful! Transaction: ${tx.hash.substring(0, 10)}...${tx.hash.substring(60)}`);

        // Update button
        payInvoiceBtn.innerHTML = '✅ Payment Complete';
        payInvoiceBtn.style.background = 'var(--success-color)';

    } catch (error) {
        console.error('❌ Payment failed:', error);

        // Parse error message for user-friendly display
        let errorMessage = 'Transaction failed';

        if (error.code === 4001) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
        } else if (error.message) {
            errorMessage = error.message;
        }

        showStatus(transactionStatus, 'error',
            `❌ ${errorMessage}`);

        // Re-enable pay button
        payInvoiceBtn.disabled = false;
        payInvoiceBtn.innerHTML = '💳 Pay Invoice with MNEE';
    }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

// Function to display status messages
function showStatus(element, type, message) {
    element.innerHTML = message;
    element.className = `status-message status-${type}`;
    element.style.display = 'block';
}

// ============================================
// EVENT LISTENERS
// ============================================

// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, attaching event listeners...');

    // Connect wallet button
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
        console.log('✅ Connect wallet button listener attached');
    } else {
        console.error('❌ Connect wallet button not found!');
    }

    // Generate invoice button
    if (generateInvoiceBtn) {
        generateInvoiceBtn.addEventListener('click', () => {
            console.log('🔵 Generate invoice button clicked!');
            generateInvoice();
        });
        console.log('✅ Generate invoice button listener attached');
    } else {
        console.error('❌ Generate invoice button not found!');
    }

    // Pay invoice button
    if (payInvoiceBtn) {
        payInvoiceBtn.addEventListener('click', payInvoice);
        console.log('✅ Pay invoice button listener attached');
    } else {
        console.error('❌ Pay invoice button not found!');
    }

    // Listen for account changes in MetaMask
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('Account changed:', accounts[0]);

            if (accounts.length === 0) {
                // User disconnected wallet
                console.log('Wallet disconnected');
                userAddress = null;
                walletAddress.style.display = 'none';
                connectWalletBtn.textContent = 'Connect MetaMask Wallet';
                connectWalletBtn.style.background = 'var(--primary-color)';
                connectWalletBtn.disabled = false;
                payInvoiceBtn.disabled = true;
                showStatus(walletStatus, 'warning',
                    '⚠️ Wallet disconnected. Please reconnect to pay invoices.');
            } else {
                // User switched accounts
                userAddress = accounts[0];
                displayWalletConnected(userAddress);
            }
        });

        // Listen for network changes
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('Network changed:', chainId);
            // Reload the page when network changes
            window.location.reload();
        });
    }

    console.log('✅ MNEE Invoice Pay loaded successfully');
    console.log('📝 Waiting for user interaction...');
});

// ============================================
// INITIALIZATION
// ============================================

// Check if wallet is already connected on page load
window.addEventListener('load', async () => {
    console.log('🚀 App loaded');

    // Wait a bit for ethers.js to fully load from CDN
    if (typeof ethers === 'undefined') {
        console.log('⏳ Waiting for ethers.js to load...');
        // Wait up to 3 seconds for ethers to load
        for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (typeof ethers !== 'undefined') {
                console.log('✅ ethers.js loaded successfully');
                break;
            }
        }

        if (typeof ethers === 'undefined') {
            console.error('❌ Failed to load ethers.js');
            showStatus(walletStatus, 'error',
                '⚠️ Failed to load required libraries. Please refresh the page.');
            return;
        }
    }

    if (checkMetaMaskInstalled()) {
        // Check if already connected
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts.length > 0) {
                // Auto-connect if already authorized
                console.log('Found existing connection');
                connectWallet();
            }
        } catch (error) {
            console.log('No existing connection');
        }
    }
});
