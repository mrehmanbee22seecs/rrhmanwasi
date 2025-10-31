# Payment Gateway Integration Guide for Pakistan

This guide explains the payment options available for the subscription system and how to set them up.

## Current Implementation

The system currently supports **instant activation** for mobile wallet payments with these methods:

### 1. **JazzCash** (Recommended - Instant Activation ⚡)
- **What it is**: Pakistan's largest mobile wallet service
- **Why it's great**: 
  - Instant payment verification
  - No transaction fees for you
  - Very popular in Pakistan
  - Supports bank transfers and cards
- **Setup**: Update the JazzCash number in `/src/types/payment.ts`
- **User Experience**: User pays → Enters transaction ID → Instant activation

### 2. **Easypaisa** (Recommended - Instant Activation ⚡)
- **What it is**: Major mobile wallet in Pakistan
- **Why it's great**:
  - Instant payment verification
  - No transaction fees for you
  - Very trusted by Pakistani users
- **Setup**: Already configured with number `03349682146`
- **User Experience**: User pays → Enters transaction ID → Instant activation

### 3. **Bank Transfer** (Manual Verification)
- **What it is**: Direct bank transfer
- **Processing Time**: 1-2 business days
- **Setup**: Already configured with HBL account
- **User Experience**: User transfers → Admin verifies → Manual activation

### 4. **Manual Verification** (Backup Option)
- **What it is**: Email-based payment verification
- **Processing Time**: Up to 24 hours
- **Setup**: Email `billing@wasilah.org` must be monitored
- **User Experience**: User pays any way → Emails proof → Manual activation

## Recommended Setup (Best for Pakistan)

For the best user experience with instant activation, I recommend:

### Option A: Mobile Wallets Only (Simplest)
1. Use **JazzCash** + **Easypaisa** (already implemented)
2. These give instant activation
3. No integration needed - just verify transaction IDs
4. Most popular in Pakistan

### Option B: Add Automated Payment Gateway (Advanced)

If you want to accept credit/debit cards automatically, consider these options:

#### **PayFast Pakistan** (Recommended for Cards)
- **Website**: https://www.payfast.pk
- **Pros**:
  - Local Pakistani gateway
  - Accepts all major cards (Visa, Mastercard, etc.)
  - International cards supported
  - RESTful API
  - Easy integration
  - Good reputation
- **Cons**:
  - Requires business registration
  - 2-3% transaction fees
  - Needs SSL certificate
- **Cost**: ~2-3% per transaction
- **Integration**: 1-2 days development time

#### **JazzCash Payment Gateway API**
- **Website**: https://sandbox.jazzcash.com.pk/
- **Pros**:
  - Direct API integration
  - Instant settlement
  - Lower fees (1.5-2.5%)
  - Very trusted
- **Cons**:
  - Requires business account
  - Documentation can be complex
- **Cost**: ~1.5-2.5% per transaction
- **Integration**: 2-3 days development time

#### **Easypaisa Payment Gateway API**
- **Website**: Contact Telenor Microfinance Bank
- **Pros**:
  - Direct API integration
  - Popular with users
  - Lower fees (~2%)
- **Cons**:
  - Requires business account
  - Limited documentation
- **Cost**: ~2% per transaction
- **Integration**: 2-3 days development time

### Option C: International + Pakistan (Most Comprehensive)

For accepting payments from anywhere in the world:

#### **Paddle** (Merchant of Record)
- **Website**: https://www.paddle.com
- **Pros**:
  - Handles all tax/VAT compliance
  - Accepts cards globally
  - Works in Pakistan
  - Professional checkout
  - No merchant account needed
- **Cons**:
  - Higher fees (~5% + $0.50)
  - Payouts in USD
  - Setup takes time
- **Cost**: 5% + $0.50 per transaction
- **Integration**: 3-5 days development time

