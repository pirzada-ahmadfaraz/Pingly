import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { createMonitorRoutes } from './routes/monitors.js';
import { authenticateToken } from './middleware/auth.js';
import { initializeScheduler, stopScheduler } from './services/scheduler.js';

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
let schedulerTask;

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

// OAuth2 flow endpoint for popup authentication
app.post('/api/auth/google-oauth', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken({
      code: code,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/google/callback`
    });

    googleClient.setCredentials(tokens);

    // Get user info
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
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
      credential: tokens.id_token, // For compatibility with existing frontend
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Keep the original endpoint for backward compatibility
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

// Monitor routes (protected)
app.use('/api/monitors', authenticateToken, (req, res, next) => {
  const monitorRoutes = createMonitorRoutes(db);
  monitorRoutes(req, res, next);
});

// Telegram integration routes (protected except webhook)
const telegramRouter = express.Router();

// Protected routes
telegramRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.telegram?.chatId) {
      return res.json({
        connected: true,
        username: user.telegram.username || 'Unknown'
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('Telegram status error:', error);
    res.status(500).json({ error: 'Failed to get Telegram status' });
  }
});

telegramRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userId = req.user.userId;

    const connectionToken = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

    await db.collection('telegram_pending').insertOne({
      userId,
      email: userEmail,
      token: connectionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'your_bot_username';
    const botUrl = `https://t.me/${botUsername}?start=${connectionToken}`;

    res.json({
      success: true,
      botUrl,
      message: 'Click start in the Telegram bot to complete connection'
    });
  } catch (error) {
    console.error('Telegram connect error:', error);
    res.status(500).json({ error: 'Failed to initiate Telegram connection' });
  }
});

telegramRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { telegram: '' } }
    );

    res.json({ success: true, message: 'Telegram disconnected' });
  } catch (error) {
    console.error('Telegram disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Telegram' });
  }
});

// Webhook endpoint (NOT protected - Telegram needs to access it)
telegramRouter.post('/webhook', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from.username || message.from.first_name;

    if (text.startsWith('/start ')) {
      const token = text.split(' ')[1];

      const pending = await db.collection('telegram_pending').findOne({
        token,
        expiresAt: { $gt: new Date() }
      });

      if (!pending) {
        await sendTelegramMessage(chatId, '❌ Invalid or expired connection link. Please try connecting again from the website.');
        return res.sendStatus(200);
      }

      await db.collection('users').updateOne(
        { email: pending.email },
        {
          $set: {
            telegram: {
              chatId,
              username,
              connectedAt: new Date()
            }
          }
        }
      );

      await db.collection('telegram_pending').deleteOne({ token });

      await sendTelegramMessage(
        chatId,
        `✅ Successfully connected to Pingly!\n\nYou will now receive notifications when your monitors go down.\n\nUsername: @${username}`
      );

      return res.sendStatus(200);
    }

    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        '👋 Welcome to Pingly Bot!\n\nTo connect your account, please click the "Connect Telegram" button on the Pingly Integrations page.'
      );
      return res.sendStatus(200);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.sendStatus(500);
  }
});

// Helper function to send Telegram messages
async function sendTelegramMessage(chatId, text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

app.use('/api/integrations/telegram', telegramRouter);

// Discord integration routes
const discordRouter = express.Router();

discordRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.discord?.webhookUrl) {
      return res.json({
        connected: true,
        webhook: user.discord.webhookUrl
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('Discord status error:', error);
    res.status(500).json({ error: 'Failed to get Discord status' });
  }
});

discordRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { webhookUrl } = req.body;

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return res.status(400).json({ error: 'Invalid Discord webhook URL' });
    }

    // Test the webhook
    try {
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '✅ Pingly Discord integration connected successfully! You will receive notifications here when your monitors go down.'
        })
      });

      if (!testResponse.ok) {
        return res.status(400).json({ error: 'Invalid webhook URL or webhook is disabled' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Failed to verify webhook URL' });
    }

    // Save webhook to user
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          discord: {
            webhookUrl,
            connectedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Discord webhook connected' });
  } catch (error) {
    console.error('Discord connect error:', error);
    res.status(500).json({ error: 'Failed to connect Discord webhook' });
  }
});

discordRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { discord: '' } }
    );

    res.json({ success: true, message: 'Discord disconnected' });
  } catch (error) {
    console.error('Discord disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Discord' });
  }
});

app.use('/api/integrations/discord', discordRouter);

// Slack integration routes
const slackRouter = express.Router();

slackRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.slack?.webhookUrl) {
      return res.json({
        connected: true,
        webhook: user.slack.webhookUrl
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('Slack status error:', error);
    res.status(500).json({ error: 'Failed to get Slack status' });
  }
});

slackRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { webhookUrl } = req.body;

    if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/services/')) {
      return res.status(400).json({ error: 'Invalid Slack webhook URL' });
    }

    // Test the webhook
    try {
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ Pingly Slack integration connected successfully! You will receive notifications here when your monitors go down.'
        })
      });

      if (!testResponse.ok) {
        return res.status(400).json({ error: 'Invalid webhook URL or webhook is disabled' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Failed to verify webhook URL' });
    }

    // Save webhook to user
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          slack: {
            webhookUrl,
            connectedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Slack webhook connected' });
  } catch (error) {
    console.error('Slack connect error:', error);
    res.status(500).json({ error: 'Failed to connect Slack webhook' });
  }
});

slackRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { slack: '' } }
    );

    res.json({ success: true, message: 'Slack disconnected' });
  } catch (error) {
    console.error('Slack disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Slack' });
  }
});

app.use('/api/integrations/slack', slackRouter);

// Microsoft Teams integration routes
const teamsRouter = express.Router();

teamsRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.teams?.webhookUrl) {
      return res.json({
        connected: true,
        webhook: user.teams.webhookUrl
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('Teams status error:', error);
    res.status(500).json({ error: 'Failed to get Teams status' });
  }
});

teamsRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { webhookUrl } = req.body;

    if (!webhookUrl || !webhookUrl.includes('webhook.office.com')) {
      return res.status(400).json({ error: 'Invalid Microsoft Teams webhook URL' });
    }

    // Test the webhook
    try {
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ Pingly Microsoft Teams integration connected successfully! You will receive notifications here when your monitors go down.'
        })
      });

      if (!testResponse.ok) {
        return res.status(400).json({ error: 'Invalid webhook URL or webhook is disabled' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Failed to verify webhook URL' });
    }

    // Save webhook to user
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          teams: {
            webhookUrl,
            connectedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Teams webhook connected' });
  } catch (error) {
    console.error('Teams connect error:', error);
    res.status(500).json({ error: 'Failed to connect Teams webhook' });
  }
});

teamsRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { teams: '' } }
    );

    res.json({ success: true, message: 'Teams disconnected' });
  } catch (error) {
    console.error('Teams disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Teams' });
  }
});

app.use('/api/integrations/teams', teamsRouter);

// PagerDuty integration routes
const pagerDutyRouter = express.Router();

pagerDutyRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.pagerduty?.routingKey) {
      return res.json({
        connected: true,
        routingKey: user.pagerduty.routingKey.slice(0, 8) + '...' // Show partial for security
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('PagerDuty status error:', error);
    res.status(500).json({ error: 'Failed to get PagerDuty status' });
  }
});

pagerDutyRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { routingKey } = req.body;

    if (!routingKey || routingKey.length < 32) {
      return res.status(400).json({ error: 'Invalid PagerDuty routing key' });
    }

    // Test the routing key by sending a test event
    try {
      const testResponse = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routing_key: routingKey,
          event_action: 'trigger',
          payload: {
            summary: 'Pingly PagerDuty Integration Test',
            severity: 'info',
            source: 'pingly-monitoring',
            custom_details: {
              message: 'PagerDuty integration connected successfully! You will receive alerts here when your monitors go down.'
            }
          }
        })
      });

      const responseData = await testResponse.json();

      if (!testResponse.ok || responseData.status !== 'success') {
        return res.status(400).json({ error: 'Invalid routing key or PagerDuty service configuration' });
      }
    } catch (error) {
      console.error('PagerDuty test error:', error);
      return res.status(400).json({ error: 'Failed to verify PagerDuty routing key' });
    }

    // Save routing key to user
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          pagerduty: {
            routingKey,
            connectedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'PagerDuty integration connected' });
  } catch (error) {
    console.error('PagerDuty connect error:', error);
    res.status(500).json({ error: 'Failed to connect PagerDuty integration' });
  }
});

pagerDutyRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { pagerduty: '' } }
    );

    res.json({ success: true, message: 'PagerDuty disconnected' });
  } catch (error) {
    console.error('PagerDuty disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect PagerDuty' });
  }
});

app.use('/api/integrations/pagerduty', pagerDutyRouter);

// Google Chat integration routes
const googleChatRouter = express.Router();

googleChatRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.googlechat?.webhookUrl) {
      return res.json({
        connected: true,
        webhook: user.googlechat.webhookUrl
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('Google Chat status error:', error);
    res.status(500).json({ error: 'Failed to get Google Chat status' });
  }
});

googleChatRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { webhookUrl } = req.body;

    if (!webhookUrl || !webhookUrl.includes('chat.googleapis.com')) {
      return res.status(400).json({ error: 'Invalid Google Chat webhook URL' });
    }

    // Test the webhook
    try {
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ Pingly Google Chat integration connected successfully! You will receive notifications here when your monitors go down.'
        })
      });

      if (!testResponse.ok) {
        return res.status(400).json({ error: 'Invalid webhook URL or webhook is disabled' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Failed to verify webhook URL' });
    }

    // Save webhook to user
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          googlechat: {
            webhookUrl,
            connectedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Google Chat webhook connected' });
  } catch (error) {
    console.error('Google Chat connect error:', error);
    res.status(500).json({ error: 'Failed to connect Google Chat webhook' });
  }
});

googleChatRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { googlechat: '' } }
    );

    res.json({ success: true, message: 'Google Chat disconnected' });
  } catch (error) {
    console.error('Google Chat disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Chat' });
  }
});

app.use('/api/integrations/googlechat', googleChatRouter);

// Twilio SMS integration routes
const twilioSmsRouter = express.Router();

twilioSmsRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.twiliosms?.accountSid && user?.twiliosms?.authToken) {
      return res.json({
        connected: true,
        phoneNumber: user.twiliosms.phoneNumber,
        toNumber: user.twiliosms.toNumber
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('Twilio SMS status error:', error);
    res.status(500).json({ error: 'Failed to get Twilio SMS status' });
  }
});

twilioSmsRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { accountSid, authToken, phoneNumber, toNumber } = req.body;

    if (!accountSid || !authToken || !phoneNumber || !toNumber) {
      return res.status(400).json({ error: 'All fields are required (Account SID, Auth Token, From Number, To Number)' });
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber) || !phoneRegex.test(toNumber)) {
      return res.status(400).json({ error: 'Phone numbers must be in E.164 format (e.g., +1234567890)' });
    }

    // Test Twilio credentials by sending a test SMS
    try {
      const testResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: phoneNumber,
            To: toNumber,
            Body: 'Pingly Twilio SMS integration connected successfully! You will receive alerts here when your monitors go down.'
          })
        }
      );

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        return res.status(400).json({ error: `Twilio error: ${errorData.message || 'Invalid credentials or configuration'}` });
      }
    } catch (error) {
      console.error('Twilio test error:', error);
      return res.status(400).json({ error: 'Failed to verify Twilio credentials' });
    }

    // Save Twilio config to user
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          twiliosms: {
            accountSid,
            authToken,
            phoneNumber,
            toNumber,
            connectedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Twilio SMS connected' });
  } catch (error) {
    console.error('Twilio SMS connect error:', error);
    res.status(500).json({ error: 'Failed to connect Twilio SMS' });
  }
});

twilioSmsRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { twiliosms: '' } }
    );

    res.json({ success: true, message: 'Twilio SMS disconnected' });
  } catch (error) {
    console.error('Twilio SMS disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Twilio SMS' });
  }
});

app.use('/api/integrations/twiliosms', twilioSmsRouter);

// Webhook integration routes
const webhookRouter = express.Router();

webhookRouter.get('/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await db.collection('users').findOne({ email: userEmail });

    if (user?.webhook?.webhookUrl) {
      return res.json({
        connected: true,
        webhook: user.webhook.webhookUrl,
        method: user.webhook.method || 'POST'
      });
    }

    res.json({ connected: false });
  } catch (error) {
    console.error('Webhook status error:', error);
    res.status(500).json({ error: 'Failed to get Webhook status' });
  }
});

webhookRouter.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { webhookUrl, method, headers } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid webhook URL format' });
    }

    const httpMethod = method || 'POST';
    if (!['GET', 'POST', 'PUT', 'PATCH'].includes(httpMethod)) {
      return res.status(400).json({ error: 'Invalid HTTP method. Must be GET, POST, PUT, or PATCH' });
    }

    // Test the webhook
    try {
      const testPayload = {
        type: 'test',
        message: 'Pingly Webhook integration test',
        monitor: {
          name: 'Test Monitor',
          url: 'https://example.com',
          status: 'down'
        },
        timestamp: new Date().toISOString()
      };

      const fetchOptions = {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Pingly-Monitor/1.0',
          ...(headers || {})
        }
      };

      if (httpMethod !== 'GET') {
        fetchOptions.body = JSON.stringify(testPayload);
      }

      const testResponse = await fetch(webhookUrl, fetchOptions);

      if (!testResponse.ok && testResponse.status >= 500) {
        return res.status(400).json({ error: 'Webhook endpoint returned server error' });
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      return res.status(400).json({ error: 'Failed to connect to webhook URL' });
    }

    // Save webhook to user
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          webhook: {
            webhookUrl,
            method: httpMethod,
            headers: headers || {},
            connectedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Webhook connected' });
  } catch (error) {
    console.error('Webhook connect error:', error);
    res.status(500).json({ error: 'Failed to connect webhook' });
  }
});

