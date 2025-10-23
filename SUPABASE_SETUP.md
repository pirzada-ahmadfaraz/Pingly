# Supabase OTP Setup Guide

## 🚀 **Why Supabase for OTP?**

- ✅ **Free tier**: 50,000 emails/month
- ✅ **No domain verification needed**
- ✅ **Works with any email address**
- ✅ **Built-in OTP generation and verification**
- ✅ **Professional email templates**

## 📋 **Setup Steps:**

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login
3. Create a new project
4. Wait for project to be ready

### 2. Get Your Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (starts with `eyJ...`)

### 3. Add Environment Variables to Vercel
Add these to your Vercel environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### 4. Configure Email Settings
1. Go to **Authentication** → **Settings**
2. Set **Site URL** to your frontend URL
3. Go to **Authentication** → **Email Templates**
4. Customize the OTP email template if needed

### 5. Test the Setup
```bash
curl -X POST https://your-backend.vercel.app/api/test-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## 🎯 **Benefits:**

- **No email service setup needed**
- **Works with any email address**
- **Professional email delivery**
- **Built-in rate limiting**
- **Automatic OTP expiration**

## 🔧 **How It Works:**

1. User enters email → Supabase sends OTP email
2. User enters OTP → Supabase verifies it
3. Your app gets the verification result
4. You create your own JWT token for the user

This is much simpler than managing your own email service! 🚀
