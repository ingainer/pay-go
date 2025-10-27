# Architecture Documentation

## Overview

This project implements a **custom backend-driven transaction architecture** for x402 protocol payments on Solana. Unlike standard implementations where the frontend handles transaction building, this architecture offloads transaction construction to the backend to solve critical browser limitations.

## Problem Statement

Standard Solana payment implementations face several challenges:
- **CORS Issues**: Public RPC nodes block browser requests
- **Library Compatibility**: SPL Token libraries fail in browser environments
- **Poor UX**: Users discover insufficient balance only after wallet interaction
- **ATA Management**: Complex logic for Associated Token Account creation

**Solution**: Move transaction construction to server while keeping signing on client.

---

## Core Architecture

### 1. Backend Transaction Building

**Endpoint**: `POST /api/payment/create-transaction`

**Flow**:
```
Client (wallet address) → Server validates & builds transaction →
Client signs with wallet → Blockchain confirms → Server verifies
```

**Key Features**:

**Pre-flight Balance Validation**
```javascript
// Check balance BEFORE building transaction
const balance = Number(senderAccount.amount) / Math.pow(10, 6);
if (balance < 0.01) {
  return 400: 'Insufficient USDC balance'
}
```
✅ Users get immediate feedback
✅ No failed transactions
✅ Better error messages

**Automatic ATA Creation**
```javascript
// Check if recipient needs USDC token account
if (!recipientAccountInfo) {
  transaction.add(createAssociatedTokenAccountInstruction(...));
}
```
✅ Handles first-time payments
✅ Single transaction
✅ User doesn't need to understand ATAs

**Server-Side RPC (No CORS)**
```javascript
const connection = new Connection(RPC_URL, 'confirmed');
// Direct RPC access, no browser CORS issues
```

**Transaction Serialization**
```javascript
const serializedTransaction = transaction.serialize({
  requireAllSignatures: false,
  verifySignatures: false
}).toString('base64');
```
✅ Client only signs
✅ Private keys never leave browser
✅ Non-custodial security maintained

---

### 2. Dual Verification System

**Primary: PayAI Facilitator**
```javascript
await fetch(`${FACILITATOR_URL}/verify`, {
  method: 'POST',
  body: JSON.stringify({
    signature, recipient, amount: '0.01', currency: 'USDC'
  })
});
```

**Fallback: On-Chain Verification**
```javascript
// Parse transaction token balances
const change = postBalance.amount - preBalance.amount;
if (change >= expectedAmount * 0.99) {
  recipientReceived = true; // Payment verified
}
```

**Retry Logic**
```javascript
// Wait for blockchain propagation
for (let i = 0; i < 3; i++) {
  tx = await connection.getTransaction(signature);
  if (tx) break;
  await sleep(1000);
}
```

**Why Dual Verification?**
- Reliability: Works if facilitator is down
- Trust: Verify independently on blockchain
- Resilience: Multiple verification methods

---

### 3. Session-Based Content Protection

**Flow**:
```
Payment Verified → One-time token → Client redirects /content?token=xyz →
Server validates & creates session → HTTP-only cookie → Content accessed
```

**Token Generation**
```javascript
const validTokens = new Set();

function generatePaymentToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Auto-expire after 5 minutes
setTimeout(() => validTokens.delete(token), 5 * 60 * 1000);
```

**Session Management**
```javascript
const activeSessions = new Map();

activeSessions.set(sessionToken, {
  createdAt: Date.now(),
  expiresAt: Date.now() + (5 * 60 * 1000)
});

res.cookie('session_token', sessionToken, {
  httpOnly: true,  // XSS protection
  maxAge: 5 * 60 * 1000
});
```

**Content File Protection**
```javascript
app.get('/content-files/:filename', (req, res) => {
  const sessionToken = req.cookies?.session_token;

  if (!sessionToken || !activeSessions.has(sessionToken)) {
    return res.status(402).send('Payment Required');
  }

  if (Date.now() > session.expiresAt) {
    return res.status(402).send('Session Expired');
  }

  res.sendFile(path.join(__dirname, 'content', filename));
});
```

