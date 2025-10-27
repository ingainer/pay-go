# Solana USDC Payment Gateway

Payment gateway with real wallet integration on Solana blockchain.

## Features

- ⚡ Lightning fast 400ms finality
- 💰 0.01 USDC payment amount
- 🔒 On-chain transaction verification
- 💎 Phantom wallet integration

## Tech Stack

- Node.js + Express
- Solana web3.js + SPL Token
- Phantom wallet
- Solana mainnet

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

## Payment Flow

1. User clicks "Pay Now"
2. Connects Phantom wallet
3. Approves 0.01 USDC transaction
4. Backend verifies payment on-chain
5. Access granted to premium content

## Requirements

- Phantom wallet installed
- 0.01 USDC in wallet
- Small amount of SOL for fees

## License

MIT
