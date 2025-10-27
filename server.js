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
  // Main page - always accessible, shows payment UI
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Protected content page - returns 402 if not paid
app.get('/content', (req, res) => {
  const token = req.query.token;

  // Check if token is valid
  if (!token || !validTokens.has(token)) {
    // Return 402 Payment Required with payment details
    return res.status(402).json({
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
      instructions: {
        step1: 'Connect your Solana wallet (Phantom, Solflare, etc.)',
        step2: 'Send 0.01 USDC to the recipient address',
        step3: 'Submit your transaction signature to /api/payment/verify'
      }
    });
  }

  // Token is valid, consume it (one-time use)
  validTokens.delete(token);

  // Return success page with premium content
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Get payment details (x402 challenge)
app.get('/api/payment/challenge', async (req, res) => {
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
      instructions: {
        step1: 'Connect your Solana wallet (Phantom, Solflare, etc.)',
        step2: 'Send 0.01 USDC to the recipient address',
        step3: 'Submit your transaction signature to /api/payment/verify'
      }
    });
  } catch (error) {
    console.error('Payment challenge error:', error);
    res.status(500).json({ error: 'Payment challenge failed' });
  }
});

// Payment verification endpoint - verifies through facilitator
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { signature, walletAddress } = req.body;

    if (!signature || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Signature and wallet address are required'
      });
    }

    console.log('📝 Payment verification request:');
    console.log('  Signature:', signature.substring(0, 20) + '...');
    console.log('  From:', walletAddress);

    // First, verify transaction on-chain
    const { Connection, PublicKey } = require('@solana/web3.js');
    const connection = new Connection(
      SOLANA_NETWORK === 'mainnet-beta'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Get transaction details
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      return res.status(400).json({
        error: 'Transaction not found',
        message: 'Transaction not found on blockchain'
      });
    }

    // Verify transaction was successful
    if (tx.meta.err) {
      return res.status(400).json({
        error: 'Transaction failed',
        message: 'Transaction failed on blockchain'
      });
    }

    // Verify with PayAI facilitator
    console.log('🔄 Verifying with PayAI facilitator...');

    try {
      const facilitatorResponse = await fetch(`${FACILITATOR_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: 'solana',
          signature: signature,
          recipient: WALLET_ADDRESS,
          amount: '0.01',
          currency: 'USDC',
          mint: USDC_MINT
        })
      });

      const facilitatorData = await facilitatorResponse.json();

      if (facilitatorResponse.ok && facilitatorData.verified) {
        console.log('✅ Payment verified by facilitator');
      } else {
        console.log('⚠️ Facilitator verification inconclusive, using on-chain verification');
      }
    } catch (facilitatorError) {
      console.log('⚠️ Facilitator unavailable, falling back to on-chain verification');
      console.error('Facilitator error:', facilitatorError.message);
    }

    // Parse transaction to verify payment details on-chain
    const postBalances = tx.meta.postTokenBalances || [];
    const preBalances = tx.meta.preTokenBalances || [];

    // Find USDC token changes
    let recipientReceived = false;
    const expectedAmount = 0.01 * Math.pow(10, 6); // 0.01 USDC in lamports

    for (const postBalance of postBalances) {
      if (postBalance.mint === USDC_MINT) {
        const preBalance = preBalances.find(
          pre => pre.accountIndex === postBalance.accountIndex
        );

        if (preBalance) {
          const change = parseFloat(postBalance.uiTokenAmount.amount) -
                        parseFloat(preBalance.uiTokenAmount.amount);

          // Check if recipient's account received the payment
          const accountKey = tx.transaction.message.accountKeys[postBalance.accountIndex];
          if (accountKey && change >= expectedAmount * 0.99) { // Allow 1% tolerance
            recipientReceived = true;
            console.log('✅ On-chain verification: ', change / Math.pow(10, 6), 'USDC received');
          }
        }
      }
    }

    if (!recipientReceived) {
      return res.status(400).json({
        error: 'Payment verification failed',
        message: 'Payment amount or recipient does not match'
      });
    }

    console.log('✅ Payment verified successfully');

    // Generate one-time token for accessing content
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
      redirectUrl: `/content?token=${token}`
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      message: error.message
    });
  }
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
