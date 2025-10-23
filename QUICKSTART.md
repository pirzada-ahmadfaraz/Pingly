# Quick Start Guide - Push to GitHub & Deploy to Vercel

Follow these steps to deploy Pingly to production.

## 🚀 Quick Deploy (10 minutes)

### Step 1: Push to GitHub (2 minutes)

```bash
# Navigate to project
cd /Users/ahmadfaraz/Desktop/100CANON/project

# Stage all changes
git add .

# Commit everything
git commit -m "Production ready: OTP authentication with MongoDB Atlas and Resend"

# Create GitHub repo (do this on github.com/new)
# Then add remote (replace YOUR_USERNAME):
git remote add origin https://github.com/YOUR_USERNAME/pingly.git

# Or if remote exists, update it:
git remote set-url origin https://github.com/YOUR_USERNAME/pingly.git

# Push to GitHub
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas (3 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account → Create M0 FREE cluster
3. Create database user (save password!)
4. Allow access from anywhere (0.0.0.0/0)
5. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/`

### Step 3: Get Resend API Key (1 minute)

1. Go to https://resend.com → Sign up (free)
2. Create API Key
3. Copy the key (starts with `re_`)

### Step 4: Deploy Backend to Vercel (2 minutes)

1. Go to https://vercel.com → Import your GitHub repo
2. Root Directory: **backend**
3. Framework: **Other**
4. Add Environment Variables:
   ```
   MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
   DB_NAME=pingly
   PORT=8000
   JWT_SECRET=your-random-32-char-secret
   RESEND_API_KEY=re_xxxxxxxxxxxx
   GOOGLE_CLIENT_ID=your-google-id (optional)
   CORS_ORIGINS=*
   FRONTEND_URL=https://yoursite.vercel.app
   ```
5. Deploy → Copy backend URL

### Step 5: Deploy Frontend to Vercel (2 minutes)

1. Vercel → Import same GitHub repo again
2. Root Directory: **frontend**
3. Framework: **Create React App**
4. Add Environment Variables:
   ```
   REACT_APP_BACKEND_URL=https://your-backend.vercel.app
   REACT_APP_GOOGLE_CLIENT_ID=your-google-id (optional)
   ```
5. Deploy → Copy frontend URL

### Step 6: Update Backend CORS

1. Go to backend project in Vercel
2. Settings → Environment Variables
3. Update `CORS_ORIGINS` to your frontend URL
4. Update `FRONTEND_URL` to your frontend URL
5. Redeploy

## ✅ That's It!

Visit your frontend URL and test:
- Email OTP authentication
- Google sign-in (if configured)
- Dashboard access

## 📖 Need More Details?

See `DEPLOYMENT.md` for complete step-by-step guide.

## 💰 Cost

Everything is FREE:
- Vercel: Free tier
- MongoDB Atlas: Free M0 cluster
- Resend: 100 emails/day free

## 🆘 Issues?

Check `DEPLOYMENT.md` → "Common Issues & Fixes" section.
