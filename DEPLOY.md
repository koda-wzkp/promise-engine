# Deploying Promise Engine to promisepipeline.com

## Architecture

```
promisepipeline.com  →  Vercel (React frontend)
api.promisepipeline.com  →  Railway (Flask backend + PostgreSQL)
```

## 1. Railway (Backend + Database)

### Set up the service

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **PostgreSQL** plugin (or connect existing)
3. Add a new service from GitHub → select `promise-engine` repo
4. Set **Root Directory** to `backend`
5. Railway auto-detects `railway.json` and uses `bash start.sh`

### Environment variables (Railway dashboard)

```
DATABASE_URL=<auto-set by Railway PostgreSQL plugin>
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(32))">
JWT_SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(32))">
FLASK_ENV=production
FLASK_DEBUG=false
CORS_ORIGINS=https://promisepipeline.com,https://www.promisepipeline.com
APP_URL=https://api.promisepipeline.com
FRONTEND_URL=https://promisepipeline.com
FROM_EMAIL=noreply@promisepipeline.com
```

### Custom domain

1. In Railway service settings → **Networking** → **Custom Domain**
2. Add `api.promisepipeline.com`
3. Railway provides a CNAME target (e.g., `api-promisepipeline-com.up.railway.app`)

### Seed the database

After deploy, run in Railway shell or locally with production DATABASE_URL:

```bash
cd backend
DATABASE_URL=<production_url> python scripts/seed_hb2021.py
```

## 2. Vercel (Frontend)

### Set up the project

1. Go to [vercel.com](https://vercel.com) and import the `promise-engine` repo
2. Vercel auto-detects `vercel.json` in the root
3. Build command: `cd frontend && CI=false npm run build`
4. Output directory: `frontend/build`

### Environment variables (Vercel dashboard)

```
REACT_APP_API_URL=https://api.promisepipeline.com/api/v1
```

### Custom domain

1. In Vercel project settings → **Domains**
2. Add `promisepipeline.com`
3. Vercel provides the required DNS records

## 3. Namecheap DNS Configuration

In Namecheap → Domain List → `promisepipeline.com` → **Advanced DNS**:

| Type  | Host | Value | TTL |
|-------|------|-------|-----|
| CNAME | www  | `cname.vercel-dns.com` | Automatic |
| CNAME | api  | `<railway-cname-target>` | Automatic |
| A     | @    | `76.76.21.21` | Automatic |

**Notes:**
- The A record (`76.76.21.21`) is Vercel's IP for apex domains
- Vercel will auto-provision SSL for both `promisepipeline.com` and `www.promisepipeline.com`
- Railway auto-provisions SSL for `api.promisepipeline.com`
- Remove any existing Namecheap parking page records first

## 4. Post-Deploy Checklist

- [ ] Backend health check: `curl https://api.promisepipeline.com/api/v1/promise/schemas`
- [ ] Frontend loads: `https://promisepipeline.com`
- [ ] Dashboard data loads (check network tab for API calls)
- [ ] CORS working (no console errors on API calls)
- [ ] SSL certificates active on both domains
- [ ] Run seed script against production DB
- [ ] Verify beta signup flow works end-to-end
