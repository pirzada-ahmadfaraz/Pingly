import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
let db;
let client;

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function connectDB() {
  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Supabase handles OTP sending automatically

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Sending OTP via Supabase to:', email);

    // Use Supabase to send OTP email
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify`
      }
    });

    if (error) {
      console.error('Supabase OTP error:', error);
      return res.status(500).json({
        error: 'Failed to send verification code. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    console.log('OTP sent successfully via Supabase');

    // Store user in your database
    await db.collection('users').updateOne(
      { email },
      {
        $set: { email, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date(), authProvider: 'email' }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      provider: 'supabase'
    });
  } catch (error) {
    console.error('OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    console.log('Verifying OTP with Supabase for:', email);

    // Verify the OTP token with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      console.error('Supabase verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    console.log('OTP verified successfully via Supabase');

    // Get or create user in your database
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      await db.collection('users').insertOne({
        email,
        createdAt: new Date(),
        authProvider: 'email'
      });
    }

    // Create your own JWT token
    const jwtToken = jwt.sign(
      { email, userId: user?._id || 'new-user' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        email: email,
        createdAt: user?.createdAt || new Date(),
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    await db.collection('users').updateOne(
      { email },
      {
        $set: { email, name, picture, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date(), authProvider: 'google' }
      },
      { upsert: true }
    );

    const user = await db.collection('users').findOne({ email });

    const token = jwt.sign(
      { email, userId: user._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await db.collection('users').findOne(
      { email: decoded.email },
      { projection: { _id: 0, email: 1, name: 1, picture: 1, createdAt: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/', (req, res) => {
  res.json({ message: 'Pingly API' });
});

// Test endpoint for Supabase OTP
app.post('/api/test-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify`
      }
    });

    if (error) {
      return res.status(500).json({
        error: 'Failed to send test OTP',
        details: error.message
      });
    }

    res.json({
      success: true,
      message: 'Test OTP sent successfully via Supabase',
      data: data
    });
  } catch (error) {
    console.error('Test OTP error:', error);
    res.status(500).json({
      error: 'Failed to send test OTP',
      details: error.message
    });
  }
});

app.post('/api/status', async (req, res) => {
  try {
    const { client_name } = req.body;

    if (!client_name) {
      return res.status(400).json({ error: 'client_name is required' });
    }

    const statusCheck = {
      id: crypto.randomUUID(),
      client_name,
      timestamp: new Date().toISOString()
    };

    await db.collection('status_checks').insertOne(statusCheck);
    res.status(201).json(statusCheck);
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const statusChecks = await db.collection('status_checks')
      .find({}, { projection: { _id: 0 } })
      .limit(1000)
      .toArray();

    res.json(statusChecks);
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

startServer();
