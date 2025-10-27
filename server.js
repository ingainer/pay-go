require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

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

if (!WALLET_ADDRESS) {
  throw new Error('WALLET_ADDRESS environment variable is required');
}

console.log('🚀 Server Configuration:');
console.log('📍 Wallet:', WALLET_ADDRESS.substring(0, 8) + '...' + WALLET_ADDRESS.substring(WALLET_ADDRESS.length - 8));
console.log('🌐 Network:', SOLANA_NETWORK);
console.log('💰 Payment: 0.01 USDC');

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Payment endpoint - will be protected by x402
app.get('/api/payment/initiate', async (req, res) => {
  // For now, we'll implement a basic payment check
  // The x402-solana middleware will be added after testing the structure

  const paymentHeader = req.headers['x-payment'];

  if (!paymentHeader) {
    // Return 402 Payment Required
    return res.status(402).json({
      error: 'Payment Required',
      message: 'Please complete payment to access this resource',
      paymentDetails: {
        amount: '0.01',
        currency: 'USDC',
        network: SOLANA_NETWORK,
        recipient: WALLET_ADDRESS
      }
    });
  }

  // Payment verified (will be enhanced with x402-solana)
  res.json({
    status: 'success',
    message: 'Payment received',
    redirect: '/success'
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
});