#### **Payoneer**
- **Website**: https://www.payoneer.com
- **Pros**:
  - Works in Pakistan
  - International payments
  - Good reputation
- **Cons**:
  - Complex setup
  - Not ideal for subscriptions
  - Higher fees (~3%)
- **Cost**: ~3% per transaction

## Implementation Status

### ✅ Currently Working
- JazzCash (instant activation)
- Easypaisa (instant activation)
- Bank Transfer (manual verification)
- Manual email verification

### 🔧 Ready to Implement (Need API Keys)
- PayFast integration
- JazzCash Payment Gateway API
- Easypaisa Payment Gateway API

### 📋 Future Considerations
- Paddle for international
- Payoneer for global reach

## How Instant Activation Works

1. **User Flow**:
   - User clicks "Upgrade" on pricing page
   - Selects payment method (JazzCash/Easypaisa)
   - Sees payment instructions with account number
   - Makes payment through mobile app
   - Enters transaction ID and phone number
   - Clicks "Activate Instantly"

2. **System Flow**:
   - Validates transaction ID is unique
   - Creates payment record in Firestore
   - Marks payment as completed
   - Updates user's subscription tier immediately
   - User can use premium features right away

3. **Security**:
   - Transaction IDs are validated for uniqueness
   - Phone numbers are verified
   - Admin can review all transactions
   - Payment records are permanently stored

## Payment Gateway Setup Instructions

### To Enable PayFast (Cards):

1. **Get API Credentials**:
   - Visit https://www.payfast.pk
   - Create merchant account
   - Get API credentials (Merchant ID, Secret Key)

2. **Update Configuration**:
   ```typescript
   // In src/types/payment.ts
   payfast: {
     id: 'payfast',
     available: true, // Change to true
     // ... rest of config
   }
   ```

3. **Add Environment Variables**:
   ```bash
   # In .env.local
   VITE_PAYFAST_MERCHANT_ID=your_merchant_id
   VITE_PAYFAST_SECRET_KEY=your_secret_key
   VITE_PAYFAST_PASSPHRASE=your_passphrase
   ```

4. **Implement PayFast Integration**:
   - Create PayFast service file
   - Add payment gateway logic
   - Test in sandbox mode
   - Deploy to production

### To Enable JazzCash Gateway API:

1. **Contact JazzCash**:
   - Visit https://sandbox.jazzcash.com.pk/
   - Apply for merchant account
   - Get credentials

2. **Similar steps as PayFast** above

## Testing

Before going live:
1. Test with small amounts (PKR 10-50)
2. Verify instant activation works
3. Check admin notifications
4. Test all payment methods
5. Verify refund process

## Support & Maintenance

- Monitor `payment_transactions` collection in Firestore
- Check `admin_notifications` for manual verifications
- Review failed transactions regularly
- Keep transaction IDs for reconciliation

## Fees Comparison

| Method | Transaction Fee | Settlement Time | User Experience |
|--------|----------------|-----------------|-----------------|
| JazzCash Wallet | 0% (you pay) | Instant | ⭐⭐⭐⭐⭐ |
| Easypaisa Wallet | 0% (you pay) | Instant | ⭐⭐⭐⭐⭐ |
| Bank Transfer | Bank fees | 1-2 days | ⭐⭐⭐ |
| PayFast | ~2.5% | Instant | ⭐⭐⭐⭐⭐ |
| JazzCash API | ~2% | Instant | ⭐⭐⭐⭐⭐ |
| Paddle | ~5.5% | Weekly | ⭐⭐⭐⭐ |

## Recommendation

**For immediate launch**: Use the current JazzCash + Easypaisa setup. It's:
- ✅ Already implemented
- ✅ Instant activation
- ✅ Zero fees
- ✅ Most popular in Pakistan
- ✅ No technical setup needed

**For future growth**: Add PayFast for international cards when you have 50+ users.

## Questions?

Contact support@wasilah.org for payment gateway setup assistance.
