require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const { X402PaymentHandler, usdToMicroUsdc } = require('@payai/x402-solana');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
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

// Initialize X402 Payment Handler
const x402Handler = new X402PaymentHandler({
  facilitatorUrl: FACILITATOR_URL,
  recipient: WALLET_ADDRESS,
  network: SOLANA_NETWORK === 'mainnet-beta' ? 'solana' : 'solana-devnet'
});

console.log('✅ X402 Payment Handler initialized');

// Store valid payment tokens (in production, use Redis or database)
const validTokens = new Set();

// Generate secure token
function generatePaymentToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Routes
app.get('/', (req, res) => {
  // Main page - always accessible, shows payment UI
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store active sessions (token -> session data)
const activeSessions = new Map();

// Protected content page - returns 402 if not paid
app.get('/content', async (req, res) => {
  try {
    // Extract payment header
    const paymentHeader = x402Handler.extractPayment(req.headers);

    // Create payment requirements
    const paymentRequirements = await x402Handler.createPaymentRequirements({
      price: {
        amount: usdToMicroUsdc(0.01), // 0.01 USDC
        asset: {
          address: USDC_MINT
        }
      },
      network: SOLANA_NETWORK === 'mainnet-beta' ? 'solana' : 'solana-devnet',
      config: {
        description: 'Premium Content Access',
        resource: `${req.protocol}://${req.get('host')}/content`
      }
    });

    // If no payment header, return 402 with payment requirements
    if (!paymentHeader) {
      const response402 = x402Handler.create402Response(paymentRequirements);
      return res.status(response402.status).json(response402.body);
    }

    // Verify payment
    const verified = await x402Handler.verifyPayment(paymentHeader, paymentRequirements);

    if (!verified) {
      console.log('⚠️ Payment verification failed');
      const response402 = x402Handler.create402Response(paymentRequirements);
      return res.status(response402.status).json(response402.body);
    }

    console.log('✅ Payment verified successfully via x402');

    // Create session token for accessing content files
    const sessionToken = generatePaymentToken();
    activeSessions.set(sessionToken, {
      createdAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    });

    // Set session cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000 // 5 minutes
    });

    // Return premium content page
    res.sendFile(path.join(__dirname, 'public', 'content.html'));

  } catch (error) {
    console.error('❌ Content access error:', error);
    res.status(500).json({ error: 'Failed to process content request', message: error.message });
  }
});

// Protected content files - requires valid session
app.get('/content-files/:filename', (req, res) => {
  const sessionToken = req.cookies?.session_token;

  // Check if session is valid
  if (!sessionToken || !activeSessions.has(sessionToken)) {
    return res.status(402).send('Payment Required');
  }

  const session = activeSessions.get(sessionToken);

  // Check if session expired
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionToken);
    return res.status(402).send('Session Expired - Payment Required');
  }

  // Serve the protected file
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'content', filename));
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
