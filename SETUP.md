# Pingly - Authentication Setup Guide

This guide will walk you through setting up OTP-based email authentication and Google OAuth for your Pingly application.

## 🔑 Required API Keys and Configuration

### 1. Resend API (for OTP Email Delivery)

Resend is a modern email API service for sending transactional emails.

1. **Sign up for Resend**
   - Visit https://resend.com
   - Create a free account

2. **Get Your API Key**
   - Go to your dashboard
   - Navigate to "API Keys"
   - Click "Create API Key"
   - Give it a name (e.g., "Pingly Production")
   - Copy the API key (it will look like `re_xxxxxxxxxxxx`)

3. **Important Notes**
   - Free tier: 100 emails/day
   - Paid tier: Starting at $20/month for 50,000 emails
   - You can use `onboarding@resend.dev` as the sender for testing

### 2. MongoDB Atlas Setup

1. **Sign up for MongoDB Atlas**
   - Visit https://www.mongodb.com/cloud/atlas
   - Create a free account

2. **Create a Cluster**
   - Click "Build a Cluster"
   - Choose the free tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Set up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set permissions to "Read and write to any database"

4. **Set up Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/`

### 3. Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com

2. **Create a New Project (or select existing)**
   - Click on the project dropdown
   - Click "New Project"
   - Name it "Pingly" or your app name

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: Pingly
     - User support email: your email
     - Developer contact: your email
   - Application type: "Web application"
   - Name: "Pingly Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:8000`
   - Authorized redirect URIs:
     - `http://localhost:3000`
   - Click "Create"

5. **Copy Your Client ID**
   - You'll get a Client ID like: `123456789-xxxxx.apps.googleusercontent.com`
   - Copy this for your `.env` files

## 📝 Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and fill in all the values:
   ```env
   # MongoDB Atlas Configuration
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=pingly

   # Server Configuration
   PORT=8000
   CORS_ORIGINS=http://localhost:3000
   FRONTEND_URL=http://localhost:3000

   # JWT Secret (Generate a strong random string!)
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

   # Resend API Configuration
   RESEND_API_KEY=re_xxxxxxxxxxxx

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the backend:
   ```bash
   npm run dev
   ```

## 🎨 Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your configuration:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. Install dependencies (if not done):
   ```bash
   yarn install
   ```

5. Start the frontend:
   ```bash
   yarn start
   ```

## 🧪 Testing the Authentication

### Test OTP Authentication:

1. Go to `http://localhost:3000/signup`
2. Enter your email address
3. Click "Continue with Email"
4. Check your email for the 6-digit OTP code
5. Enter the code in the verification form
6. You should be redirected to the dashboard

### Test Google OAuth:

1. Go to `http://localhost:3000/signup`
2. Click "Login with Google"
3. Select your Google account
4. You should be redirected to the dashboard

## 📚 API Endpoints

### Authentication Endpoints:

- `POST /api/auth/send-otp`
  - Body: `{ "email": "user@example.com" }`
  - Sends a 6-digit OTP code to the email
  - OTP expires in 10 minutes

- `POST /api/auth/verify-otp`
  - Body: `{ "email": "user@example.com", "otp": "123456" }`
  - Returns auth token and user info

- `POST /api/auth/google`
  - Body: `{ "credential": "google-id-token" }`
  - Returns auth token and user info

- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Returns current user info

## 🔐 Security Notes

1. **Never commit your `.env` files** - They contain sensitive credentials
2. **Change the JWT_SECRET** - Use a random, long string in production
3. **Use environment variables** - Don't hardcode credentials
4. **Enable HTTPS in production** - Especially for authentication
5. **Update CORS_ORIGINS** - Set to your actual domain in production

## 🚀 Production Deployment

For production deployment:

1. Update the Google OAuth authorized origins to your production domain
2. Upgrade Resend to paid plan if needed (100+ emails/day)
3. Use a strong, random JWT_SECRET (minimum 32 characters)
4. Set CORS_ORIGINS to your actual domain
5. Use environment variables provided by your hosting platform
6. Configure MongoDB Atlas IP whitelist for production
7. Use HTTPS for all connections

## 🆘 Troubleshooting

### OTP Not Sending:
- Check RESEND_API_KEY is correct
- Check Resend dashboard for delivery status
- Check spam folder
- Verify email rate limits (100/day on free tier)
- Check backend console for errors

### Google OAuth Not Working:
- Verify Client ID is correct
- Check authorized origins in Google Console
- Make sure origins match exactly (http vs https)
- Check browser console for errors

### Token Invalid Errors:
- JWT_SECRET must be the same in `.env`
- OTP expires after 10 minutes
- Auth token expires after 30 days
- Clear localStorage and try again

### MongoDB Connection Issues:
- Verify connection string format
- Check username and password are correct
- Ensure IP address is whitelisted in MongoDB Atlas
- Check network access settings

## 📞 Support

If you run into issues, check:
1. Backend console logs
2. Frontend browser console
3. Network tab in browser DevTools
4. MongoDB Atlas connection status
5. Resend dashboard for email delivery logs

Good luck! 🎉
