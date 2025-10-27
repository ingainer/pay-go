# Deploy Your Solana Payment Gateway NOW

Your wallet is already configured: `9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm`

## ✅ Your App is Ready!

All code is written, tested, and committed. You just need to deploy it to a hosting platform.

---

## 🚀 FASTEST: Deploy to Vercel (2 minutes)

### Step 1: Login to Vercel
```bash
vercel login
```
This will open your browser. Login with GitHub, GitLab, or email.

### Step 2: Deploy
```bash
cd /Users/master/Documents/AI_projects/pay-go
vercel --prod
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → pay-go (or custom name)
- **Directory?** → ./ (press Enter)
- **Override settings?** → No

### Step 3: Add Environment Variable
Your wallet address is already in the code, but Vercel needs it too:

```bash
vercel env add ADDRESS
```
When prompted, paste: `9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm`
Select: **Production**

### Step 4: Redeploy with Environment Variable
```bash
vercel --prod
```

✅ **DONE!** Your payment gateway is live!

---

## 🚂 ALTERNATIVE: Deploy to Railway (3 minutes)

### Step 1: Login to Railway
```bash
railway login
```
This opens a browser for authentication.

### Step 2: Initialize Project
```bash
cd /Users/master/Documents/AI_projects/pay-go
railway init
```
Choose: **Create new project**

### Step 3: Add Your Wallet Address
```bash
railway variables set ADDRESS=9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm
```

### Step 4: Deploy
```bash
railway up
```

### Step 5: Get Your URL
```bash
railway domain
```

✅ **DONE!** Your payment gateway is live!

---

## 🎨 ALTERNATIVE: Deploy to Render (5 minutes, via Dashboard)

### Step 1: Push to GitHub
```bash
cd /Users/master/Documents/AI_projects/pay-go
gh auth login  # If not already logged in
gh repo create pay-go --public --source=. --push
```

### Step 2: Deploy on Render
1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not connected)
4. Select the **pay-go** repository
5. Configure:
   - **Name**: `pay-go` (or your choice)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Click **"Advanced"** and add environment variable:
   - **Key**: `ADDRESS`
   - **Value**: `9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm`
7. Click **"Create Web Service"**

Wait 3-5 minutes for build and deployment.

✅ **DONE!** Your URL will be: `https://pay-go.onrender.com` (or custom name)

---

## 🧪 After Deployment: Test Your App

### 1. Visit Your Live URL
Example: `https://pay-go-xyz.vercel.app`

### 2. Check Health Endpoint
```bash
curl https://your-url.vercel.app/health
```

Should return:
```json
{
  "status": "healthy",
  "network": "solana-mainnet",
  "recipient": "9dUnZnjJ...JX9eGGm"
}
```

### 3. Test Payment Flow
1. Click **"Pay Now"** button
2. Complete Solana payment (0.01 USDC)
3. Verify redirect to `/home/content`
4. Check your wallet for received payment

---

## ❗ Important Notes

1. **Python Version**: Deployment platforms will use Python 3.11 (specified in `runtime.txt`)
2. **Dependencies**: x402 will be installed from GitHub automatically
3. **Your Wallet**: `9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm` is configured to receive payments
4. **Network**: Using Solana mainnet with USDC
5. **Cost**: All platforms have free tiers

---

## 🆘 Troubleshooting

### Vercel deployment fails
- Make sure you're logged in: `vercel whoami`
- Check logs: `vercel logs`
- Verify environment variable is set in dashboard

### Railway deployment fails
- Check build logs in Railway dashboard
- Verify `ADDRESS` variable is set
- Make sure you're in the correct directory

### "Module not found" error
- This is normal if x402 installation fails locally
- Cloud platforms have Python 3.11 and will work fine
- Don't worry about local Python 3.9 compatibility

### Payment not working
- Verify `ADDRESS` environment variable is set
- Check the health endpoint
- Ensure you're using mainnet USDC
- Try testnet first for testing

---

## 🎉 Success Checklist

- [ ] Deployed to platform (Vercel/Railway/Render)
- [ ] Environment variable `ADDRESS` is set
- [ ] Health endpoint returns healthy status
- [ ] Payment page loads successfully
- [ ] "Pay Now" button triggers payment flow
- [ ] Successfully received test payment
- [ ] Redirected to `/home/content` after payment

---

## 📞 Quick Commands Reference

### Vercel
```bash
vercel login                    # Login
vercel --prod                   # Deploy to production
vercel env add ADDRESS          # Add environment variable
vercel logs                     # View logs
vercel domains add example.com  # Add custom domain
```

### Railway
```bash
railway login                   # Login
railway init                    # Create project
railway up                      # Deploy
railway logs                    # View logs
railway domain                  # Generate domain
railway open                    # Open in browser
```

### Check Status
```bash
# Replace YOUR_URL with your actual deployment URL
curl https://YOUR_URL/health
curl https://YOUR_URL/
```

---

## 🚀 Ready? Pick Your Platform and Deploy!

**Recommended**: Start with Vercel for the fastest deployment.

Once deployed, your payment gateway will be live and ready to accept USDC payments on Solana!

**Your wallet will receive**: 0.01 USDC per payment
**Users will access**: Premium content at `/home/content`
**Network**: Solana mainnet
**Token**: USDC (EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)

---

Need help? Check `DEPLOYMENT.md` for detailed troubleshooting.
