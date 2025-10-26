# Discord Integration Setup Guide

Discord integration is super easy - just create a webhook and paste the URL!

## ✅ Step-by-Step Setup (2 minutes)

### Step 1: Create a Discord Webhook

1. **Open Discord** and go to the server where you want notifications

2. **Right-click on a text channel** where you want to receive alerts

3. **Click "Edit Channel"**

4. **Go to "Integrations"** tab in the left sidebar

5. **Click "Create Webhook"** or "View Webhooks" → "New Webhook"

6. **Configure the webhook:**
   - Name: `Pingly Alerts` (or whatever you like)
   - Channel: Select the channel for notifications
   - Avatar: (optional) Upload a custom icon

7. **Click "Copy Webhook URL"**
   - The URL looks like: `https://discord.com/api/webhooks/123456789/abcdefg...`

8. **Click "Save"**

### Step 2: Add Webhook to Pingly

1. **Go to your Pingly app** → Dashboard → Integrations

2. **Click on "Discord"** in the left sidebar

3. **Paste the webhook URL** into the input field

4. **Click "Add Webhook URL"**

5. **Check Discord** - you should see a test message:
   ```
   ✅ Pingly Discord integration connected successfully! You will receive notifications here when your monitors go down.
   ```

6. **Done!** You'll now receive Discord notifications when monitors go down

---

## 🎨 What Notifications Look Like

When a monitor goes down, you'll receive a nice embedded message:

```
🚨 Monitor Alert
Your monitor has gone down. Please check your service.

Monitor: My Website
Status: DOWN ❌
URL: https://example.com
Error: Connection timeout
Time: 1/26/2024, 3:45:00 PM
```

---

## 🔧 Troubleshooting

### "Invalid Discord webhook URL"
- Make sure the URL starts with `https://discord.com/api/webhooks/`
- The URL should look like: `https://discord.com/api/webhooks/[ID]/[TOKEN]`
- Check that you copied the entire URL

### "Invalid webhook URL or webhook is disabled"
- The webhook might have been deleted from Discord
- Check Discord → Server Settings → Integrations → Webhooks
- Create a new webhook if needed

### Not receiving test message
- Check that the webhook is in the correct channel
- Verify you have permission to view that channel
- Discord might have rate limits - wait a minute and try again

### Not receiving notifications
- Verify monitor has `notifyOnFailure` enabled (enabled by default)
- Check that the monitor actually went down
- Look at Vercel backend logs for errors
- Test the webhook by clicking "Disconnect" then "Add" again

---

## 🆚 Discord vs Telegram

| Feature | Discord | Telegram |
|---------|---------|----------|
| Setup Time | 2 minutes | 5 minutes |
| Setup Steps | Copy webhook URL | Create bot, connect account |
| Rich Formatting | ✅ Embeds | ✅ HTML formatting |
| Multiple Channels | ✅ One webhook per channel | ❌ One bot per account |
| Group Notifications | ✅ Any server channel | ✅ Groups/channels |
| Privacy | Webhook URL is sensitive | Bot token is sensitive |

**Recommendation:** Discord is easier for team notifications, Telegram is better for personal alerts!

---

## 💡 Pro Tips

1. **Create separate webhooks** for different projects
   - Production monitors → #production-alerts
   - Staging monitors → #staging-alerts

2. **Use channel permissions** to control who sees alerts
   - Important monitors → Private channel
   - Test monitors → Public channel

3. **Mention roles** in critical alerts (coming soon!)
   - Edit webhook in Discord to @ mention a role

4. **Multiple webhooks** - Connect different Discord servers
   - Personal server for your alerts
   - Team server for shared monitors

5. **Webhook security**
   - Don't share webhook URLs publicly
   - Delete old webhooks you're not using
   - Regenerate webhook if compromised

---

## 📱 Mobile Notifications

Discord will send push notifications to your phone when monitors go down!

**Setup:**
1. Install Discord mobile app
2. Enable notifications for the server
3. Enable notifications for the specific channel
4. You're done!

---

## ❓ Common Questions

**Q: Can I use the same webhook for multiple Pingly accounts?**
A: Yes! Multiple users can use the same webhook URL.

**Q: Will I get spammed with notifications?**
A: No! Pingly only sends ONE notification when a monitor goes from UP → DOWN. It won't spam you while it's down.

**Q: Can I customize the notification format?**
A: Not yet, but coming soon! For now, you get a standard embedded alert.

**Q: What if I delete the webhook in Discord?**
A: Notifications will stop. Just create a new webhook and update it in Pingly.

**Q: Can I send to multiple Discord channels?**
A: Not yet, but coming soon! For now, one webhook per account.

---

## 🚀 Quick Start (TL;DR)

1. Discord → Right-click channel → Edit Channel → Integrations → Create Webhook → Copy URL
2. Pingly → Integrations → Discord → Paste URL → Add
3. Done!

---

**Happy monitoring! 🎉**

If you need help, check out the official Discord webhook documentation:
https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
