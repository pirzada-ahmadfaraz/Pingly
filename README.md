# Pingly

A full-stack uptime monitoring application with React frontend and Node.js backend.

## Structure

```
project/
├── backend/          # Node.js + Express + MongoDB
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/         # React application
│   └── src/
└── README.md
```

## Setup

### Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   - `MONGO_URL`: MongoDB Atlas connection string
   - `DB_NAME`: Database name (e.g., pingly)
   - `JWT_SECRET`: Random secret key for JWT tokens
   - `RESEND_API_KEY`: Resend API key from https://resend.com
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `PORT`: Server port (default: 8000)
   - `CORS_ORIGINS`: Allowed origins (default: http://localhost:3000)
   - `FRONTEND_URL`: Frontend URL (default: http://localhost:3000)

5. Start the server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The backend will run on `http://localhost:8000`

### Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP code to email
- `POST /api/auth/verify-otp` - Verify OTP code and get auth token
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user info

### Status Monitoring
- `GET /api/` - Health check
- `POST /api/status` - Create status check
- `GET /api/status` - Get all status checks

## Requirements

- Node.js 16+
- MongoDB Atlas account
- Resend API account
- Google OAuth credentials (optional)
- Yarn (for frontend)
