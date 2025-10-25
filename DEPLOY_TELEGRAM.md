# Quick Telegram Deployment Checklist

## ✅ Step-by-Step Deployment

### 1. Create Your Telegram Bot (5 minutes)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name: `Pingly Monitor Bot` (or whatever you like)
4. Choose a username: `pingly_monitor_bot` (must end with "bot")
5. **Copy the bot token** BotFather gives you (looks like: `1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
6. **Copy the bot username** (the one you just created)

### 2. Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your backend project (pingly-one)
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: `[paste your bot token from step 1]`

   **Variable 2:**
   - Name: `TELEGRAM_BOT_USERNAME`
   - Value: `[your bot username without @, e.g., pingly_monitor_bot]`

5. Click **Save**

### 3. Deploy Your Backend

**Option A: Push to GitHub (Recommended)**
```bash
cd /Users/ahmadfaraz/Desktop/100CANON/project/backend
git add .
git commit -m "Add Telegram integration"
git push
```

Vercel will automatically deploy your changes.

**Option B: Manual Deploy via Vercel CLI**
```bash
cd /Users/ahmadfaraz/Desktop/100CANON/project/backend
vercel --prod
```

### 4. Set Up Telegram Webhook

After your backend is deployed, run this command in your terminal:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url":"https://pingly-one.vercel.app/api/integrations/telegram/webhook"}'
```

**Replace:**
- `<YOUR_BOT_TOKEN>` with your actual bot token from step 1

**You should see:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### 5. Verify Webhook is Working

Check webhook status:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

You should see:
```json
{
  "ok": true,
  "result": {
    "url": "https://pingly-one.vercel.app/api/integrations/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### 6. Test the Integration

1. **Deploy frontend** (if you haven't already):
   ```bash
   cd /Users/ahmadfaraz/Desktop/100CANON/project/frontend
   git add .
   git commit -m "Add Telegram integration UI"
   git push
   ```

2. **Open your Pingly app** in browser

3. **Go to:** Dashboard → Integrations → Telegram

4. **Click** "Connect Telegram"
   - Should open your Telegram bot in a new window
   - If you get an error, check browser console

5. **Click "Start"** in the Telegram bot
   - You should see: "✅ Successfully connected to Pingly!"
   - In your app: Status should change to "Connected with @yourusername"

6. **Test notifications:**
   - Create a monitor for a non-existent website (e.g., `https://thissitedoesnotexist12345.com`)
   - Wait 5 minutes (or whatever frequency you set)
   - You should receive a Telegram notification when it's detected as down

## 🔧 Troubleshooting

### "404 Not Found" error
- ✅ **Fixed!** I've moved the routes directly into server.js
- Make sure you've deployed the backend
- Check Vercel deployment logs for errors

### Webhook not receiving updates
```bash
# Check webhook status
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"

# If webhook URL is wrong, set it again
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url":"https://pingly-one.vercel.app/api/integrations/telegram/webhook"}'
```

### "Invalid token" in Telegram
- Make sure you clicked "Start" in the bot after clicking "Connect Telegram"
- Connection tokens expire after 10 minutes - try connecting again

### Status not updating in frontend
- Refresh the page (F5 or Cmd+R)
- Check browser console for errors
- Verify backend is deployed with new code

### Not receiving notifications
- Make sure monitor has `notifyOnFailure` enabled (it's enabled by default)
- Check if monitor actually went down (look at last status)
- Look at Vercel backend logs for error messages
- Verify `TELEGRAM_BOT_TOKEN` is set correctly in Vercel environment variables

## 📝 Quick Commands Reference

**Set webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url":"https://pingly-one.vercel.app/api/integrations/telegram/webhook"}'
```

**Check webhook:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Delete webhook (for testing):**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```

**Test bot is working:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

---

## ✅ Success Checklist

- [ ] Bot created with BotFather
- [ ] Bot token and username saved
- [ ] Environment variables added to Vercel
- [ ] Backend deployed successfully
- [ ] Webhook set and verified
- [ ] Frontend deployed
- [ ] Successfully connected Telegram in app
- [ ] Received test notification

Once all checked, your Telegram integration is live! 🎉
