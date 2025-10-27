# Deploy to Render.com - Step by Step

## 🚨 IMPORTANT: Environment Variable Setup

After deploying, you MUST set the `WALLET_ADDRESS` environment variable in Render dashboard.

## Deployment Steps

### Step 1: Push to GitHub (Already Done ✅)

Your code is at: https://github.com/ingainer/pay-go

### Step 2: Connect to Render

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect account"** if you haven't connected GitHub
5. Find and select your repository: **ingainer/pay-go**
6. Click **"Connect"**

### Step 3: Configure Service

Render will auto-detect `render.yaml` but you need to add the wallet address:

**Basic Settings:**
- Name: `pay-go-solana` (auto-filled)
- Environment: `Node` (auto-detected)
- Build Command: `npm install` (from render.yaml)
- Start Command: `node server.js` (from render.yaml)
- Plan: **Free**

### Step 4: Set Environment Variable (CRITICAL!)

**Before clicking "Create Web Service", scroll down to Environment Variables:**

Click **"Add Environment Variable"** and add:

```
Key: WALLET_ADDRESS
Value: 9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm
```

**Other environment variables are auto-configured from render.yaml:**
- `SOLANA_NETWORK`: mainnet-beta
- `FACILITATOR_URL`: https://facilitator.payai.network

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for build and deployment
3. Your app will be live at: `https://pay-go-solana.onrender.com`

## Verify Deployment

### Check Health Endpoint

```bash
curl https://your-app.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "pay-go-solana",
  "network": "mainnet-beta",
  "wallet": "9dUnZnjJ...JX9eGGm",
  "timestamp": "2025-10-27T..."
}
```

### Test Payment Page

Visit: `https://your-app.onrender.com`

You should see the payment page with:
- 0.01 USDC payment
- Solana Mainnet badge
- Pay Now button

## Troubleshooting

### Error: WALLET_ADDRESS environment variable is required

**Solution**: You forgot to add WALLET_ADDRESS in environment variables.

1. Go to your Render dashboard
2. Click on your service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add: `WALLET_ADDRESS` = `9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm`
6. Click **"Save Changes"**
7. Service will auto-redeploy

### Build Failed

Check the logs in Render dashboard. Common issues:
- Missing `package.json` → Should be in repository
- npm install failed → Check dependencies

### App Shows 404

Make sure:
- `public/` folder exists with `index.html` and `success.html`
- All files are pushed to GitHub

## Update Deployment

To update your deployed app:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Render auto-deploys from GitHub (takes 2-3 minutes)

## Alternative: Manual Environment Variable Setup

If you prefer not to use render.yaml:

1. Delete `render.yaml`
2. During Render setup, manually enter all fields:
   - Build Command: `npm install`
   - Start Command: `node server.js`
3. Add ALL environment variables manually:
   - `WALLET_ADDRESS`: 9dUnZnjJJwRUT5NkK2n5SwYqvuht1QRWsg7J8JX9eGGm
   - `SOLANA_NETWORK`: mainnet-beta
   - `FACILITATOR_URL`: https://facilitator.payai.network

## Need Help?

- Render Docs: https://render.com/docs
- Check logs in Render dashboard → Logs tab
- View this repo: https://github.com/ingainer/pay-go
