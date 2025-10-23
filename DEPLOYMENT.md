# Pingly - Deployment Guide

Complete guide for deploying Pingly to Vercel with MongoDB Atlas and Resend API.

## Prerequisites

Before deploying, you need:
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. MongoDB Atlas account
4. Resend API account

---

## Step 1: Set Up MongoDB Atlas

### Create Your Database

1. **Sign Up / Log In**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account or log in

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose **M0 FREE** tier
   - Select a cloud provider (AWS recommended)
   - Choose a region closest to your users
   - Name your cluster (e.g., "Pingly")
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `pingly_user` (or your choice)
   - Click "Autogenerate Secure Password" or create your own
   - **SAVE THIS PASSWORD SECURELY!**
   - Set permission to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   - Note: For production, you should restrict to Vercel's IP ranges

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Driver: Node.js, Version: 4.1 or later
   - Copy the connection string:
     ```
     mongodb+srv://pingly_user:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - Replace `<password>` with your actual password
   - Keep this string safe, you'll need it for Vercel!

---

## Step 2: Set Up Resend API

### Get Your API Key

1. **Sign Up for Resend**
   - Go to https://resend.com
   - Click "Sign Up"
   - Verify your email

2. **Create API Key**
   - After logging in, go to "API Keys"
   - Click "Create API Key"
   - Name: `Pingly Production`
   - Permission: Full Access
   - Click "Create"
   - **COPY THE KEY IMMEDIATELY** (starts with `re_`)
   - You won't be able to see it again!

3. **Verify Domain (Optional for Production)**
   - For testing: Use `onboarding@resend.dev` as sender
   - For production: Add and verify your domain
   - Go to "Domains" → "Add Domain"
   - Follow DNS setup instructions

4. **Pricing Note**
   - Free: 100 emails/day, 3,000/month
   - For more: $20/month for 50,000 emails

---

## Step 3: Set Up Google OAuth (Optional)

If you want Google Sign-In:

1. **Google Cloud Console**
   - Go to https://console.cloud.google.com
   - Create a new project or select existing

2. **Enable Google Sign-In API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Sign-In"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: Pingly
     - Support email: your email
   - Application type: **Web application**
   - Name: Pingly Web Client
   - Authorized JavaScript origins:
     - `https://your-domain.vercel.app`
     - `http://localhost:3000` (for local testing)
   - Authorized redirect URIs:
     - `https://your-domain.vercel.app`
   - Click "Create"
   - **Copy the Client ID** (looks like: `123456-xxxxx.apps.googleusercontent.com`)

---

## Step 4: Push to GitHub

### Clean and Push Your Code

1. **Navigate to your project**
   ```bash
   cd /Users/ahmadfaraz/Desktop/100CANON/project
   ```

2. **Remove sensitive files (if any)**
   ```bash
   # Ensure .env files are not tracked
   git rm --cached backend/.env frontend/.env 2>/dev/null || true
   git rm --cached .env 2>/dev/null || true
   ```

3. **Check git status**
   ```bash
   git status
   ```

4. **Add all files**
   ```bash
   git add .
   ```

5. **Commit changes**
   ```bash
   git commit -m "Prepare for deployment: OTP auth, MongoDB Atlas, Resend API"
   ```

6. **Create GitHub repository**
   - Go to https://github.com/new
   - Repository name: `pingly`
   - Description: "Uptime monitoring and status pages"
   - Visibility: **Public** or Private (your choice)
   - **DO NOT** initialize with README (you already have one)
   - Click "Create repository"

7. **Push to GitHub**
   ```bash
   # Add remote (replace YOUR_USERNAME)
   git remote add origin https://github.com/YOUR_USERNAME/pingly.git

   # Or if you already have a remote
   git remote set-url origin https://github.com/YOUR_USERNAME/pingly.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

---

## Step 5: Deploy Backend to Vercel

### Deploy Node.js Backend

1. **Go to Vercel**
   - Visit https://vercel.com
   - Log in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select your `pingly` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Other**
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   MONGO_URL=mongodb+srv://pingly_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
   DB_NAME=pingly
   PORT=8000
   JWT_SECRET=generate-a-random-32-character-string-here
   RESEND_API_KEY=re_xxxxxxxxxxxx
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

   **Important:**
   - Generate JWT_SECRET: Use a random string generator or run:
     ```bash
     openssl rand -base64 32
     ```
   - Replace MongoDB password and cluster URL
   - Replace Resend API key
   - For now, set CORS_ORIGINS to `*`, you'll update it later

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Copy your backend URL: `https://your-backend.vercel.app`

