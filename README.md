# Solana USDC Payment Gateway

A production-ready payment page that integrates Solana payments via USDC using the x402 protocol. This application features a clean payment interface with a Pay button that charges 0.01 USDC and redirects to premium content upon successful payment.

## 🚀 One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ingainer/pay-go)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?referralCode=pay-go)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ingainer/pay-go&env=ADDRESS&envDescription=Your%20Solana%20wallet%20address&envLink=https://github.com/ingainer/pay-go#configuration)

## Features

- 💎 **Solana USDC Payments**: Accept USDC payments on Solana blockchain
- ⚡ **Fast Transactions**: Near-instant payment confirmation
- 🔒 **Secure**: Protected by x402 protocol and blockchain cryptography
- 🎨 **Modern UI**: Beautiful, responsive payment interface
- 🚀 **Production Ready**: Configured for easy deployment to Vercel

## Tech Stack

- **Backend**: FastAPI (Python)
- **Payment Protocol**: x402
- **Blockchain**: Solana
- **Token**: USDC (EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
- **Deployment**: Vercel

## Project Structure

```
pay-go/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel deployment configuration
├── .env.example           # Environment variables template
├── templates/
│   ├── payment.html       # Payment page
│   └── content.html       # Success/content page
└── README.md
```

## Setup

### Prerequisites

- Python 3.9+
- Solana wallet address (to receive payments)
- Vercel account (for deployment)

### Local Development

1. **Clone and navigate to the project**:
   ```bash
   cd pay-go
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Solana wallet address:
   ```
   ADDRESS=your_solana_wallet_address_here
   ```

4. **Run the application**:
   ```bash
   python main.py
   ```

5. **Open browser**:
   Visit `http://localhost:8000`

## Deployment to Vercel

### Option 1: Deploy with Vercel CLI (Autonomous)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set environment variable**:
   ```bash
   vercel env add ADDRESS
   ```
   Paste your Solana wallet address when prompted.

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Initialize git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Solana USDC payment gateway"
   ```

2. **Create GitHub repository** and push:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

3. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `ADDRESS` = your Solana wallet address
   - Deploy

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADDRESS` | Your Solana wallet address (required) | - |
| `FACILITATOR_URL` | PayAI facilitator endpoint | `https://facilitator.payai.network` |
| `USDC_TOKEN_ADDRESS` | Solana USDC token address | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `NETWORK` | Solana network | `solana-mainnet` |

### Payment Configuration

The payment amount is set to **0.01 USDC** in `main.py:35`:

```python
@require_payment(
    path="/api/payment/initiate",
    price=0.01,  # Modify this value to change payment amount
    recipient=RECIPIENT_ADDRESS,
    network=NETWORK,
    token=USDC_TOKEN_ADDRESS,
    facilitator_url=FACILITATOR_URL
)
```

## API Endpoints

- `GET /` - Payment page
- `GET /api/payment/initiate` - Initiates payment (protected by x402)
- `GET /home/content` - Success page with premium content
- `GET /health` - Health check endpoint

## How It Works

1. User visits the payment page (`/`)
2. User clicks "Pay Now" button
3. Frontend calls `/api/payment/initiate`
4. x402 middleware intercepts the request
5. If payment not received, returns 402 Payment Required
6. User completes payment via Solana wallet
7. After payment confirmation, request proceeds
8. User is redirected to `/home/content`

## Testing

For testing on devnet:

1. Change `NETWORK` to `solana-devnet`
2. Update `USDC_TOKEN_ADDRESS` to devnet USDC token
3. Use a devnet Solana wallet with test USDC

## Security Considerations

- Never commit `.env` file (it's in `.gitignore`)
- Store wallet address securely in Vercel environment variables
- Use mainnet only for production
- Monitor wallet for incoming payments
- Consider implementing rate limiting for production use

## Resources

- [x402 Protocol Documentation](https://docs.payai.network/x402/introduction)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Vercel Deployment Docs](https://vercel.com/docs)

## Support

For issues with:
- x402 protocol: Visit [PayAI Discord](https://docs.payai.network)
- Deployment: Check [Vercel Support](https://vercel.com/support)
- This implementation: Open an issue in the repository

## License

MIT License - feel free to use this for your own projects!
