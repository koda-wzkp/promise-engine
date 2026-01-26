# GitHub Setup - Connect Promise Engine to GitHub

Your Promise Engine repo is now standalone at `/Users/overviewmedia/Projects/promise-engine` ✅

## 🚀 Quick Setup (3 Minutes)

### Step 1: Create GitHub Repository

**Go to:** https://github.com/new

**Fill in:**
- **Repository name:** `promise-engine`
- **Description:** Promise-based collaboration platform with sky/cloud theme
- **Visibility:** Private (or Public if you want)
- **⚠️ IMPORTANT:** Do NOT initialize with README, .gitignore, or license (we already have these)

**Click:** "Create repository"

---

### Step 2: Push Your Code

GitHub will show you commands. Use these:

```bash
cd /Users/overviewmedia/Projects/promise-engine

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/promise-engine.git

# Push your code
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your GitHub username.

✅ Done! Your code is now on GitHub.

---

### Step 3: Connect Vercel to New Repo (2 minutes)

**Option A - Reconnect Existing Project (Recommended):**

1. Go to: https://vercel.com/conors-projects-652adadb/frontend/settings
2. Click "Git Repository" section
3. Click "Disconnect"
4. Click "Connect Git Repository"
5. Select your new `promise-engine` repo
6. Set **Root Directory:** `frontend`
7. Click "Connect"
8. Redeploy

**Option B - Create New Vercel Project:**

1. Go to: https://vercel.com/new
2. Import `promise-engine` repository
3. Set **Root Directory:** `frontend`
4. Set **Build Command:** `cd frontend && CI=false npm run build`
5. Set **Output Directory:** `frontend/build`
6. Add environment variable:
   ```
   REACT_APP_API_URL=https://<your-railway-domain>/api/v1
   ```
7. Deploy

---

### Step 4: Connect Railway to New Repo (1 minute)

**Go to:** https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540

**Click:** "New" → "GitHub Repo"

**Select:** Your new `promise-engine` repository

**Set:** Root Directory to `backend`

**Click:** "Deploy"

✅ Done! Railway will auto-deploy from GitHub.

---

## 🔗 Your New Setup

```
/Users/overviewmedia/Projects/
├── pleco/                    # Original CODEC project
└── promise-engine/           # New standalone project ✅
    ├── .git/                 # Own git history
    ├── backend/              # Flask API
    ├── frontend/             # React app
    └── README.md
```

**Benefits:**
- ✅ Clean separation from CODEC
- ✅ GitHub integration for Vercel/Railway
- ✅ Automatic deployments on push
- ✅ Easier collaboration
- ✅ Independent versioning

---

## 📊 Deployment Flow After Setup

```
Local Changes
     ↓
git push origin main
     ↓
GitHub Updates
     ↓
Vercel + Railway Auto-Deploy
     ↓
Live at promise.pleco.dev
```

**No manual deployments needed!** Just push to GitHub and everything updates automatically.

---

## ✅ Verification Checklist

After completing steps above:

- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Vercel connected to new repo
- [ ] Railway connected to new repo
- [ ] Frontend deploys automatically on push
- [ ] Backend deploys automatically on push
- [ ] promise.pleco.dev loads correctly

---

## 🎯 Next Commit Will Auto-Deploy

Once connected to GitHub, any time you:

```bash
cd /Users/overviewmedia/Projects/promise-engine
# Make changes...
git add .
git commit -m "Your changes"
git push origin main
```

**Both Vercel and Railway will automatically deploy!** 🚀

---

## 🆘 Need Help?

**Can't create GitHub repo?**
- Make sure you're logged into GitHub
- Go to https://github.com/new
- Don't initialize with any files

**Push fails?**
- Check remote is correct: `git remote -v`
- Make sure you replaced YOUR_USERNAME
- Try personal access token if password fails

**Vercel won't connect?**
- Make sure repo is on GitHub first
- Check you have permissions on the repo
- Try disconnecting old project first

---

## 📞 Quick Links

- **Create GitHub Repo:** https://github.com/new
- **Vercel Settings:** https://vercel.com/conors-projects-652adadb/frontend/settings
- **Railway Project:** https://railway.com/project/8aa6281c-1e85-4ccc-89fe-ac93048d8540

---

## ✨ You're Almost There!

Just 3 quick steps:
1. Create GitHub repo (2 min)
2. Push code (30 sec)
3. Connect Vercel + Railway (2 min)

**Total:** ~5 minutes to full CI/CD pipeline! 🎉
