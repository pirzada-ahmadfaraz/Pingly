import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Resend } from 'resend';
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
const resend = new Resend(process.env.RESEND_API_KEY);

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

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection('otp_codes').insertOne({
      email,
      otp,
      createdAt: new Date(),
      expiresAt,
      used: false,
    });

    await db.collection('users').updateOne(
      { email },
      {
        $set: { email, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date(), authProvider: 'email' }
      },
      { upsert: true }
    );

    try {
      console.log('Sending OTP email to:', email);
      console.log('OTP Code:', otp);
      
      const emailResult = await resend.emails.send({
        from: 'Pingly <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Pingly Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #000;">Welcome to Pingly!</h2>
            <p>Your verification code is:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
        text: `Your Pingly verification code is: ${otp}. This code will expire in 10 minutes.`,
      });

      console.log('Email sent successfully:', emailResult);
      
      res.json({
        success: true,
        message: 'Verification code sent to your email'
      });
    } catch (emailError) {
      console.error('Email error details:', emailError);
      console.error('Resend API Key exists:', !!process.env.RESEND_API_KEY);
      console.error('Resend API Key length:', process.env.RESEND_API_KEY?.length);
      
      res.status(500).json({
        error: 'Failed to send email. Please check your email address and try again.',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
  } catch (error) {
    console.error('OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpRecord = await db.collection('otp_codes').findOne({
      email,
      otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    await db.collection('otp_codes').updateOne(
      { _id: otpRecord._id },
      { $set: { used: true, usedAt: new Date() } }
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
        createdAt: user.createdAt,
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

// Test endpoint for email functionality
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const testResult = await resend.emails.send({
      from: 'Pingly <onboarding@resend.dev>',
      to: [email],
      subject: 'Test Email from Pingly',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
      text: 'Test Email - If you receive this, email is working!',
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      result: testResult
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: 'Failed to send test email',
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
