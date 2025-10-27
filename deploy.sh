#!/bin/bash

# Deployment Script for Solana USDC Payment Gateway
# This script helps you deploy to your chosen platform

set -e

echo "🚀 Solana USDC Payment Gateway Deployment"
echo "=========================================="
echo ""

# Check if ADDRESS is set
if [ -z "$1" ]; then
    echo "❌ Error: Solana wallet address required"
    echo ""
    echo "Usage: ./deploy.sh YOUR_SOLANA_WALLET_ADDRESS [platform]"
    echo ""
    echo "Platforms:"
    echo "  - vercel (default)"
    echo "  - railway"
    echo "  - render"
    echo ""
    echo "Example: ./deploy.sh 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU vercel"
    exit 1
fi

ADDRESS=$1
PLATFORM=${2:-vercel}

echo "📍 Wallet Address: $ADDRESS"
echo "🏗️  Platform: $PLATFORM"
echo ""

# Validate Solana address (basic check - 32-44 characters)
if [ ${#ADDRESS} -lt 32 ] || [ ${#ADDRESS} -gt 44 ]; then
    echo "⚠️  Warning: Address length unusual for Solana (should be 32-44 chars)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

case $PLATFORM in
    vercel)
        echo "📦 Deploying to Vercel..."
        echo ""

        # Check if vercel is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi

        # Create .env for local reference
        echo "ADDRESS=$ADDRESS" > .env

        echo "Setting environment variable..."
        echo $ADDRESS | vercel env add ADDRESS production

        echo "Deploying..."
        vercel --prod

        echo ""
        echo "✅ Deployment complete!"
        echo "Your app should be live at the URL shown above."
        ;;

    railway)
        echo "📦 Deploying to Railway..."
        echo ""

        # Check if railway is installed
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi

        # Create .env for local reference
        echo "ADDRESS=$ADDRESS" > .env

        echo "Initializing Railway project..."
        railway init

        echo "Setting environment variable..."
        railway variables set ADDRESS=$ADDRESS

        echo "Deploying..."
        railway up

        echo "Generating domain..."
        railway domain

        echo ""
        echo "✅ Deployment complete!"
        echo "Run 'railway open' to view your deployment."
        ;;

    render)
        echo "📦 Setting up for Render deployment..."
        echo ""

        # Create .env for local reference
        echo "ADDRESS=$ADDRESS" > .env

        # Check if GitHub CLI is available
        if ! command -v gh &> /dev/null; then
            echo "GitHub CLI not found. Installing..."
            echo "Visit: https://cli.github.com/"
            exit 1
        fi

        echo "Creating GitHub repository..."
        gh repo create pay-go --public --source=. --remote=origin --push || echo "Repository might already exist"

        echo ""
        echo "Next steps for Render:"
        echo "1. Go to https://render.com"
        echo "2. Click 'New +' → 'Web Service'"
        echo "3. Connect your GitHub repository"
        echo "4. Set build command: pip install -r requirements.txt"
        echo "5. Set start command: uvicorn main:app --host 0.0.0.0 --port \$PORT"
        echo "6. Add environment variable: ADDRESS=$ADDRESS"
        echo "7. Click 'Create Web Service'"
        ;;

    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Supported platforms: vercel, railway, render"
        exit 1
        ;;
esac

echo ""
echo "📝 Important reminders:"
echo "  - Save your wallet address: $ADDRESS"
echo "  - Test the payment flow thoroughly"
echo "  - Monitor your wallet for incoming payments"
echo "  - Check the health endpoint: /health"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
