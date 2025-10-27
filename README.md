# Solana USDC Payment Gateway

x402 protocol implementation for content monetization on Solana blockchain.

## Features

- 🌐 **x402 Protocol**: HTTP 402 Payment Required standard
- ⚡ **Fast**: 400ms transaction finality
- 💰 **Micropayments**: 0.01 USDC per access
- 🔒 **Verified**: PayAI facilitator + on-chain verification
- 💎 **Wallet Integration**: Phantom wallet support

## Tech Stack

- Node.js + Express
- x402 protocol
- PayAI facilitator
- Solana web3.js + SPL Token
- Phantom wallet
- Solana mainnet

## x402 Payment Flow

1. **Request**: User visits main page
2. **Challenge**: Page shows 402 payment requirement (0.01 USDC)
3. **Wallet Check**: Detects if Phantom wallet installed
4. **Payment**: User connects wallet and approves transaction
5. **Verification**: Server verifies via facilitator + on-chain
6. **Settlement**: One-time access token issued
7. **Delivery**: Premium content served at /content

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Solana wallet address

# Run
npm start
```

Visit: http://localhost:10000

## Endpoints

- `GET /` - Main payment page
- `GET /content` - Protected content (returns 402 if not paid)
- `GET /api/payment/challenge` - Get payment details (402 response)
- `POST /api/payment/verify` - Verify payment and issue token
- `GET /health` - Health check

## Requirements

- Phantom wallet installed
- 0.01 USDC in wallet
- Small amount of SOL for transaction fees (~$0.00025)

## Environment Variables

```
WALLET_ADDRESS=your_solana_wallet_address
SOLANA_NETWORK=mainnet-beta
FACILITATOR_URL=https://facilitator.payai.network
PORT=10000
```

## License

MIT
