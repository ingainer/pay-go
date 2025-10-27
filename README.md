# Solana USDC Payment Gateway

Production-ready payment gateway using **x402 protocol** on **Solana blockchain**.

## Features

- ⚡ **Lightning Fast**: 400ms transaction finality
- 💰 **Low Fees**: $0.00025 per transaction
- 🔒 **Secure**: Blockchain-protected payments
- 💎 **USDC Payments**: Stablecoin on Solana mainnet

## Tech Stack

- **Backend**: Node.js + Express
- **Payment**: x402-solana protocol
- **Blockchain**: Solana mainnet
- **Deployment**: Render.com

## Quick Deploy to Render.com

### 🚀 One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ingainer/pay-go)

The `render.yaml` file automatically configures everything including:
- ✅ Build command: `npm install`
- ✅ Start command: `node server.js`
- ✅ Wallet address: `9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm`
- ✅ Network: Solana mainnet-beta
- ✅ Facilitator URL configured

**Just click the button and your app will be live in 2-3 minutes!**

### 📖 Detailed Deployment Guide

For step-by-step instructions, see **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)**

### ⚠️ If You See "WALLET_ADDRESS Required" Error

The environment variable is in `render.yaml` but Render might need it set manually:

1. Go to your service in Render dashboard
2. Click **Environment** tab
3. Add: `WALLET_ADDRESS` = `9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm`
4. Save (auto-redeploys)

## Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Solana wallet address

# Run server
npm start

# Visit
open http://localhost:10000
```

## API Endpoints

- `GET /` - Payment page
- `GET /api/payment/initiate` - Payment endpoint (0.01 USDC)
- `GET /success` - Success page
- `GET /health` - Health check

## Payment Flow

1. User visits payment page
2. Clicks "Pay Now" (0.01 USDC)
3. Solana wallet processes payment
4. x402 protocol verifies transaction
5. User redirected to premium content

## Configuration

Edit `render.yaml` to change:
- Payment amount (currently 0.01 USDC)
- Wallet address
- Network (mainnet-beta or devnet)

## Project Structure

```
pay-go/
├── server.js           # Express server
├── package.json        # Dependencies
├── render.yaml         # Render deployment config
├── public/
│   ├── index.html     # Payment page
│   └── success.html   # Success page
└── README.md
```

## Resources

- **x402 Protocol**: https://docs.cdp.coinbase.com/x402
- **Solana Docs**: https://docs.solana.com
- **Render Docs**: https://render.com/docs

## License

MIT
