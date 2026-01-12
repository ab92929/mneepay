# 🚀 Quick Start Guide - MNEE Invoice Pay

## 5-Minute Setup

### 1. Update Token Address (IMPORTANT!)

Open `script.js` and change line 14:

```javascript
const MNEE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
```

Replace with your actual MNEE token contract address.

### 2. Run the App

**Option A - Python:**
```bash
python -m http.server 8000
```

**Option B - Node.js:**
```bash
npx http-server -p 8000
```

**Option C - Direct:**
Just double-click `index.html`

### 3. Open Browser

Go to: `http://localhost:8000`

---

## 2-Minute Demo Script

### Act 1: Setup (30 seconds)
1. Click "Connect MetaMask Wallet"
2. Accept in MetaMask
3. Show connected address

### Act 2: Create Invoice (30 seconds)
1. Enter amount: `100`
2. Enter description: `Website Design`
3. Paste recipient address
4. Click "Generate Invoice"

### Act 3: Payment (60 seconds)
1. Click "Pay Invoice with MNEE"
2. Confirm in MetaMask
3. Wait for confirmation
4. Show success message

---

## Pre-Demo Checklist

- [ ] MetaMask installed
- [ ] On correct network (testnet recommended)
- [ ] Have MNEE tokens
- [ ] Have gas tokens (ETH/MATIC)
- [ ] Token address updated in code
- [ ] App running locally
- [ ] Pop-ups enabled

---

## Troubleshooting (30 seconds)

**MetaMask not found?**
→ Install extension + refresh

**Transaction failed?**
→ Check token balance + gas

**Can't connect wallet?**
→ Use HTTP server, not file://

---

## Key Talking Points

1. "No backend needed - just HTML, CSS, JavaScript"
2. "Works with any ERC-20 token on any EVM chain"
3. "Perfect for freelancers accepting crypto payments"
4. "All code is commented for learning"
5. "Production-ready UI/UX in 3 files"

---

## File Summary

- `index.html` → Complete UI (165 lines)
- `style.css` → Professional styling (400+ lines)
- `script.js` → Web3 logic with comments (500+ lines)

**Total:** Simple, clean, hackathon-ready MVP!

---

## Test Networks (Free Tokens)

**Polygon Mumbai:**
- RPC: https://rpc-mumbai.maticvigil.com
- Faucet: https://faucet.polygon.technology

**Goerli:**
- RPC: https://goerli.infura.io/v3/YOUR_KEY
- Faucet: https://goerlifaucet.com

---

## Next Steps After Demo

1. Deploy to GitHub Pages (free hosting)
2. Add invoice history feature
3. Support multiple tokens
4. Add PDF export
5. Create mobile version

---

**Good luck with your demo! 🎉**
