# Quick Start Guide

Get your Solana USDC payment gateway up and running in minutes!

## 🚀 One-Command Deployment

```bash
./deploy.sh YOUR_SOLANA_WALLET_ADDRESS vercel
```

Replace `YOUR_SOLANA_WALLET_ADDRESS` with your actual Solana wallet address.

## 📋 Prerequisites

1. **Solana Wallet Address** - Where you'll receive payments
   - Example: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
   - Get one at: [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/)

2. **Node.js & npm** - Already installed ✅

3. **Account on deployment platform**:
   - [Vercel](https://vercel.com) (Recommended)
   - [Railway](https://railway.app)
   - [Render](https://render.com)

## 🎯 Deployment Options

### Option 1: Vercel (Fastest)

```bash
# Deploy in one command
./deploy.sh YOUR_WALLET_ADDRESS vercel

# Or manually
vercel login
echo "YOUR_WALLET_ADDRESS" | vercel env add ADDRESS production
vercel --prod
```

### Option 2: Railway (Easiest)

```bash
# Deploy in one command
./deploy.sh YOUR_WALLET_ADDRESS railway

# Or manually
railway login
railway init
railway variables set ADDRESS=YOUR_WALLET_ADDRESS
railway up
railway domain
```

### Option 3: Render (Most Features)

```bash
# Setup for Render
./deploy.sh YOUR_WALLET_ADDRESS render

# Then follow the on-screen instructions
```

## 🧪 Test Locally First

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set your wallet address
echo "ADDRESS=YOUR_WALLET_ADDRESS" > .env

# 3. Run the app
python main.py

# 4. Visit http://localhost:8000
```

## 🎨 What You Get

- **Payment Page** (`/`) - Beautiful UI with "Pay Now" button
- **Payment API** (`/api/payment/initiate`) - Protected by x402 protocol
- **Success Page** (`/home/content`) - Shows after successful payment
- **Health Check** (`/health`) - For monitoring

## 💳 Payment Flow

1. User visits your site
2. Clicks "Pay Now" (0.01 USDC)
3. Completes Solana payment
4. Redirected to premium content

## 🔧 Configuration

Edit `main.py` line 44 to change the price:

```python
@require_payment(
    path="/api/payment/initiate",
    price=0.01,  # Change this value
    recipient=RECIPIENT_ADDRESS,
    network=NETWORK,
    token=USDC_TOKEN_ADDRESS,
    facilitator_url=FACILITATOR_URL
)
```

## 📊 Monitoring

Check your deployment health:
```bash
curl https://your-app.vercel.app/health
```

Response:
```json
{
  "status": "healthy",
  "network": "solana-mainnet",
  "recipient": "7xKXtg2C...osgAsU"
}
```

## ❓ Troubleshooting

### "ADDRESS environment variable must be set"
- Make sure you set the ADDRESS environment variable on your platform
- For local testing, create a `.env` file with `ADDRESS=your_wallet_address`

### Payment not processing
- Verify your wallet address is correct (32-44 characters)
- Ensure you're using mainnet USDC token address
- Check x402 facilitator is accessible

### Deployment failed
- Ensure all files are committed to git
- Check platform-specific logs for errors
- Verify requirements.txt is present

## 🆘 Need Help?

1. **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides
2. **Code**: Review [README.md](./README.md) for technical details
3. **x402 Protocol**: Visit [docs.payai.network](https://docs.payai.network)

## 🎉 Success Checklist

- [ ] Deployed to platform
- [ ] Set ADDRESS environment variable
- [ ] Visited deployment URL
- [ ] Clicked "Pay Now" button
- [ ] Payment flow initiated
- [ ] Received payment in wallet
- [ ] Redirected to `/home/content`

## 📈 Next Steps

After successful deployment:

1. **Test thoroughly** - Try the payment flow multiple times
2. **Monitor wallet** - Watch for incoming USDC payments
3. **Customize content** - Edit `templates/content.html` for your use case
4. **Add analytics** - Track conversions and payments
5. **Scale pricing** - Adjust payment amounts based on your needs

## 🌟 Pro Tips

- Start with testnet/devnet before going to mainnet
- Use a dedicated wallet for receiving payments
- Monitor transaction fees and adjust pricing accordingly
- Consider implementing user authentication
- Add a database to track payment history

## 📞 Support

If you run into issues:
- Check the health endpoint first
- Review application logs on your platform
- Verify environment variables are set correctly
- Test with a small payment amount first

---

**Ready to go?** Run:
```bash
./deploy.sh YOUR_WALLET_ADDRESS vercel
```

Your payment gateway will be live in under 2 minutes! 🚀
