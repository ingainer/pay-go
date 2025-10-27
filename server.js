require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

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
app.get('/content', (req, res) => {
  const token = req.query.token;

  // Check if token is valid
  if (!token || !validTokens.has(token)) {
    // Return 402 Payment Required and redirect to payment page
    res.status(402);
    return res.redirect('/');
  }

  // Token is valid, consume it and create session
  validTokens.delete(token);

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

// Create transaction for payment (backend builds transaction)
app.post('/api/payment/create-transaction', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        error: 'Missing wallet address',
        message: 'Wallet address is required'
      });
    }

    console.log('🔵 Creating transaction for wallet:', walletAddress);

    const { Connection, PublicKey, Transaction } = require('@solana/web3.js');
    const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

    // Backend handles RPC connection (no frontend 403 errors)
    const connection = new Connection(
      SOLANA_NETWORK === 'mainnet-beta'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com',
      'confirmed'
    );

    const senderPublicKey = new PublicKey(walletAddress);
    const recipientPublicKey = new PublicKey(WALLET_ADDRESS);
    const usdcMintPublicKey = new PublicKey(USDC_MINT);

    // Get associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      usdcMintPublicKey,
      senderPublicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      usdcMintPublicKey,
      recipientPublicKey
    );

    console.log('🔍 Checking if token accounts exist...');

    // Check if sender's USDC account exists
    const senderAccountInfo = await connection.getAccountInfo(senderTokenAccount);
    const { createAssociatedTokenAccountInstruction, getAccount } = require('@solana/spl-token');

    // Create transaction
    const transaction = new Transaction();
    transaction.feePayer = senderPublicKey;

    // If sender doesn't have USDC account, they have 0 USDC - return error
    if (!senderAccountInfo) {
      console.log('⚠️ Sender does not have USDC token account (balance = 0 USDC)');
      return res.status(400).json({
        error: 'Insufficient USDC balance',
        message: 'You need at least 0.01 USDC to make this payment. Please get USDC first.',
        balance: 0
      });
    }

    // Check sender's USDC balance
    {
      console.log('✅ Sender has USDC token account');

      // Check sender's USDC balance only if account exists
      try {
        const senderAccount = await getAccount(connection, senderTokenAccount);
        const balance = Number(senderAccount.amount) / Math.pow(10, 6);
        console.log(`💰 Sender USDC balance: ${balance} USDC`);

        if (balance < 0.01) {
          return res.status(400).json({
            error: 'Insufficient USDC balance',
            message: `You need at least 0.01 USDC. Current balance: ${balance} USDC`,
            balance: balance
          });
        }
      } catch (error) {
        console.error('❌ Error checking balance:', error.message);
      }
    }

    // Check if recipient needs token account created
    const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
    if (!recipientAccountInfo) {
      console.log('⚠️ Recipient does not have USDC token account, adding create instruction...');
      const createRecipientATAInstruction = createAssociatedTokenAccountInstruction(
        senderPublicKey,          // payer (sender pays for recipient's account)
        recipientTokenAccount,    // associatedToken
        recipientPublicKey,       // owner
        usdcMintPublicKey        // mint
      );
      transaction.add(createRecipientATAInstruction);
      console.log('✅ Added instruction to create recipient USDC token account');
    }

    // Create transfer instruction for 0.01 USDC (10000 microUSDC)
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPublicKey,
      10000, // 0.01 USDC = 10000 with 6 decimals
      [],
      TOKEN_PROGRAM_ID
    );

    transaction.add(transferInstruction);

    // Get recent blockhash (backend RPC, no CORS issues)
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Serialize transaction to send to frontend
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    }).toString('base64');

    console.log('✅ Transaction created successfully');

    res.json({
      status: 'success',
      transaction: serializedTransaction,
      message: 'Transaction ready for signing'
    });

  } catch (error) {
    console.error('❌ Transaction creation error:', error);
    res.status(500).json({
      error: 'Transaction creation failed',
      message: error.message
    });
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

    // Get transaction details with retry logic (blockchain propagation)
    let tx = null;
    let retries = 3;

    for (let i = 0; i < retries; i++) {
      console.log(`🔍 Attempt ${i + 1}/${retries} to fetch transaction...`);
      tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });

      if (tx) {
        console.log('✅ Transaction found on blockchain');
        break;
      }

      if (i < retries - 1) {
        console.log('⏳ Transaction not found yet, waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!tx) {
      console.error('❌ Transaction not found after all retries');
      return res.status(400).json({
        error: 'Transaction not found',
        message: 'Transaction not found on blockchain after multiple attempts. Please try again.'
      });
    }

    // Verify transaction was successful
    if (tx.meta.err) {
      console.error('❌ Transaction failed on-chain:');
      console.error('Error details:', JSON.stringify(tx.meta.err, null, 2));
      console.error('Transaction logs:', tx.meta.logMessages);

      return res.status(400).json({
        error: 'Transaction failed',
        message: 'Transaction failed on blockchain',
        details: tx.meta.err,
        logs: tx.meta.logMessages
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

        let change = 0;

        if (preBalance) {
          // Account existed before - calculate change
          change = parseFloat(postBalance.uiTokenAmount.amount) -
                   parseFloat(preBalance.uiTokenAmount.amount);
        } else {
          // Account was created in this transaction - use post balance as the amount received
          change = parseFloat(postBalance.uiTokenAmount.amount);
          console.log('📝 New account created in transaction, balance:', change / Math.pow(10, 6), 'USDC');
        }

        // Check if this amount matches our expected payment
        if (change >= expectedAmount * 0.99) { // Allow 1% tolerance
          recipientReceived = true;
          console.log('✅ On-chain verification: ', change / Math.pow(10, 6), 'USDC received');
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