webhookRouter.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    await db.collection('users').updateOne(
      { email: userEmail },
      { $unset: { webhook: '' } }
    );

    res.json({ success: true, message: 'Webhook disconnected' });
  } catch (error) {
    console.error('Webhook disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect webhook' });
  }
});

app.use('/api/integrations/webhook', webhookRouter);

// Monitor-specific integration routes
app.get('/api/monitors/:monitorId/integrations', authenticateToken, async (req, res) => {
  try {
    const { monitorId } = req.params;
    const userEmail = req.user.email;

    const monitor = await db.collection('monitors').findOne({
      _id: new ObjectId(monitorId)
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Verify user owns this monitor
    const user = await db.collection('users').findOne({ email: userEmail });
    if (!user || monitor.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      integrations: monitor.integrations || []
    });
  } catch (error) {
    console.error('Error getting monitor integrations:', error);
    res.status(500).json({ error: 'Failed to get monitor integrations' });
  }
});

app.post('/api/monitors/:monitorId/integrations', authenticateToken, async (req, res) => {
  try {
    const { monitorId } = req.params;
    const { integrations } = req.body;
    const userEmail = req.user.email;

    const monitor = await db.collection('monitors').findOne({
      _id: new ObjectId(monitorId)
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Verify user owns this monitor
    const user = await db.collection('users').findOne({ email: userEmail });
    if (!user || monitor.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify user has these integrations connected
    const userConnectedIntegrations = [];
    if (user.telegram?.chatId) userConnectedIntegrations.push('telegram');
    if (user.discord?.webhookUrl) userConnectedIntegrations.push('discord');
    if (user.slack?.webhookUrl) userConnectedIntegrations.push('slack');
    if (user.teams?.webhookUrl) userConnectedIntegrations.push('teams');
    if (user.pagerduty?.routingKey) userConnectedIntegrations.push('pagerduty');
    if (user.googlechat?.webhookUrl) userConnectedIntegrations.push('googlechat');
    if (user.twiliosms?.accountSid) userConnectedIntegrations.push('twiliosms');
    if (user.webhook?.webhookUrl) userConnectedIntegrations.push('webhook');

    // Filter to only include integrations the user has connected
    const validIntegrations = integrations.filter(int =>
      userConnectedIntegrations.includes(int)
    );

    // Update monitor with integrations
    await db.collection('monitors').updateOne(
      { _id: new ObjectId(monitorId) },
      {
        $set: {
          integrations: validIntegrations,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      integrations: validIntegrations
    });
  } catch (error) {
    console.error('Error updating monitor integrations:', error);
    res.status(500).json({ error: 'Failed to update monitor integrations' });
  }
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

// Manual trigger for monitoring (for testing)
app.post('/api/trigger-monitoring', async (req, res) => {
  try {
    const { checkAllMonitors } = await import('./services/monitoringService.js');
    await checkAllMonitors(db);
    res.json({ success: true, message: 'Monitoring triggered successfully' });
  } catch (error) {
    console.error('Trigger monitoring error:', error);
    res.status(500).json({ error: 'Failed to trigger monitoring' });
  }
});

// Vercel Cron endpoint - runs every 5 minutes
// Cron endpoint - Called by external cron service (cron-job.org)
app.get('/api/cron/check-monitors', async (req, res) => {
  try {
    // Optional: Verify with secret key if set
    const cronSecret = req.query.secret || req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      console.log('❌ Unauthorized cron attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🕐 Cron job triggered at', new Date().toISOString());
    const { checkAllMonitors } = await import('./services/monitoringService.js');
    await checkAllMonitors(db);

    res.json({
      success: true,
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: 'Cron job failed', details: error.message });
  }
});

async function startServer() {
  await connectDB();

  // NOTE: Monitoring is handled by Vercel Cron Jobs (see vercel.json)
  // The in-process node-cron scheduler is disabled for Vercel deployment
  // schedulerTask = initializeScheduler(db);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('✓ Monitoring via external cron service');
    console.log('✓ Cron endpoint: /api/cron/check-monitors');
  });
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');

  // Close MongoDB connection
  if (client) {
    await client.close();
  }

  process.exit(0);
});

startServer();
