# Telegram Bot Setup Guide for Pingly

This guide will walk you through setting up the Telegram bot integration for your Pingly monitoring app.

## Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather` (the official bot creation bot)

2. **Start a chat** with BotFather by clicking `/start`

3. **Create a new bot** by sending:
   ```
   /newbot
   ```

4. **Choose a name** for your bot (e.g., "Pingly Monitor Bot")
   - This is the display name users will see

5. **Choose a username** for your bot (e.g., "PinglyMonitorBot")
   - Must end with "bot" (e.g., `pingly_monitor_bot`)
   - Must be unique across all Telegram

6. **Save the bot token** that BotFather gives you
   - It looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **Keep this secret!** Anyone with this token can control your bot

## Step 2: Set Webhook for Your Bot

You need to set up a webhook so Telegram sends updates to your backend.

### Option A: Using Vercel (Recommended - Same as your current setup)

1. **Deploy your backend to Vercel** (if not already done)

2. **Set the webhook URL** using this API call:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
   -H "Content-Type: application/json" \
   -d '{"url":"https://your-backend-url.vercel.app/api/integrations/telegram/webhook"}'
   ```

   Replace:
   - `<YOUR_BOT_TOKEN>` with your actual bot token
   - `your-backend-url.vercel.app` with your Vercel backend URL

3. **Verify webhook is set** by visiting:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```

### Option B: Using Railway.app (Free hosting alternative)

1. **Sign up** at [railway.app](https://railway.app) (free tier available)

2. **Create a new project** and connect your GitHub repository

3. **Add environment variables** (see Step 3 below)

4. **Deploy** your backend

5. **Set webhook** using the Railway URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
   -H "Content-Type: application/json" \
   -d '{"url":"https://your-app.railway.app/api/integrations/telegram/webhook"}'
   ```

### Option C: Using Render.com (Free tier)

1. **Sign up** at [render.com](https://render.com)

2. **Create a new Web Service**

3. **Connect your GitHub repository**

4. **Set environment variables** (see Step 3)

5. **Set webhook** using Render URL

## Step 3: Add Environment Variables

Add these to your backend `.env` file (or in your hosting platform's environment variables):

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username

# Example:
# TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
# TELEGRAM_BOT_USERNAME=pingly_monitor_bot
```

### For Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add both variables
4. Redeploy your backend

### For Railway/Render:
1. Go to your project settings
2. Find "Variables" or "Environment Variables"
3. Add both variables
4. Service will auto-redeploy

## Step 4: Test Your Bot

1. **Search for your bot** in Telegram using the username you created (e.g., `@pingly_monitor_bot`)

2. **Click "Start"** - you should see a welcome message

3. **Go to your Pingly app** → Integrations → Telegram

4. **Click "Connect Telegram"** - this will open your bot

5. **Click "Start"** in the bot with the special link

6. **You should see** a success message in Telegram and the status should update in your Pingly app

## Step 5: Testing Notifications

To test if notifications are working:

1. **Create a monitor** for a website that is down (or temporarily disable a website)

2. **Wait for the monitoring check** to run (based on your frequency setting)

3. **You should receive** a Telegram message when the monitor goes down:
   ```
   🚨 Monitor Alert

   Monitor: Your Monitor Name
   Status: DOWN ❌
   URL: https://your-site.com
   Error: Connection timeout
   Time: [timestamp]

   Your monitor has gone down. Please check your service.
   ```

## Free Hosting Options Comparison

### Vercel (Recommended)
- ✅ Free tier generous
- ✅ Easy deployment
- ✅ Great for serverless
- ✅ Auto-deploy from GitHub
- ✅ You're already using it
- ⚠️ Webhooks work but need to be properly configured

### Railway.app
- ✅ Free $5/month credit
- ✅ Supports persistent connections
- ✅ Good for background jobs
- ✅ Easy to use
- ❌ Credit runs out after heavy usage

### Render.com
- ✅ Free tier available
- ✅ 750 hours/month free
- ✅ Auto-deploy from GitHub
- ⚠️ Services spin down after inactivity
- ⚠️ Slower cold starts

### Recommendation
**Use Vercel** since you're already using it for your backend. Just make sure to set up the webhook correctly.

## Troubleshooting

### Bot not responding to /start
- Check if webhook is set correctly: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Verify your backend URL is accessible
- Check backend logs for errors

### Connection not reflecting in frontend
- Wait a few seconds and refresh the page
- Check browser console for errors
- Verify the polling is working (check Network tab)

### Not receiving notifications
- Verify monitor has `notifyOnFailure: true`
- Check if Telegram chatId is stored in database
- Look at backend logs when monitor check runs
- Verify bot token is correct in environment variables

### Webhook errors
- Ensure your backend is deployed and accessible
- Telegram webhook URL must be HTTPS (not HTTP)
- Check if the webhook endpoint is returning 200 status

## Database Collections

The integration uses these MongoDB collections:

### `users` collection
```javascript
{
  email: "user@example.com",
  telegram: {
    chatId: 123456789,
    username: "john_doe",
    connectedAt: ISODate("2024-01-01T00:00:00Z")
  }
}
```

### `telegram_pending` collection (temporary)
```javascript
{
  userId: ObjectId("..."),
  email: "user@example.com",
  token: "base64_encoded_token",
  createdAt: ISODate("..."),
  expiresAt: ISODate("...") // 10 minutes from creation
}
```

## Security Notes

1. **Never commit** your bot token to GitHub
2. **Use environment variables** for all sensitive data
3. **Verify webhook requests** are coming from Telegram (optional but recommended)
4. **Rotate your bot token** if it gets leaked (use `/token` in BotFather)

## Next Steps

After Telegram is working:
- [ ] Add email notifications
- [ ] Add Discord integration
- [ ] Add Slack integration
- [ ] Add webhook integrations

## Need Help?

If you encounter issues:
1. Check backend logs
2. Verify environment variables are set
3. Test webhook using Telegram's `getWebhookInfo`
4. Ensure your backend is deployed and running

---

**Happy Monitoring! 🚀**
