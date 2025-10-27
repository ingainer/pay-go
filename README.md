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

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ingainer/pay-go)

### Manual Deploy

1. **Fork/Clone this repository**

2. **Go to [Render.com](https://render.com) and create new Web Service**

3. **Connect your GitHub repository**

4. **Configuration** (auto-detected from `render.yaml`):
   - Build: `npm install`
   - Start: `node server.js`
   - Plan: Free

5. **Environment Variables** (already configured in `render.yaml`):
   ```
   WALLET_ADDRESS=9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm
   SOLANA_NETWORK=mainnet-beta
   FACILITATOR_URL=https://facilitator.payai.network
   PORT=10000
   ```

6. **Deploy!**

Your payment gateway will be live at: `https://your-app.onrender.com`

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
