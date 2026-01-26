# Promise Engine - Quick Start Guide

## 🚀 Ready to Run!

Promise Engine is fully set up and verified. Everything works!

---

## Start Development (2 commands)

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
python run.py
```

**Server starts at:** http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

**App opens at:** http://localhost:3000

---

## ✅ What You'll See

### Landing Page (http://localhost:3000)
- Beautiful sky gradient background (#87CEEB → #E0F6FF)
- 4 floating clouds drifting across the screen
- Subtle scanline overlay (VHS/CRT effect)
- Beta signup form (saves emails to database)
- "Sign In" and "Register" links

### Login Page (/login)
- Email and password form
- JWT authentication
- Redirects to /dashboard (to be built)

### Register Page (/register)
- First name, last name, email, password
- Creates user account with bcrypt password hash
- Auto-login after registration

---

## 🧪 Test the App

### 1. Beta Signup
1. Go to http://localhost:3000
2. Enter an email (e.g., test@example.com)
3. Click "Join Beta"
4. Should see: "Thanks! We'll notify you when beta opens."

**Verify in database:**
```bash
psql -U overviewmedia -d promise_engine_dev -c "SELECT * FROM beta_signups;"
```

### 2. User Registration
1. Click "Register" on landing page
2. Fill in: First name, Last name, Email, Password (8+ chars)
3. Click "Create Account"
4. Should redirect to /dashboard (will show 404 for now - page not built yet)

**Verify in database:**
```bash
psql -U overviewmedia -d promise_engine_dev -c "SELECT email, first_name, last_name FROM users;"
```

### 3. Login
1. Go to /login
2. Enter email and password from step 2
3. Click "Sign In"
4. Should redirect to /dashboard

---

## 📁 Project Structure

```
promise-engine/
├── backend/                  # Flask API server
│   ├── venv/                # Python virtual environment ✅
│   ├── app/
│   │   ├── models/          # User, BetaSignup
│   │   ├── api/             # auth, beta routes
│   │   └── database.py      # SQLAlchemy setup
│   ├── alembic/             # Database migrations
│   ├── .env                 # Environment variables ✅
│   └── run.py               # Server entry point
│
├── frontend/                # React app
│   ├── node_modules/        # NPM packages ✅
│   ├── build/               # Production build ✅
│   ├── src/
│   │   ├── components/      # CloudBackground, Scanlines
│   │   ├── pages/           # Landing, Login, Register
│   │   ├── styles/          # theme.js (design system)
│   │   └── utils/           # api.js (HTTP client)
│   └── package.json
│
├── SETUP.md                 # Detailed setup guide
├── VERIFICATION_COMPLETE.md # Test results
└── QUICK_START.md          # This file
```

---

## 🎨 Visual Theme Details

### Sky Gradient
- Top: #87CEEB (sky blue)
- Middle: #B3E5FC (light blue)
- Bottom: #E0F6FF (very light blue)

### Clouds
- **Cloud 1**: Large, slow (120s drift)
- **Cloud 2**: Medium, medium speed (90s drift)
- **Cloud 3**: Small, faster (70s drift)
- **Cloud 4**: Large, very slow (140s drift)

### Scanlines
- 2px repeating horizontal lines
- 10% opacity
- Subtle flicker animation (8s)

### UI Cards
- White background: rgba(255, 255, 255, 0.95)
- Backdrop blur: 20px
- Border radius: 16px
- Shadow: rgba(0, 0, 0, 0.1)

---

## 🔧 Common Commands

### Backend
```bash
# Start server
python run.py

# Run tests
pytest

# Create migration
python -m alembic revision --autogenerate -m "description"

# Format code
black app/

# Lint
flake8 app/
```

### Frontend
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Database
```bash
# Connect to database
psql -U overviewmedia -d promise_engine_dev

# List tables
\dt

# View users
SELECT * FROM users;

# View beta signups
SELECT * FROM beta_signups;
```

---

## 🚢 Deploy to Production

### Vercel (Frontend)
1. Push to GitHub
2. Connect repo to Vercel
3. Deploy automatically

**Settings:**
- Build command: `cd frontend && CI=false npm run build`
- Output directory: `frontend/build`
- Domain: promise.pleco.dev

### Backend (Railway/Render/Heroku)
1. Connect GitHub repo
2. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `SECRET_KEY` - Random 64-char hex
   - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
3. Deploy

---

## 📊 Current Status

### ✅ Complete
- User authentication (register, login, JWT)
- Beta signup form
- Database migrations
- Sky/cloud visual theme
- API client with auth headers
- Error handling
- Stripe Connect foundation

### 🚧 To Build
- Dashboard page (protected route)
- Password reset flow
- Email verification
- Promise features (core functionality)
- Stripe Connect integration
- Admin panel (if needed)

---

## 🎯 Next Development Step

**Build the Dashboard Page:**

1. Create `frontend/src/pages/Dashboard.jsx`
2. Add protected route in `App.js`
3. Fetch user data with `api.auth.me()`
4. Display user info

**Example:**
```jsx
// In App.js
<Route path="/dashboard" element={
  token ? <Dashboard user={user} /> : <Navigate to="/login" />
} />
```

---

## 🆘 Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `pg_ctl status`
- Verify database exists: `psql -l | grep promise_engine`
- Check .env file has correct DATABASE_URL

### Frontend won't start
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf build`

### Database errors
- Drop and recreate (dev only):
  ```bash
  dropdb promise_engine_dev
  createdb promise_engine_dev
  cd backend && python run.py
  ```

---

## 📞 Support

- **Documentation**: See SETUP.md for detailed setup
- **Verification**: See VERIFICATION_COMPLETE.md for test results
- **Architecture**: See README.md for project overview

---

## ✨ You're All Set!

Promise Engine is ready for development. Start both servers and visit http://localhost:3000 to see your beautiful sky-themed app!

**Have fun building! 🚀☁️**
