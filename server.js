require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC on Solana mainnet

if (!WALLET_ADDRESS) {
  throw new Error('WALLET_ADDRESS environment variable is required');
}

console.log('🚀 Server Configuration:');
console.log('📍 Wallet:', WALLET_ADDRESS.substring(0, 8) + '...' + WALLET_ADDRESS.substring(WALLET_ADDRESS.length - 8));
console.log('🌐 Network:', SOLANA_NETWORK);
console.log('💰 Payment: 0.01 USDC');

// Store valid payment tokens (in production, use Redis or database)
const validTokens = new Set();

// Generate secure token
function generatePaymentToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Protected success page - requires valid payment token
app.get('/success', (req, res) => {
  const token = req.query.token;

  // Check if token is valid
  if (!token || !validTokens.has(token)) {
    // Redirect to payment page if no valid token
    return res.redirect('/?error=payment_required');
  }

  // Token is valid, consume it (one-time use)
  validTokens.delete(token);

  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Payment initiation endpoint
app.post('/api/payment/initiate', async (req, res) => {
  try {
    // Return 402 Payment Required with Solana payment details
    res.status(402).json({
      error: 'Payment Required',
      message: 'Please complete payment to access this resource',
      paymentDetails: {
        amount: '0.01',
        currency: 'USDC',
        network: SOLANA_NETWORK,
        recipient: WALLET_ADDRESS,
        mint: USDC_MINT,
        facilitator: FACILITATOR_URL
      },
      // Instructions for payment
      instructions: {
        step1: 'Connect your Solana wallet (Phantom, Solflare, etc.)',
        step2: 'Send 0.01 USDC to the recipient address',
        step3: 'Submit your transaction signature below'
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// Payment verification endpoint
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { signature, walletAddress } = req.body;

    if (!signature || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Signature and wallet address are required'
      });
    }

    // In production, verify the transaction on Solana blockchain
    // For now, we'll accept the signature and generate a token
    // TODO: Implement actual on-chain verification using @solana/web3.js

    console.log('📝 Payment verification request:');
    console.log('  Signature:', signature.substring(0, 20) + '...');
    console.log('  From:', walletAddress);

    // Generate one-time token for accessing success page
    const token = generatePaymentToken();
    validTokens.add(token);

    // Token expires after 5 minutes
    setTimeout(() => {
      validTokens.delete(token);
    }, 5 * 60 * 1000);

    res.json({
      status: 'success',
      message: 'Payment verified',
      token: token,
      redirectUrl: `/success?token=${token}`
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Demo payment endpoint (for testing - REMOVE IN PRODUCTION)
app.post('/api/payment/demo', (req, res) => {
  // Generate token for demo/testing purposes
  const token = generatePaymentToken();
  validTokens.add(token);

  setTimeout(() => {
    validTokens.delete(token);
  }, 5 * 60 * 1000);

  res.json({
    status: 'success',
    message: 'Demo payment completed',
    token: token,
    redirectUrl: `/success?token=${token}`,
    note: 'This is a demo endpoint for testing. Remove in production.'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'pay-go-solana',
    network: SOLANA_NETWORK,
    wallet: WALLET_ADDRESS.substring(0, 8) + '...' + WALLET_ADDRESS.substring(WALLET_ADDRESS.length - 8),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Visit: http://localhost:${PORT}`);
  console.log(`💳 Payment amount: 0.01 USDC`);
  console.log(`🔐 Success page protected with token verification`);
});
