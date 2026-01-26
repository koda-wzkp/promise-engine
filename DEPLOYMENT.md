# Promise Engine - Deployment Guide

## ✅ Deployments Initiated

### Frontend (Vercel) - ✅ DEPLOYED
**Status:** Live and running
**URL:** https://frontend-indol-pi-90.vercel.app
**Custom Domain:** promise.pleco.dev (DNS setup required)

### Backend (Railway) - ⚠️ NEEDS MANUAL SETUP
**Status:** Project created, needs configuration
**Project:** promise-engine-backend
**Dashboard:** https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540

---

## 🎯 What Was Done

### ✅ Completed
1. ✅ Git repository initialized with all code
2. ✅ Frontend deployed to Vercel (live at URL above)
3. ✅ Custom domain `promise.pleco.dev` added to Vercel project
4. ✅ Railway project created: `promise-engine-backend`
5. ✅ Railway configuration files added (Procfile, railway.json, runtime.txt)
6. ✅ All changes committed to git

### ⚠️ Needs Manual Setup

#### 1. DNS Configuration for promise.pleco.dev
Go to your domain registrar (Namecheap, GoDaddy, etc.) and add:

**Option A - A Record (Recommended):**
```
Type: A
Name: promise
Value: 76.76.21.21
TTL: Auto
```

**Option B - Change Nameservers:**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

After DNS propagates (5-60 minutes), `promise.pleco.dev` will show your app.

#### 2. Railway Backend Setup
1. **Go to Railway Dashboard:**
   https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540

2. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "PostgreSQL"
   - This will auto-create a `DATABASE_URL` environment variable

3. **Add Backend Service:**
   - Click "New" → "GitHub Repo" or "Empty Service"
   - If using GitHub, connect your `promise-engine` repo
   - Select the `backend` directory as root
   - Railway will auto-detect Python and deploy

4. **Set Environment Variables:**
   In the backend service settings → Variables, add:
   ```
   SECRET_KEY=<generate-random-64-char-hex>
   FLASK_ENV=production
   FLASK_DEBUG=False
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   APP_NAME=Promise Engine
   FRONTEND_URL=https://promise.pleco.dev
   ```

   **Generate SECRET_KEY:**
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

5. **Generate Public Domain:**
   - In service settings → "Networking"
   - Click "Generate Domain"
   - Copy the URL (e.g., `promise-engine-backend.up.railway.app`)

6. **Update Frontend API URL:**
   - Go back to Vercel project settings
   - Add environment variable:
     ```
     REACT_APP_API_URL=https://promise-engine-backend.up.railway.app/api/v1
     ```
   - Redeploy frontend

---

## 🚀 Quick Links

### Vercel
- **Frontend Dashboard:** https://vercel.com/dashboard
- **Current Deployment:** https://frontend-indol-pi-90.vercel.app
- **Domain Settings:** https://vercel.com/conors-projects-652adadb/frontend/settings/domains

### Railway
- **Backend Project:** https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540
- **Dashboard:** https://railway.com/dashboard

---

## 📋 Post-Deployment Checklist

### Frontend (Vercel)
- [x] Deployed successfully
- [x] Custom domain added
- [ ] DNS configured (manual step)
- [ ] SSL certificate active (automatic after DNS)
- [ ] Environment variables set (after backend URL available)

### Backend (Railway)
- [x] Project created
- [x] Configuration files added
- [ ] PostgreSQL database added (manual)
- [ ] Backend service deployed (manual)
- [ ] Environment variables set (manual)
- [ ] Public domain generated (manual)
- [ ] Database migrations run (automatic on first deploy)

---

## 🧪 Testing After Deployment

### 1. Test Frontend
Visit: https://promise.pleco.dev (after DNS propagates)

Should see:
- Sky gradient background
- Floating clouds
- Scanline effect
- Beta signup form

### 2. Test Backend API
Visit: `https://<your-railway-domain>.up.railway.app/api/v1/auth/me`

Should return:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header",
    "details": {}
  }
}
```

### 3. Test Beta Signup
1. Go to https://promise.pleco.dev
2. Enter email in beta form
3. Should save to Railway PostgreSQL database

### 4. Test Registration
1. Click "Register"
2. Fill form and submit
3. Should create user account
4. Should redirect to /dashboard

---

## 🔧 Useful Commands

### Deploy Frontend Updates
```bash
cd frontend
vercel --prod
```

### Deploy Backend Updates (if using Railway CLI)
```bash
cd backend
railway up
```

### Check Vercel Logs
```bash
cd frontend
vercel logs https://frontend-indol-pi-90.vercel.app
```

### Check Railway Logs
```bash
cd backend
railway logs
```

### View Environment Variables
```bash
# Vercel
cd frontend
vercel env ls

# Railway
cd backend
railway variables
```

---

## 🔐 Environment Variables Reference

### Frontend (Vercel)
```bash
REACT_APP_API_URL=https://<railway-backend>.up.railway.app/api/v1
```

### Backend (Railway)
```bash
# Database (auto-set by Railway when you add PostgreSQL)
DATABASE_URL=postgresql://...

# Flask
SECRET_KEY=<64-char-hex>
FLASK_ENV=production
FLASK_DEBUG=False

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
APP_NAME=Promise Engine
APP_URL=https://<railway-backend>.up.railway.app
FRONTEND_URL=https://promise.pleco.dev

# Email (optional)
SENDGRID_API_KEY=<your-key>
FROM_EMAIL=noreply@promise.pleco.dev
```

---

## 📊 Deployment Status

| Component | Status | URL | Notes |
|-----------|--------|-----|-------|
| Frontend | ✅ LIVE | https://frontend-indol-pi-90.vercel.app | Deployed |
| Custom Domain | ⚠️ PENDING | https://promise.pleco.dev | DNS setup needed |
| Backend | ⚠️ PENDING | - | Manual Railway setup needed |
| Database | ⚠️ PENDING | - | Add via Railway dashboard |

---

## 🆘 Troubleshooting

### Frontend shows 404
- Check if DNS has propagated: `dig promise.pleco.dev`
- Wait 5-60 minutes for DNS changes
- Clear browser cache

### Backend API not responding
- Check Railway service is running
- Check environment variables are set
- Check logs in Railway dashboard
- Verify DATABASE_URL is set

### Database connection errors
- Make sure PostgreSQL plugin is added in Railway
- Check DATABASE_URL format: `postgresql://user:pass@host:port/db`
- Verify migrations ran (check Railway logs)

### CORS errors
- Make sure FRONTEND_URL is set in backend
- Check CORS configuration in `backend/app/__init__.py`

---

## 📞 Next Steps

1. **Configure DNS** - Set up promise.pleco.dev A record
2. **Set up Railway** - Add PostgreSQL and deploy backend service
3. **Set environment variables** - Add all required env vars
4. **Test end-to-end** - Register account, test beta signup
5. **Monitor logs** - Check for any errors in Vercel/Railway

---

## ✨ Deployment Complete!

Once DNS is configured and Railway backend is set up, Promise Engine will be live at:

**🌐 https://promise.pleco.dev**

Your beautiful sky-themed app with floating clouds and scanlines will be accessible to the world! ☁️✨
