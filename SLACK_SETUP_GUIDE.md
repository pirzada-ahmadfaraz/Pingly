# Slack Integration Setup Guide

Slack integration is super easy - just create an Incoming Webhook and paste the URL!

## ✅ Step-by-Step Setup (3 minutes)

### Step 1: Create a Slack Incoming Webhook

1. **Go to Slack API website** - Visit https://api.slack.com/apps

2. **Click "Create New App"**
   - Choose "From scratch"
   - App Name: `Pingly Alerts` (or whatever you like)
   - Pick your workspace

3. **Enable Incoming Webhooks**
   - In the left sidebar, click "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks" to **ON**

4. **Add New Webhook to Workspace**
   - Scroll down and click "Add New Webhook to Workspace"
   - Select the channel where you want notifications
   - Click "Allow"

5. **Copy the Webhook URL**
   - The URL looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`
   - Click "Copy" button next to the webhook URL

### Step 2: Add Webhook to Pingly

1. **Go to your Pingly app** → Dashboard → Integrations

2. **Click on "Slack"** in the left sidebar

3. **Paste the webhook URL** into the input field

4. **Click "Add Webhook URL"**

5. **Check Slack** - you should see a test message:
   ```
   ✅ Pingly Slack integration connected successfully! You will receive notifications here when your monitors go down.
   ```

6. **Done!** You'll now receive Slack notifications when monitors go down

---

## 🎨 What Notifications Look Like

When a monitor goes down, you'll receive a formatted message with blocks:

```
🚨 Monitor Alert

Your monitor has gone down. Please check your service.

Monitor: My Website          Status: DOWN ❌
URL: https://example.com     Time: 1/26/2024, 3:45:00 PM

Error:
Connection timeout
```

---

## 🔧 Troubleshooting

### "Invalid Slack webhook URL"
- Make sure the URL starts with `https://hooks.slack.com/services/`
- The URL should look like: `https://hooks.slack.com/services/[WORKSPACE]/[CHANNEL]/[TOKEN]`
- Check that you copied the entire URL

### "Invalid webhook URL or webhook is disabled"
- The webhook might have been deleted or deactivated
- Check your Slack app settings at https://api.slack.com/apps
- Go to your app → Incoming Webhooks → verify it's still there
- Create a new webhook if needed

### Not receiving test message
- Check that the webhook is in the correct channel
- Verify you have permission to view that channel
- The Slack app might need to be reinstalled - try creating a new webhook
- Wait a minute and try again

### Not receiving notifications
- Verify monitor has `notifyOnFailure` enabled (enabled by default)
- Check that the monitor actually went down
- Look at backend logs for errors
- Test the webhook by clicking "Disconnect" then "Add" again
- Make sure the Slack app wasn't removed from your workspace

---

## 🆚 Slack vs Discord vs Telegram

| Feature | Slack | Discord | Telegram |
|---------|-------|---------|----------|
| Setup Time | 3 minutes | 2 minutes | 5 minutes |
| Setup Steps | Create app & webhook | Copy webhook URL | Create bot, connect account |
| Rich Formatting | ✅ Block Kit | ✅ Embeds | ✅ HTML formatting |
| Multiple Channels | ✅ One webhook per channel | ✅ One webhook per channel | ❌ One bot per account |
| Team Notifications | ✅ Built for teams | ✅ Great for teams | ⚠️ Better for personal |
| Privacy | Webhook URL is sensitive | Webhook URL is sensitive | Bot token is sensitive |

**Recommendation:** Slack is perfect for team/workplace notifications, Discord for community alerts, Telegram for personal monitoring!

---

## 💡 Pro Tips

1. **Create separate webhooks** for different projects
   - Production monitors → #production-alerts
   - Staging monitors → #staging-alerts
   - Dev monitors → #dev-alerts

2. **Use channel permissions** to control who sees alerts
   - Important monitors → Private channel
   - Test monitors → Public channel

3. **Mention users/channels** in critical alerts
   - Configure your Slack workflow to @mention specific users
   - Set up Slack's built-in alert keywords

4. **Multiple webhooks** - Connect different workspaces
   - Personal workspace for your alerts
   - Team workspace for shared monitors

5. **Webhook security**
   - Don't share webhook URLs publicly
   - Rotate webhooks periodically
   - Delete old webhooks you're not using
   - If compromised, deactivate and create new webhook

6. **Integrate with Slack workflows**
   - Use Slack's Workflow Builder to trigger actions
   - Create custom responses to alerts
   - Auto-assign incidents to team members

---

## 📱 Mobile Notifications

Slack will send push notifications to your phone when monitors go down!

**Setup:**
1. Install Slack mobile app
2. Enable notifications for the workspace
3. Enable notifications for the specific channel
4. Customize notification preferences in Slack settings

**Notification Settings:**
- Go to workspace → Preferences → Notifications
- Choose "All new messages" for critical alert channels
- Or use @mentions for selective alerts

---

## ❓ Common Questions

**Q: Can I use the same webhook for multiple Pingly accounts?**
A: Yes! Multiple users can use the same webhook URL.

**Q: Will I get spammed with notifications?**
A: No! Pingly only sends ONE notification when a monitor goes from UP → DOWN. It won't spam you while it's down.

**Q: Can I customize the notification format?**
A: Not yet, but coming soon! For now, you get a standard Block Kit formatted alert.

**Q: What if I delete the webhook in Slack?**
A: Notifications will stop. Just create a new webhook in your Slack app and update it in Pingly.

**Q: Can I send to multiple Slack channels?**
A: Not yet, but coming soon! For now, one webhook per account. Workaround: Create multiple webhooks in Slack and rotate them, or use Slack's native channel forwarding.

**Q: Does this work with Slack Connect (external workspaces)?**
A: Yes! You can create webhooks for channels in external workspaces if you have permission.

**Q: Can I use this in Slack's free tier?**
A: Yes! Incoming Webhooks work on all Slack plans including the free tier.

**Q: How do I change the notification channel?**
A: You need to create a new webhook for the new channel and update it in Pingly. Slack doesn't allow changing the channel of an existing webhook.

---

## 🚀 Quick Start (TL;DR)

1. https://api.slack.com/apps → Create New App → Incoming Webhooks → Activate → Add to Workspace → Choose Channel → Copy URL
2. Pingly → Integrations → Slack → Paste URL → Add Webhook URL
3. Done!

---

## 🔗 Useful Links

- **Slack Incoming Webhooks Documentation:** https://api.slack.com/messaging/webhooks
- **Slack Block Kit Builder:** https://app.slack.com/block-kit-builder (for custom formats - coming soon!)
- **Slack API Apps:** https://api.slack.com/apps (manage your webhooks)
- **Slack Community:** https://slackcommunity.com

---

**Happy monitoring! 🎉**

If you need help, check out the official Slack webhook documentation:
https://api.slack.com/messaging/webhooks
