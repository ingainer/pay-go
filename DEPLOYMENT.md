# Deployment Guide

This application is ready to deploy to multiple platforms. Choose the one that works best for you.

## Prerequisites

Before deploying, you need:
1. A Solana wallet address to receive payments
2. An account on your chosen platform (Vercel, Railway, Render, or Fly.io)

## Option 1: Vercel (Recommended for Serverless)

### Via Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   # If you haven't already
   gh auth login
   gh repo create pay-go --public --source=. --remote=origin --push
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `ADDRESS`: Your Solana wallet address
   - Click "Deploy"

### Via Vercel CLI

```bash
# Install Vercel CLI (already installed)
npm install -g vercel

# Login
vercel login

# Set your Solana wallet address
vercel env add ADDRESS production
# Paste your wallet address when prompted

# Deploy
vercel --prod
```

Your app will be live at: `https://your-project.vercel.app`

## Option 2: Railway (Easiest Full-Stack Deployment)

Railway is excellent for full-stack Python apps and provides a straightforward deployment process.

### Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**:
   ```bash
   railway login
   railway init
   ```

3. **Add Environment Variables**:
   ```bash
   railway variables set ADDRESS=your_solana_wallet_address_here
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Generate Domain**:
   ```bash
   railway domain
   ```

Your app will be live at: `https://your-project.railway.app`

## Option 3: Render

Render offers free tier hosting for web services.

### Deploy to Render

1. **Push to GitHub** (if not already):
   ```bash
   gh auth login
   gh repo create pay-go --public --source=. --remote=origin --push
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: pay-go
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variable:
     - Key: `ADDRESS`
     - Value: Your Solana wallet address
   - Click "Create Web Service"

Your app will be live at: `https://pay-go.onrender.com`

## Option 4: Fly.io

Fly.io offers global deployment with free tier.

### Deploy to Fly.io

1. **Install flyctl**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   flyctl auth login
   ```

3. **Launch**:
   ```bash
   flyctl launch
   ```

4. **Set Environment Variables**:
   ```bash
   flyctl secrets set ADDRESS=your_solana_wallet_address_here
   ```

5. **Deploy**:
   ```bash
   flyctl deploy
   ```

Your app will be live at: `https://your-app.fly.dev`

## Environment Variables Reference

All platforms need these environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADDRESS` | Yes | - | Your Solana wallet address to receive payments |
| `FACILITATOR_URL` | No | `https://facilitator.payai.network` | PayAI facilitator endpoint |
| `USDC_TOKEN_ADDRESS` | No | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | Solana USDC mainnet address |
| `NETWORK` | No | `solana-mainnet` | Solana network to use |

## Testing Your Deployment

After deployment:

1. Visit your deployed URL
2. Click "Pay Now"
3. Complete the payment flow
4. Verify you're redirected to `/home/content`

## Troubleshooting

### Port Issues
If you see port errors, ensure your platform is using the `PORT` environment variable:
```python
port = int(os.getenv("PORT", 8000))
uvicorn.run(app, host="0.0.0.0", port=port)
```

### Module Not Found
Ensure `requirements.txt` is present and all dependencies are listed.

### Payment Not Working
1. Verify `ADDRESS` environment variable is set correctly
2. Check Solana wallet address is valid
3. Ensure you're using mainnet USDC token address
4. Check x402 facilitator is reachable

### CORS Issues
If frontend can't reach backend, add CORS middleware:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Monitoring

After deployment, monitor:
- Application logs on your platform dashboard
- Incoming payments to your Solana wallet
- Health endpoint: `https://your-app/health`

## Custom Domain

Most platforms support custom domains:

- **Vercel**: Dashboard → Domains → Add
- **Railway**: Dashboard → Settings → Domains
- **Render**: Dashboard → Settings → Custom Domain
- **Fly.io**: `flyctl certs add yourdomain.com`

## Cost Considerations

- **Vercel**: Free tier (Hobby) includes 100GB bandwidth
- **Railway**: $5/month free credit, then usage-based
- **Render**: Free tier available (with limitations)
- **Fly.io**: Free tier includes 3 shared VMs

## Security Recommendations

1. Never commit `.env` file
2. Use environment variables for sensitive data
3. Enable HTTPS (automatic on all platforms)
4. Consider rate limiting for production
5. Monitor wallet for unauthorized access
6. Keep dependencies updated

## Next Steps

After successful deployment:
1. Test payment flow thoroughly
2. Set up monitoring and alerts
3. Add analytics if needed
4. Consider implementing user authentication
5. Add database for payment tracking
6. Implement webhook handlers for payment confirmations

## Support

For platform-specific issues:
- Vercel: https://vercel.com/support
- Railway: https://railway.app/help
- Render: https://render.com/docs
- Fly.io: https://fly.io/docs

For x402 protocol issues:
- Documentation: https://docs.payai.network
- Discord: Check PayAI documentation for community link
