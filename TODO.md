# Promise Engine - TODO List

## ⚠️ CRITICAL - Set Up Before Processing Real Payments

### Stripe Webhook Configuration
**Status:** 🔴 NOT CONFIGURED (using placeholder)

**Current:**
```
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

**When to do this:** Before you start accepting real payments

**How to set up:**

1. **Get your Railway backend URL**
   - Should be something like: `https://promise-engine-backend-production.up.railway.app`

2. **Go to Stripe Dashboard**
   - Test mode: https://dashboard.stripe.com/test/webhooks
   - Live mode: https://dashboard.stripe.com/webhooks

3. **Add webhook endpoint**
   - Click "Add endpoint"
   - **Endpoint URL:** `https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/v1/stripe/webhook`
   - **Events to send:**
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `account.updated` (for Stripe Connect)
   - Click "Add endpoint"

4. **Get the webhook secret**
   - Click on your new endpoint
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_...`)

5. **Update Railway environment variable**
   - Go to: https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540
   - Click your backend service
   - Go to "Variables" tab
   - Update `STRIPE_WEBHOOK_SECRET` with real value
   - Railway will auto-redeploy

---

## 📋 Other TODOs

### Immediate (App is Running)
- [ ] Verify backend is deployed on Railway
- [ ] Check Railway logs for any errors
- [ ] Test backend API endpoint
- [ ] Connect Vercel frontend to Railway backend URL
- [ ] Test beta signup (should save to database)
- [ ] Test user registration
- [ ] Test login

### Short Term (This Week)
- [ ] Configure DNS for promise.pleco.dev
- [ ] Verify SSL certificate is active
- [ ] Test full flow end-to-end
- [ ] Build dashboard page for logged-in users

### Medium Term (Before Launch)
- [x] Set up real Stripe webhook (see above)
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Set up SendGrid for email notifications
- [ ] Test Stripe Connect onboarding flow
- [ ] Add error logging/monitoring

### Long Term (Future Features)
- [ ] Build core promise theory features
- [ ] Add project collaboration tools
- [ ] Implement payment splits
- [ ] Add notifications system
- [ ] Build admin dashboard

---

## 🔐 Current Environment Status

### Railway Backend Variables
- ✅ `DATABASE_URL` - Auto-configured by PostgreSQL
- ✅ `SECRET_KEY` - Set
- ✅ `FLASK_ENV` - Set to production
- ✅ `FLASK_DEBUG` - Set to False
- ✅ `APP_NAME` - Set
- ✅ `FRONTEND_URL` - Set
- ✅ `STRIPE_SECRET_KEY` - Real key configured
- ✅ `STRIPE_PUBLISHABLE_KEY` - Real key configured
- 🔴 `STRIPE_WEBHOOK_SECRET` - **PLACEHOLDER ONLY**

### What Works Without Real Webhook
- ✅ User registration/login
- ✅ Beta signups
- ✅ Database operations
- ✅ Basic Stripe API calls
- ❌ Webhook event processing (payment confirmations, subscription updates)

### What Needs Real Webhook
- ❌ Payment confirmation notifications
- ❌ Subscription status updates
- ❌ Failed payment handling
- ❌ Stripe Connect account updates

---

## 📝 Notes

**Why placeholder is OK for now:**
- App runs fine without webhook processing
- You can still make Stripe API calls
- Webhooks are only needed when Stripe sends events to your backend
- Perfect for beta testing without payments

**When you MUST set up real webhook:**
- Before accepting any real payments
- Before launching to paying customers
- Before Stripe Connect onboarding goes live

**How to remember:**
- This file is committed to git
- Check this TODO before any payment features go live
- Review before switching from test to live Stripe keys

---

Last updated: 2026-01-26
