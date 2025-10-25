import express from 'express';

export function createTelegramRoutes(db) {
  const router = express.Router();

  // Get Telegram connection status
  router.get('/status', async (req, res) => {
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

  // Initiate Telegram connection
  router.post('/connect', async (req, res) => {
    try {
      const userEmail = req.user.email;
      const userId = req.user.userId;

      // Generate a unique connection token
      const connectionToken = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

      // Store the pending connection
      await db.collection('telegram_pending').insertOne({
        userId,
        email: userEmail,
        token: connectionToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Return the bot URL with the token
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

  // Disconnect Telegram
  router.post('/disconnect', async (req, res) => {
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

  // Webhook endpoint for Telegram bot
  router.post('/webhook', async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || !message.text) {
        return res.sendStatus(200);
      }

      const chatId = message.chat.id;
      const text = message.text;
      const username = message.from.username || message.from.first_name;

      // Handle /start command with token
      if (text.startsWith('/start ')) {
        const token = text.split(' ')[1];

        // Find the pending connection
        const pending = await db.collection('telegram_pending').findOne({
          token,
          expiresAt: { $gt: new Date() }
        });

        if (!pending) {
          // Send error message to user
          await sendTelegramMessage(chatId, '❌ Invalid or expired connection link. Please try connecting again from the website.');
          return res.sendStatus(200);
        }

        // Update user with Telegram info
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

        // Delete the pending connection
        await db.collection('telegram_pending').deleteOne({ token });

        // Send success message
        await sendTelegramMessage(
          chatId,
          `✅ Successfully connected to Pingly!\n\nYou will now receive notifications when your monitors go down.\n\nUsername: @${username}`
        );

        return res.sendStatus(200);
      }

      // Handle regular /start command
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

  return router;
}

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

// Export the sendTelegramMessage function for use in notifications
export { sendTelegramMessage };