---

## Step 6: Deploy Frontend to Vercel

### Deploy React Frontend

1. **Create New Project**
   - Go back to Vercel dashboard
   - Click "Add New Project"
   - Select your `pingly` repository again
   - Click "Import"

2. **Configure Project**
   - Framework Preset: **Create React App**
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `build`
   - Install Command: `yarn install`

3. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   REACT_APP_BACKEND_URL=https://your-backend.vercel.app
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

   **Important:**
   - Replace with your actual backend URL from Step 5
   - Add your Google Client ID (if using Google OAuth)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)
   - Your frontend URL: `https://your-frontend.vercel.app`

---

## Step 7: Update Configuration

### Update Backend CORS Settings

1. **Go to Backend Project in Vercel**
   - Select your backend project
   - Go to "Settings" → "Environment Variables"

2. **Update CORS_ORIGINS and FRONTEND_URL**
   - Edit `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - Edit `FRONTEND_URL`: `https://your-frontend.vercel.app`
   - Click "Save"

3. **Redeploy Backend**
   - Go to "Deployments"
   - Click "..." on latest deployment
   - Click "Redeploy"

### Update Google OAuth (if using)

1. **Go to Google Cloud Console**
   - Go to "APIs & Services" → "Credentials"
   - Edit your OAuth 2.0 Client ID

2. **Update Authorized Origins**
   - Add: `https://your-frontend.vercel.app`
   - Add: `https://your-backend.vercel.app`

3. **Update Redirect URIs**
   - Add: `https://your-frontend.vercel.app`

---

## Step 8: Test Your Deployment

### Verify Everything Works

1. **Visit Your Frontend**
   - Go to `https://your-frontend.vercel.app`
   - You should see the landing page

2. **Test OTP Authentication**
   - Click "Sign In" or go to `/signup`
   - Enter your email
   - Check your email for OTP code
   - Enter the code
   - You should be redirected to dashboard

3. **Test Google OAuth (if configured)**
   - Click "Login with Google"
   - Select your account
   - Should redirect to dashboard

4. **Check Backend Health**
   - Visit `https://your-backend.vercel.app/api/`
   - Should see: `{"message":"Pingly API"}`

---

## Common Issues & Fixes

### Backend Issues

**Problem: "Cannot connect to MongoDB"**
- Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
- Verify connection string is correct
- Ensure password has no special characters (or URL encode them)

**Problem: "CORS Error"**
- Update CORS_ORIGINS in backend environment variables
- Must match frontend URL exactly (no trailing slash)
- Redeploy backend after changing

**Problem: "OTP emails not sending"**
- Check RESEND_API_KEY is correct
- Verify you haven't hit rate limit (100/day on free tier)
- Check Resend dashboard for delivery logs

### Frontend Issues

**Problem: "Network Error" or 404**
- Check REACT_APP_BACKEND_URL is correct
- Backend URL must NOT have trailing slash
- Redeploy frontend after changing

**Problem: "Google Sign-In not working"**
- Verify authorized origins in Google Console
- Check REACT_APP_GOOGLE_CLIENT_ID is set
- Clear browser cache and try again

---

## Monitoring Your App

### Vercel Dashboard

1. **Check Logs**
   - Go to project in Vercel
   - Click "Logs" tab
   - Monitor for errors

2. **Check Analytics**
   - View visitor stats
   - Monitor performance

### MongoDB Atlas

1. **Monitor Database**
   - Go to MongoDB Atlas dashboard
   - Check "Metrics" tab
   - Monitor connections and queries

### Resend Dashboard

1. **Check Email Delivery**
   - Go to Resend dashboard
   - View sent emails
   - Check delivery status

---

## Custom Domain (Optional)

### Add Your Own Domain

1. **In Vercel**
   - Go to frontend project
   - Go to "Settings" → "Domains"
   - Add your domain
   - Follow DNS instructions

2. **Update Environment Variables**
   - Update backend CORS_ORIGINS to your domain
   - Update Google OAuth authorized origins

3. **Redeploy**
   - Redeploy both frontend and backend

---

## Updating Your App

### Push Updates

1. **Make changes locally**
2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. **Vercel auto-deploys** on every push to main!

---

## Cost Summary

- **Vercel:** Free (Hobby plan)
- **MongoDB Atlas:** Free (512 MB, M0 cluster)
- **Resend:** Free (100 emails/day)
- **Google OAuth:** Free
- **Total:** $0 to start!

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Resend Docs: https://resend.com/docs

Good luck with your deployment! 🚀
