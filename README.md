# Solana USDC Payment Gateway

x402 protocol implementation for content monetization on Solana blockchain using a custom backend-driven transaction architecture.

## Features

- 🌐 **x402 Protocol**: HTTP 402 Payment Required standard
- ⚡ **Fast**: 400ms transaction finality
- 💰 **Micropayments**: 0.01 USDC per access
- 🔒 **Verified**: Dual verification (PayAI facilitator + on-chain)
- 💎 **Wallet Integration**: Phantom wallet support
- 🎨 **Protected Content**: Session-based access with premium content display
- 🔧 **Backend Transaction Building**: Custom architecture avoiding CORS issues
- 🛡️ **Secure**: Non-custodial, HTTP-only cookies, file-level protection

## Tech Stack

- Node.js + Express
- x402 protocol
- PayAI facilitator
- Solana web3.js + SPL Token
- Phantom wallet
- Solana mainnet
- Cookie-based session management

## x402 Payment Flow

1. **Request**: User visits main page
2. **Challenge**: Page shows 402 payment requirement (0.01 USDC)
3. **Wallet Check**: Detects if Phantom wallet installed
4. **Transaction Building**: Backend builds transaction (validates balance, checks ATA)
5. **Payment**: User signs transaction with Phantom wallet
6. **Verification**: Server verifies via facilitator + on-chain with retry logic
7. **Settlement**: One-time access token issued
8. **Session**: Secure session created with HTTP-only cookie
9. **Delivery**: Premium content served at /content with protected files

## Custom Architecture

This implementation uses a **custom backend-driven transaction architecture** that solves common issues with browser-based Solana payments:

- **Backend Transaction Building**: Server constructs transactions to avoid CORS issues with RPC nodes
- **Pre-flight Validation**: Balance checks before user interaction for better UX
- **Automatic ATA Creation**: Handles Associated Token Account creation seamlessly
- **Dual Verification**: PayAI facilitator with on-chain fallback for reliability
- **Session Management**: Secure cookie-based sessions for content access
- **File Protection**: Content files require valid session, can't be direct-linked

📖 **See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation**

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

### Public Endpoints
- `GET /` - Main payment page with wallet integration
- `GET /health` - Health check

### Payment Endpoints
- `POST /api/payment/create-transaction` - Create transaction (backend-built)
- `POST /api/payment/verify` - Verify payment and issue access token

### Protected Endpoints (402 if not paid)
- `GET /content` - Premium content page (redirects to `/` if no valid token)
- `GET /content-files/:filename` - Protected content files (requires valid session)

## Requirements

- Phantom wallet installed
- 0.01 USDC in wallet
- Small amount of SOL for transaction fees (~$0.00025)

## Environment Variables

```env
WALLET_ADDRESS=your_solana_wallet_address
SOLANA_NETWORK=mainnet-beta
FACILITATOR_URL=https://facilitator.payai.network
PORT=10000
```

## Project Structure

```
pay-go/
├── server.js              # Main server with custom transaction building
├── public/
│   ├── index.html         # Payment UI with Phantom wallet integration
│   └── content.html       # Protected premium content page
├── content/
│   └── giphy.gif         # Protected content files
├── ARCHITECTURE.md        # Detailed technical documentation
├── README.md             # This file
└── package.json          # Dependencies
```

## Key Features

### Backend Transaction Building
Unlike standard implementations, this project builds transactions on the server to avoid:
- CORS issues with public RPC nodes
- SPL Token library browser compatibility issues
- Poor error handling for insufficient balances

### Dual Verification
- **Primary**: PayAI facilitator verification
- **Fallback**: On-chain transaction parsing
- **Retry Logic**: 3 attempts with 1s delay for blockchain propagation

### Session-Based Protection
- One-time use payment tokens
- HTTP-only session cookies (XSS protection)
- 5-minute session expiration
- File-level access control

## Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your wallet address

# Run in development
npm start

# Test payment flow
# 1. Visit http://localhost:10000
# 2. Connect Phantom wallet
# 3. Pay 0.01 USDC
# 4. Access premium content
```

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete technical documentation
  - Design philosophy and problem statement
  - Backend transaction building details
  - Dual verification system
  - Session management
  - Security considerations
  - Production recommendations
  - Performance characteristics

## License

MIT
