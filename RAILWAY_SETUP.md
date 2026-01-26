# Railway Backend Setup - Click & Deploy Guide

**Railway CLI Limitation:** The CLI requires interactive mode for some operations, so we'll complete setup through the dashboard (faster anyway - just 5 clicks!).

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Add PostgreSQL Database (1 click)

**Go to:** https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540

**Click:** "New" → "Database" → "PostgreSQL"

✅ Done! Railway automatically creates `DATABASE_URL` environment variable.

---

### Step 2: Deploy Backend Service (1 click)

**Still in:** https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540

**Option A - From GitHub (Recommended):**
1. Click "New" → "GitHub Repo"
2. Connect your GitHub account if not connected
3. Select `promise-engine` repository
4. Set **Root Directory:** `backend`
5. Click "Deploy"

**Option B - From Local Files:**
1. In your terminal:
   ```bash
   cd /Users/overviewmedia/Projects/pleco/promise-engine/backend
   railway up --service <service-name>
   ```

✅ Done! Railway auto-detects Python and installs dependencies.

---

### Step 3: Add Environment Variables (Copy/Paste)

**Go to:** Service → Settings → Variables

**Click:** "Add Variable" and paste these:

```bash
SECRET_KEY=9506042c2081d36b5498022bf7b830bf5d30b9f66ad4ff9e9cfbf016b49e9069
FLASK_ENV=production
FLASK_DEBUG=False
APP_NAME=Promise Engine
FRONTEND_URL=https://promise.pleco.dev
```

**Add your Stripe keys:**
```bash
STRIPE_SECRET_KEY=sk_live_...  # or sk_test_... for testing
STRIPE_PUBLISHABLE_KEY=pk_live_...  # or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Optional (for SendGrid emails):**
```bash
SENDGRID_API_KEY=your_key_here
FROM_EMAIL=noreply@promise.pleco.dev
```

**Note:** `DATABASE_URL` is already set automatically from Step 1.

✅ Done! Service will auto-redeploy with new variables.

---

### Step 4: Generate Public Domain (1 click)

**Go to:** Service → Settings → Networking

**Click:** "Generate Domain"

**Copy the URL** - looks like: `promise-engine-backend-production.up.railway.app`

✅ Done! Your backend API is now live!

---

### Step 5: Connect Frontend to Backend (2 minutes)

**Go to:** https://vercel.com/conors-projects-652adadb/frontend/settings/environment-variables

**Click:** "Add New"

```
Name: REACT_APP_API_URL
Value: https://<your-railway-domain>.up.railway.app/api/v1
Environment: Production
```

**Click:** "Save"

**Then:** Go to Deployments → Click "..." → "Redeploy"

✅ Done! Frontend now connected to backend!

---

## 🧪 Test Your Deployment

### 1. Test Backend API
Visit: `https://<your-railway-domain>/api/v1/auth/me`

Should return:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

✅ Backend is working!

### 2. Test Frontend
Visit: https://promise.pleco.dev (or https://frontend-indol-pi-90.vercel.app)

Try:
1. Beta signup - should save to Railway database
2. Register account - should create user
3. Login - should work and redirect

✅ Full stack working!

---

## 📊 Environment Variables Reference

Your backend service should have these variables:

| Variable | Value | Source |
|----------|-------|--------|
| DATABASE_URL | postgresql://... | Auto-set by Railway |
| SECRET_KEY | 9506042c2081d36b5498022bf7b830bf5d30b9f66ad4ff9e9cfbf016b49e9069 | Generated above |
| FLASK_ENV | production | Manual |
| FLASK_DEBUG | False | Manual |
| APP_NAME | Promise Engine | Manual |
| FRONTEND_URL | https://promise.pleco.dev | Manual |
| STRIPE_SECRET_KEY | sk_live_... | Your Stripe account |
| STRIPE_PUBLISHABLE_KEY | pk_live_... | Your Stripe account |
| STRIPE_WEBHOOK_SECRET | whsec_... | Your Stripe account |

---

## 🔍 Verify Deployment

### Check Logs
**Go to:** Service → Deployments → Click latest → View Logs

Should see:
```
Running database migrations...
INFO  [alembic.runtime.migration] Running upgrade -> 001_initial
Database initialized successfully
Flask app created - Environment: production
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
```

### Check Database Tables
**Go to:** PostgreSQL service → Data

Should see tables:
- `users`
- `beta_signups`
- `alembic_version`

---

## ⚡ Quick Links

### Railway
- **Project Dashboard:** https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540
- **Add Database:** Click "New" → "Database" → "PostgreSQL"
- **View Logs:** Service → Deployments → Latest → Logs

### Vercel
- **Environment Variables:** https://vercel.com/conors-projects-652adadb/frontend/settings/environment-variables
- **Deployments:** https://vercel.com/conors-projects-652adadb/frontend

---

## 🆘 Troubleshooting

### Build fails
- Check `requirements.txt` is present
- Check Python version in `runtime.txt` (python-3.9.6)
- View build logs in Railway dashboard

### Database connection fails
- Make sure PostgreSQL service is added
- Check `DATABASE_URL` is set (auto-set when you add PostgreSQL)
- Check service is in same project

### Migrations fail
- Check DATABASE_URL format is correct
- Check PostgreSQL service is running
- View logs for specific error message

### API returns 500 errors
- Check all environment variables are set
- Check logs for Python errors
- Verify SECRET_KEY is set

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database added
- [ ] Backend service deployed
- [ ] Environment variables set
- [ ] Public domain generated
- [ ] Frontend connected to backend
- [ ] Backend API responds (test /auth/me)
- [ ] Database migrations ran successfully
- [ ] No errors in logs

---

## 🎉 You're Done!

Once all steps complete:
- ✅ Backend API live at Railway
- ✅ Frontend live at Vercel
- ✅ Database connected
- ✅ Full stack working

**Total time:** ~5 minutes (just a few clicks!)

Visit https://promise.pleco.dev and enjoy your beautiful sky-themed app! ☁️✨
