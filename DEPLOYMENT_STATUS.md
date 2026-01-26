# Promise Engine - Production Deployment Status

**Date:** January 26, 2026  
**Time:** $(date)

---

## ✅ Frontend Deployed

- **URL:** https://promise.pleco.dev
- **Platform:** Vercel
- **Status:** LIVE ✅
- **Domain:** Automatically configured
- **Build:** Successful

**Deployment URL:**
- Production: https://frontend-9xmcccp2j-conors-projects-652adadb.vercel.app
- Custom Domain: https://promise.pleco.dev

---

## ⏳ Backend Connection

**Current Status:** Needs Railway backend URL

**To Complete:**

### Option 1: If Backend Already Deployed to Railway

1. Visit https://railway.app/dashboard
2. Find "promise-engine" project
3. Click backend service
4. Copy the public domain URL
5. Run this command:
   ```bash
   cd /Users/overviewmedia/Projects/promise-engine/frontend
   vercel env add REACT_APP_API_URL production
   # When prompted, paste the Railway URL
   vercel --prod
   ```

### Option 2: If Backend NOT on Railway Yet

1. Visit https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select: koda-wzkp/promise-engine
4. Set root directory: `backend`
5. Add PostgreSQL database addon
6. Set environment variables in Railway dashboard:
   - `DATABASE_URL` (auto-filled by PostgreSQL addon)
   - `FLASK_ENV=production`
   - `SECRET_KEY=<generate-secure-key>`
   - `STRIPE_SECRET_KEY=<your-stripe-key>`
   - `STRIPE_PUBLISHABLE_KEY=<your-stripe-key>`
   - `STRIPE_WEBHOOK_SECRET=<your-webhook-secret>`
7. Railway will auto-deploy
8. Get the public URL
9. Follow Option 1 steps 5 above

---

## 🧪 Testing Production

Once backend URL is configured:

1. Visit https://promise.pleco.dev
2. Click "View Demo Dashboard"
3. Should see integrity score loading from Railway backend
4. Navigate to "Promises" tab
5. Verify data loads correctly

---

## 📊 What's Deployed

**Frontend:**
- Landing page with hero section
- Integrity dashboard (/integrity)
- Promises browser (/promises)
- Beta signup form
- Navigation

**Backend (when connected):**
- 7 REST API endpoints
- PostgreSQL database
- Promise Engine core
- CODEC vertical with grind-roast schema

---

## 🔧 Quick Fixes

**If frontend shows connection errors:**
```bash
# Set correct backend URL
cd /Users/overviewmedia/Projects/promise-engine/frontend
vercel env add REACT_APP_API_URL production
# Enter Railway URL when prompted
vercel --prod
```

**If backend not responding:**
- Check Railway logs in dashboard
- Verify DATABASE_URL is set
- Confirm migrations ran (check startup logs)
- Check PostgreSQL addon is active

---

## 📝 Next Steps

1. [ ] Get Railway backend URL
2. [ ] Configure REACT_APP_API_URL in Vercel
3. [ ] Redeploy frontend
4. [ ] Test production app
5. [ ] Verify all features work
6. [ ] Set up Stripe webhook (production URL)

---

**Current Bottleneck:** Need Railway backend URL to complete deployment.
