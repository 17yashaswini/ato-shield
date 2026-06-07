# 🛡️ ATO Shield — Account Takeover Prevention System

**By Yashaswini S (1AT24MC100) · MCA IV-B · AIML Internship Phase 2 · 2025-26**
**Guide: Prof. Priyanka Pandey**

---

## What This Is

A full-stack AI/ML security system that detects Account Takeover (ATO) attacks using **behavioral biometrics**. Even if a hacker has your password, the system detects they're not you by analyzing typing patterns, login context, and device behavior.

**Stack:** Next.js 15 · Clerk Auth · FastAPI · MongoDB · scikit-learn Isolation Forest

---

## Project Structure

```
ato-shield/
├── frontend/          ← Next.js 15 (React, TypeScript, Tailwind)
└── backend/           ← FastAPI (Python, scikit-learn, MongoDB)
```

---

## ⚡ Quick Start (Local)

### Step 1 — Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **Python** 3.10+ → https://python.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community
  - OR use MongoDB Atlas (free cloud) → https://cloud.mongodb.com

Check installations:
```bash
node --version     # v18+
python3 --version  # 3.10+
mongod --version   # any recent version
```

---

### Step 2 — Get API Keys (Free)

#### Clerk (Auth + OTP + MFA)
1. Go to https://clerk.com → Sign up (free)
2. Create a new application → name it "ATO Shield"
3. Choose "Email" as sign-in method, enable "Email OTP"
4. Go to **API Keys** in the left sidebar
5. Copy:
   - `Publishable Key` (starts with `pk_test_...`)
   - `Secret Key` (starts with `sk_test_...`)

---

### Step 3 — Frontend Setup

```bash
cd ato-shield/frontend

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env.local
```

Now open `.env.local` and fill in your Clerk keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
# Opens at http://localhost:3000
```

---

### Step 4 — Backend Setup

```bash
cd ato-shield/backend

# Create virtual environment
python3 -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp ../.env.example .env
```

Edit `.env` in the backend folder:
```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=ato_shield
SECRET_KEY=any_random_string_here
```

Start MongoDB (if running locally):
```bash
# Mac (with Homebrew):
brew services start mongodb-community

# Windows: MongoDB runs as a service automatically after install
# OR start manually: mongod --dbpath C:\data\db

# Linux:
sudo systemctl start mongod
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

---

### Step 5 — Test It

1. Open http://localhost:3000
2. Click **Get Started** → Register a new account
3. Check your email for OTP from Clerk → verify
4. You're now in the **User Dashboard**
5. Click **Admin Panel →** (top right) to see admin dashboard

> **For first few logins:** The ML model is in "rule-based" mode (not enough data yet). After 5+ logins, Isolation Forest starts learning your typing pattern.

---

## 🔄 How the ML Pipeline Works

```
User types password
        ↓
Frontend captures:
  - Keystroke dwell time (how long each key held)
  - Flight time (gap between keystrokes)
  - Typing speed (chars/sec)
  - Login hour + day of week
        ↓
Sent to FastAPI backend (/behavior/analyze)
        ↓
Rule-based checks (new IP? new device? unusual hour?) → adds penalty score
        ↓
If 5+ logins → Isolation Forest predicts anomaly score
        ↓
Combined risk score (0–100):
  0–30  → ✅ Safe → direct login
  30–70 → ⚠️  Medium → Clerk triggers Email OTP
  70+   → 🚨 High → MFA + admin alert stored in MongoDB
        ↓
Session logged to MongoDB
Behavioral profile updated (if safe login)
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `frontend/hooks/useBehavioralTracker.ts` | Captures keystroke dynamics in real-time |
| `frontend/app/sign-in/page.tsx` | Login form with live behavioral tracking |
| `backend/ml/model.py` | Isolation Forest per-user ML model |
| `backend/ml/risk_score.py` | Rule-based + ML hybrid risk calculator |
| `backend/routes/behavior.py` | Main analysis API endpoint |
| `backend/routes/admin.py` | Admin dashboard data APIs |

---

## 🌐 Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page — project intro, how it works, security layers, literature survey |
| `/sign-up` | Registration with behavioral baseline capture |
| `/sign-in` | Login with real-time behavioral analysis |
| `/dashboard` | User overview — risk score, sessions, alerts |
| `/dashboard/behavior` | Behavioral profile charts and ML status |
| `/dashboard/sessions` | Login history table |
| `/dashboard/alerts` | Security alerts |
| `/dashboard/settings` | MFA and notification preferences |
| `/admin` | Admin overview — KPIs, live charts, threat feed |
| `/admin/users` | All users — risk scores, MFA status, block/unblock |
| `/admin/logs` | Complete session audit log |
| `/admin/threats` | High/medium risk events with actions |
| `/admin/biometrics` | ML model analytics, scatter plots |
| `/admin/reports` | Weekly trends, CSV export |

---

## 🚀 Deployment (After Local Testing)

### Frontend → Vercel
```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ato-shield.git
git push -u origin main

# 2. Go to https://vercel.com → New Project → Import your repo
# 3. Set root directory to: frontend
# 4. Add environment variables (same as .env.local)
# 5. Deploy!
```

### Backend → Railway
```bash
# 1. Go to https://railway.app → New Project → Deploy from GitHub
# 2. Select your repo → set root directory to: backend
# 3. Add environment variables:
#    MONGODB_URL = your Atlas connection string
#    DB_NAME = ato_shield
# 4. Railway auto-detects Python and runs uvicorn
```

### MongoDB → Atlas (cloud)
```bash
# 1. Go to https://cloud.mongodb.com → Create free cluster
# 2. Create database user + password
# 3. Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/ato_shield
# 4. Use this as MONGODB_URL in Railway
```

---

## 🔒 Security Layers Implemented

1. **Behavioral Biometrics** — Keystroke dynamics (dwell time, flight time, speed)
2. **ML Anomaly Detection** — Isolation Forest, unsupervised, per-user model
3. **Geo/Context Checks** — New IP, new timezone, unusual login hour
4. **Device Fingerprinting** — User-agent change detection
5. **Adaptive MFA** — Only triggers when risk > threshold (Clerk OTP)
6. **Rate Limiting** — slowapi middleware on FastAPI
7. **Session Security** — Clerk handles JWT, rotation, HttpOnly cookies
8. **CORS Protection** — Only allows requests from trusted origins

---

## ❓ Troubleshooting

**Frontend won't start:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**Backend import errors:**
```bash
# Make sure venv is activated!
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

**MongoDB connection failed:**
```bash
# Check if MongoDB is running
mongosh  # should open MongoDB shell
# If not, start it: brew services start mongodb-community (Mac)
```

**Clerk error "publishable key missing":**
- Double-check `.env.local` has the right Clerk keys
- Make sure you're running `npm run dev` from the `frontend/` folder

---

*ATO Shield — AIML Internship Phase 2, 2025-26*