**Security**:
- ✅ One-time use tokens (consumed after first use)
- ✅ Session expiration (5 minutes)
- ✅ HTTP-only cookies (XSS protection)
- ✅ File-level protection (can't direct link to content)

---

## Complete Payment Flow

```
1. USER VISITS → GET / (payment UI)

2. USER CONNECTS WALLET → Frontend detects Phantom

3. TRANSACTION CREATION → POST /api/payment/create-transaction
   Backend: validates balance → checks ATA → builds transaction → serializes

4. USER SIGNS → Phantom prompts → user approves → signature generated

5. TRANSACTION SUBMITTED → Phantom submits to Solana (~400ms)

6. PAYMENT VERIFICATION → POST /api/payment/verify
   Backend: fetches tx (retry 3x) → verifies facilitator →
   verifies on-chain → generates token

7. CONTENT ACCESS → GET /content?token=xyz
   Backend: validates token → creates session → sets cookie → serves page

8. CONTENT FILES → GET /content-files/giphy.gif
   Backend: validates session → serves protected file
```

---

## Comparison with Standard x402

| Feature | Standard x402 | This Implementation |
|---------|--------------|---------------------|
| Transaction building | Frontend ❌ (CORS) | Backend ✅ |
| Balance validation | After wallet prompt | Before transaction |
| ATA creation | Manual/complex | Automatic |
| RPC access | Browser (CORS issues) | Server (no CORS) |
| Verification | Single source | Dual (facilitator + on-chain) |
| Content protection | Basic token | Session + file-level |
| Error handling | Limited | Comprehensive |

---

## Technical Decisions

### Why Backend Transaction Building?

**Problem**: Frontend CORS
```javascript
// Frontend attempting RPC
fetch('https://api.mainnet-beta.solana.com', {...})
// ❌ Blocked by CORS
```

**Solution**: Backend RPC
```javascript
// Backend makes call
const connection = new Connection(RPC_URL);
// ✅ Works perfectly
```

### Why Dual Verification?

- **Reliability**: Facilitator down? Use on-chain
- **Trust**: Independent verification
- **Compliance**: Cryptographically provable payments

### Why Session Cookies?

- **Security**: HTTP-only prevents XSS
- **Simplicity**: Browser handles automatically
- **Natural**: Works with images/media

---

## Security Considerations

### Protected:
✅ Private keys never leave browser
✅ Cryptographically random tokens
✅ HTTP-only cookies (XSS protection)
✅ Token expiration (5 min)
✅ One-time use tokens
✅ On-chain verification
✅ File-level protection

### Production Improvements:
⚠️ Use Redis (not in-memory storage)
⚠️ Add rate limiting
⚠️ Enforce HTTPS
⚠️ Add session cleanup
⚠️ Use private RPC provider
⚠️ Add monitoring/logging

---

## Production Recommendations

### 1. Redis for Token Storage
```javascript
await redis.setex(`token:${token}`, 300, 'valid');
const exists = await redis.exists(`token:${token}`);
```

### 2. Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### 3. Private RPC Provider
```javascript
const connection = new Connection(
  process.env.HELIUS_RPC_URL || process.env.QUICKNODE_RPC_URL
);
```

### 4. Database for Sessions
```sql
CREATE TABLE sessions (
  token VARCHAR(64) PRIMARY KEY,
  wallet_address VARCHAR(44),
  expires_at TIMESTAMP,
  consumed BOOLEAN DEFAULT FALSE
);
```

---

## Performance

| Operation | Time |
|-----------|------|
| Transaction creation | 500-1000ms |
| Payment verification | 1500-3000ms |
| Content access | 50-100ms |

---

## Error Handling

### Transaction Creation
- No USDC account → `400: Insufficient balance (no account)`
- Low balance → `400: Insufficient USDC balance: ${balance}`
- RPC error → `500: Transaction creation failed`

### Verification
- TX not found → `400: Transaction not found after retries`
- TX failed → `400: Transaction failed on blockchain`
- Amount mismatch → `400: Payment amount doesn't match`

### Access
- No token → `302: redirect to /`
- Invalid token → `302: redirect to /`
- No session → `402: Payment Required`
- Expired session → `402: Session Expired`

---

## Future Enhancements

1. **Subscription Model** - Monthly access with expiration dates
2. **Usage Metering** - Track per-wallet usage
3. **Dynamic Pricing** - Different prices per content type
4. **Refund System** - Send USDC back for cancellations
5. **Multi-Currency** - Support USDC, USDT, SOL

---

## Conclusion

This architecture prioritizes:

1. **Developer Experience**: Avoid CORS/library issues
2. **User Experience**: Fast feedback, clear errors
3. **Security**: Non-custodial, verified on-chain
4. **Reliability**: Dual verification, retry logic
5. **Simplicity**: Clear separation of concerns

The backend transaction building pattern is **not standard x402**, but solves real-world problems that make frontend-only implementations difficult. This approach maintains security guarantees while providing better DX and UX.

---

## References

- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token](https://spl.solana.com/token)
- [x402 Protocol](https://docs.payai.network)
- [PayAI Facilitator](https://facilitator.payai.network)

## License

MIT
