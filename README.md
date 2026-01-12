# MNEE Invoice Pay - Web3 Invoice Generator & Payment System

App is live on [https://mneepay.bolt.host](https://mneepay.bolt.host)

A beginner-friendly Web3 application that allows freelancers to create crypto invoices and clients to pay them using MNEE stablecoin via MetaMask.

## 🎯 Project Overview

**What it does:**
- Freelancers create simple invoices with amount and description
- Clients connect their MetaMask wallet
- Clients pay invoices directly with MNEE tokens
- All transactions happen on-chain with full transparency

**What makes it special:**
- ✅ No backend required (100% client-side)
- ✅ No smart contracts needed (uses existing ERC-20 token)
- ✅ No frameworks (pure HTML/CSS/JavaScript)
- ✅ Beginner-friendly with extensive comments
- ✅ Production-ready UI/UX
- ✅ Real-world usability

## 📁 File Structure

```
project/
├── index.html    # Main HTML file with complete UI
├── style.css     # Professional styling with clean design
├── script.js     # Web3 logic and MetaMask integration
└── README.md     # This file
```

## 🚀 How to Run

### Method 1: Simple HTTP Server (Recommended)

1. Open terminal in the project folder
2. Run a simple HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# OR using Python 2
python -m SimpleHTTPServer 8000

# OR using Node.js
npx http-server -p 8000
```

3. Open browser to `http://localhost:8000`

### Method 2: Direct File Opening

Simply open `index.html` in your browser by double-clicking it.

**Note:** Some browsers may restrict MetaMask access when opening files directly. Use Method 1 for best results.

### Setup (Before Demo)

1. **Install MetaMask:** Make sure MetaMask browser extension is installed
2. **Get Test Tokens:**
   - Switch to a testnet (e.g., Polygon Mumbai, Goerli)
   - Get test MATIC/ETH from faucet for gas fees
   - Add MNEE token to your wallet (you'll need the contract address)
3. **Update Token Address:** Edit `script.js` and update `MNEE_TOKEN_ADDRESS` with the real MNEE contract address

### Demo Flow

**Step 1: Introduction (30 seconds)**
- "This is MNEE Invoice Pay - a simple tool for crypto-based freelance payments"
- "No backend, no smart contracts, just pure Web3 functionality"

**Step 2: Create Invoice (30 seconds)**
- Fill in invoice form:
  - Amount: 100 MNEE
  - Description: "Website Design Services"
  - Recipient: Your wallet address
- Click "Generate Invoice"
- Show the clean invoice preview

**Step 3: Connect Wallet (20 seconds)**
- Click "Connect MetaMask Wallet"
- Accept the connection in MetaMask popup
- Show connected wallet address

**Step 4: Execute Payment (40 seconds)**
- Click "Pay Invoice with MNEE"
- Show MetaMask confirmation popup
- Confirm transaction
- Show transaction pending state
- Show success message with transaction hash

**Step 5: Verify (20 seconds)**
- Open blockchain explorer (Etherscan/Polygonscan)
- Paste transaction hash
- Show confirmed transaction on-chain

### Key Points to Emphasize

1. **Simplicity:** "No complex setup, any freelancer can use this"
2. **Security:** "All transactions happen on-chain, fully transparent"
3. **Real-world ready:** "This could be used in production today"
4. **Educational:** "Code is heavily commented for learning"
5. **Cost-effective:** "No backend hosting, no monthly fees"

## 💡 How This Fits Financial Automation Track

### Financial Automation Elements

1. **Automated Payment Processing**
   - No manual bank transfers
   - Instant settlement
   - No payment processors or fees

2. **Smart Invoice Generation**
   - Standardized invoice format
   - Immutable payment records
   - Automatic wallet verification

3. **Streamlined Workflow**
   - Create invoice → Pay → Done
   - No intermediaries
   - No approval delays

4. **Transparency & Auditability**
   - All transactions on-chain
   - Permanent records
   - Easy verification

### Traditional vs MNEE Invoice Pay

| Feature | Traditional | MNEE Invoice Pay |
|---------|-------------|------------------|
| Payment Time | 3-5 days | ~30 seconds |
| Fees | 2.9% + $0.30 | Only gas fees (~$0.01) |
| International | High fees | Same cost |
| Setup | Complex | 2 clicks |
| Backend | Required | None |

## 🛠️ Technical Details

### Technology Stack

- **Frontend:** Pure HTML5, CSS3, JavaScript (ES6+)
- **Web3 Library:** ethers.js v5 (loaded via CDN)
- **Wallet:** MetaMask browser extension
- **Blockchain:** Any EVM-compatible chain (Ethereum, Polygon, BSC, etc.)
- **Token Standard:** ERC-20 (MNEE stablecoin)

### Key Features

1. **MetaMask Integration**
   - Auto-detection
   - Account switching detection
   - Network change handling

2. **ERC-20 Token Transfers**
   - Standard transfer function
   - Decimal handling
   - Transaction confirmation

3. **User Experience**
   - Loading states
   - Error handling
   - Success feedback
   - Responsive design

4. **Security**
   - Address validation
   - Transaction confirmation
   - No private key handling (MetaMask manages this)

### Code Structure

**script.js sections:**
- Configuration (token address, ABI)
- Global state management
- Wallet connection logic
- Invoice generation
- Payment processing
- UI helper functions
- Event listeners

**style.css highlights:**
- CSS custom properties (variables)
- Flexbox & Grid layouts
- Card-based components
- Responsive breakpoints
- Smooth animations

## 📝 Configuration

### Setting Up MNEE Token

Edit `script.js` and update this line:

```javascript
const MNEE_TOKEN_ADDRESS = '0xYOUR_MNEE_TOKEN_ADDRESS_HERE';
```

### Supported Networks

Works on any EVM-compatible network where MNEE token is deployed:
- Ethereum Mainnet
- Polygon
- Binance Smart Chain
- Avalanche
- Arbitrum
- Optimism
- Testnets (Goerli, Mumbai, etc.)

## 🎓 Educational Value

### Learning Objectives

This project teaches:

1. **Web3 Basics**
   - What is MetaMask?
   - How do wallet connections work?
   - What are ERC-20 tokens?

2. **Smart Contract Interaction**
   - Reading contract functions
   - Sending transactions
   - Handling confirmations

3. **Frontend Web3 Integration**
   - ethers.js library usage
   - Provider and signer concepts
   - Transaction lifecycle

4. **UX Best Practices**
   - Clear feedback
   - Error handling
   - Loading states
   - Beginner-friendly language

### Code Comments

Every important section has detailed comments explaining:
- What the code does
- Why it's needed
- How it works
- What could go wrong

## 🔧 Customization

### Changing Colors

Edit `style.css` variables:

```css
:root {
    --primary-color: #2563eb;    /* Change primary color */
    --success-color: #16a34a;    /* Change success color */
}
```

### Adding Features

Easy extensions:
- [ ] Save invoices to localStorage
- [ ] Add invoice history
- [ ] Support multiple tokens
- [ ] Add QR code generation
- [ ] Email invoice links
- [ ] PDF export

## 🐛 Troubleshooting

### MetaMask Not Detected

**Problem:** "MetaMask not found" error

**Solution:**
1. Install MetaMask browser extension
2. Refresh the page
3. Make sure you're using a supported browser (Chrome, Firefox, Brave)

### Transaction Failed

**Problem:** Transaction fails or gets rejected

**Solutions:**
1. Check you have enough MNEE tokens
2. Check you have enough ETH/MATIC for gas
3. Verify recipient address is correct
4. Try increasing gas limit in MetaMask

### Invoice Not Showing

**Problem:** Invoice preview not appearing

**Solution:**
1. Make sure all fields are filled
2. Check recipient address format (must start with 0x)
3. Check browser console for errors

## 📊 Demo Checklist

Before your hackathon demo:

- [ ] MetaMask installed and set up
- [ ] Test network selected (or mainnet with small amounts)
- [ ] Test ETH/MATIC for gas fees
- [ ] MNEE tokens in wallet
- [ ] MNEE contract address updated in code
- [ ] App running on localhost or Replit
- [ ] Prepared recipient address for demo
- [ ] Browser zoom set to 100% for best view
- [ ] Pop-up blocker disabled for MetaMask
- [ ] Practice the 2-minute demo flow

## 🎯 Judging Criteria Alignment

### Innovation
- ✅ Removes payment barriers for freelancers
- ✅ Simplifies crypto payments for beginners
- ✅ No backend = lower costs & complexity

### Technical Implementation
- ✅ Clean, well-commented code
- ✅ Proper error handling
- ✅ Professional UI/UX
- ✅ Real Web3 functionality

### Usability
- ✅ Intuitive interface
- ✅ Clear instructions
- ✅ Beginner-friendly explanations
- ✅ Responsive design

### Financial Automation
- ✅ Instant settlements
- ✅ Automated payment flow
- ✅ Transparent records
- ✅ Cost-effective solution

## 🚀 Next Steps (Post-Hackathon)

Ideas for future development:

1. **Multi-token support:** Accept any ERC-20 token
2. **Invoice storage:** Save invoices on IPFS or Arweave
3. **Recurring invoices:** Set up subscription payments
4. **Team features:** Multi-user organizations
5. **Mobile app:** React Native version
6. **Email integration:** Send invoice links via email
7. **Analytics dashboard:** Track payment history
8. **Tax reporting:** Export for accounting

## 📄 License

Open source - feel free to use, modify, and learn from this code!

## 🙏 Credits

Built for Web3 Hackathon as an educational MVP demonstrating:
- Financial automation with blockchain
- Beginner-friendly Web3 development
- Real-world crypto use cases
- Clean code practices

---

**Happy Hacking! 🚀**
- Developer: Abdul basit
- Email: abasit.dev@gmail.com