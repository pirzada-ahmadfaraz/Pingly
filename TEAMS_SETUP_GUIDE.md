# Microsoft Teams Integration Setup Guide

Microsoft Teams integration is easy - just create an Incoming Webhook connector and paste the URL!

## ✅ Step-by-Step Setup (3 minutes)

### Step 1: Create a Teams Incoming Webhook

1. **Open Microsoft Teams** and go to the team where you want notifications

2. **Click on a channel** where you want to receive alerts

3. **Click the three dots (...)** next to the channel name

4. **Select "Connectors"** from the dropdown menu

5. **Find "Incoming Webhook"**
   - Search for "Incoming Webhook" in the connectors list
   - Click "Configure" next to Incoming Webhook

6. **Configure the webhook:**
   - Name: `Pingly Alerts` (or whatever you like)
   - Upload an image: (optional) Add a custom icon
   - Click "Create"

7. **Copy the webhook URL**
   - The URL looks like: `https://outlook.office.com/webhook/[GUID]/IncomingWebhook/[CHANNEL]/[GUID]`
   - Or: `https://[tenant].webhook.office.com/webhookb2/[GUID]@[GUID]/IncomingWebhook/[CHANNEL]/[GUID]`
   - Click "Copy to clipboard"

8. **Click "Done"**

### Step 2: Add Webhook to Pingly

1. **Go to your Pingly app** → Dashboard → Integrations

2. **Click on "Teams"** in the left sidebar

3. **Paste the webhook URL** into the input field

4. **Click "Add Webhook URL"**

5. **Check Teams** - you should see a test message:
   ```
   ✅ Pingly Microsoft Teams integration connected successfully! You will receive notifications here when your monitors go down.
   ```

6. **Done!** You'll now receive Teams notifications when monitors go down

---

## 🎨 What Notifications Look Like

When a monitor goes down, you'll receive a formatted MessageCard:

```
🚨 Monitor Alert

Your monitor has gone down
Please check your service

Monitor: My Website
Status: DOWN ❌
URL: https://example.com
Error: Connection timeout
Time: 1/26/2024, 3:45:00 PM
```

The card will have a red accent color on the left side to indicate it's an alert.

---

## 🔧 Troubleshooting

### "Invalid Microsoft Teams webhook URL"
- Make sure the URL contains `webhook.office.com` or `outlook.office.com/webhook`
- The URL should look like: `https://[domain].webhook.office.com/webhookb2/...`
- Check that you copied the entire URL

### "Invalid webhook URL or webhook is disabled"
- The webhook connector might have been removed from Teams
- Check Teams → Channel → Connectors → Configured
- Recreate the webhook if needed

### Not receiving test message
- Check that you're looking at the correct channel
- Verify the connector is still configured in Teams
- The webhook might be disabled - check connector status
- Wait a minute and try again

### Not receiving notifications
- Verify monitor has `notifyOnFailure` enabled (enabled by default)
- Check that the monitor actually went down
- Look at backend logs for errors
- Test the webhook by clicking "Remove" then "Add Webhook URL" again
- Make sure the Teams connector wasn't removed from the channel

### Connector disappeared
- If someone removes the connector from Teams, notifications will stop
- Go back to Teams → Channel → Connectors
- Find the "Pingly Alerts" connector and remove it
- Create a new webhook and update in Pingly

---

## 🆚 Teams vs Slack vs Discord vs Telegram

| Feature | Teams | Slack | Discord | Telegram |
|---------|-------|-------|---------|----------|
| Setup Time | 3 minutes | 3 minutes | 2 minutes | 5 minutes |
| Setup Steps | Add connector in channel | Create app & webhook | Copy webhook URL | Create bot, connect |
| Rich Formatting | ✅ MessageCard | ✅ Block Kit | ✅ Embeds | ✅ HTML |
| Multiple Channels | ✅ One webhook per channel | ✅ One webhook per channel | ✅ One webhook per channel | ❌ One bot per account |
| Team Notifications | ✅ Built for enterprises | ✅ Built for teams | ✅ Great for teams | ⚠️ Better for personal |
| Organization | Enterprise-focused | Startup/team-focused | Community-focused | Personal-focused |
| Privacy | Webhook URL is sensitive | Webhook URL is sensitive | Webhook URL is sensitive | Bot token is sensitive |

**Recommendation:** Teams is perfect for enterprise/corporate environments, Slack for startups/teams, Discord for communities, Telegram for personal monitoring!

---

## 💡 Pro Tips

1. **Create separate webhooks** for different environments
   - Production monitors → #production-alerts
   - Staging monitors → #staging-alerts
   - Dev monitors → #dev-alerts

2. **Use channel permissions** to control access
   - Important monitors → Private channel
   - Test monitors → Public channel

3. **Organize by team**
   - Frontend team → #frontend-alerts
   - Backend team → #backend-alerts
   - DevOps team → #infrastructure-alerts

4. **Multiple webhooks** - Connect different teams/channels
   - Use different webhooks for different monitor groups
   - One webhook per channel per project

5. **Webhook security**
   - Don't share webhook URLs publicly
   - Treat them like passwords
   - Remove old webhooks you're not using
   - If compromised, remove connector and create new webhook

6. **Connector management**
   - Periodically review configured connectors
   - Remove unused connectors to keep channels clean
   - Update connector names to reflect their purpose

7. **Mention users/channels** (Advanced)
   - Configure Teams Power Automate to @mention users on critical alerts
   - Set up approval flows for incident response
   - Create automated runbooks triggered by Pingly alerts

---

## 📱 Mobile Notifications

Teams will send push notifications to your phone when monitors go down!

**Setup:**
1. Install Microsoft Teams mobile app (iOS/Android)
2. Sign in with your organization account
3. Enable notifications for Teams
4. Customize notification preferences for specific channels

**Notification Settings:**
- Teams → Settings → Notifications
- Choose notification preferences (banner, sound, badge)
- Enable "Channel mentions" for alert channels
- Set "Do Not Disturb" hours if needed

---

## 🔗 Integration with Microsoft 365

Teams integrates seamlessly with other Microsoft 365 services:

1. **Power Automate** - Create automated workflows
   - Trigger actions when Pingly sends alerts
   - Create tickets in Azure DevOps
   - Send emails to specific people
   - Post to multiple channels

2. **SharePoint** - Document incidents
   - Automatically log alerts to SharePoint lists
   - Create incident reports

3. **Planner** - Task management
   - Auto-create tasks when monitors go down
   - Assign to team members

4. **Azure DevOps** - Development workflow
   - Create work items for incidents
   - Link to deployment pipelines

---

## ❓ Common Questions

**Q: Can I use the same webhook for multiple Pingly accounts?**
A: Yes! Multiple users can use the same webhook URL.

**Q: Will I get spammed with notifications?**
A: No! Pingly only sends ONE notification when a monitor goes from UP → DOWN. It won't spam you while it's down.

**Q: Can I customize the notification format?**
A: Not yet, but coming soon! For now, you get a standard MessageCard format.

**Q: What if I remove the connector in Teams?**
A: Notifications will stop. Just create a new webhook connector and update it in Pingly.

**Q: Can I send to multiple Teams channels?**
A: Not yet, but coming soon! For now, one webhook per account. Workaround: Create webhooks in multiple channels and rotate them, or use Power Automate to forward messages.

**Q: Does this work with guest users?**
A: Yes, if the guest user has permission to view the channel where the webhook is configured.

**Q: Can I use this in Teams free version?**
A: Yes! Incoming Webhooks work in all Teams plans including the free version.

**Q: How do I change the notification channel?**
A: You need to create a new webhook connector in the new channel and update it in Pingly. Teams doesn't allow changing the channel of an existing webhook.

**Q: What's the difference between MessageCard and Adaptive Card?**
A: Pingly currently uses MessageCard format (O365 Connector Card) which is simple and widely supported. Adaptive Cards are more advanced but require different setup. We may add Adaptive Card support in the future.

**Q: Can I use this with Microsoft Teams for personal use?**
A: Incoming Webhooks are only available in Teams for work/school accounts, not personal Microsoft accounts.

---

## 🚀 Quick Start (TL;DR)

1. Teams → Channel → More options (...) → Connectors → Incoming Webhook → Configure → Name it → Create → Copy URL
2. Pingly → Integrations → Teams → Paste URL → Add Webhook URL
3. Done!

---

## 🔗 Useful Links

- **Teams Incoming Webhooks Documentation:** https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook
- **MessageCard Reference:** https://learn.microsoft.com/en-us/outlook/actionable-messages/message-card-reference
- **Teams Connectors:** https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/what-are-webhooks-and-connectors
- **Power Automate with Teams:** https://powerautomate.microsoft.com/connectors/details/shared_teams/microsoft-teams/

---

## 🔐 Security & Compliance

Microsoft Teams webhooks are enterprise-ready:

- **Data Residency:** Messages stay in your organization's data region
- **Compliance:** Inherits your organization's compliance settings
- **Audit Logs:** Webhook messages are logged in Office 365 audit logs
- **DLP (Data Loss Prevention):** Can be controlled by organization policies
- **Retention:** Subject to your organization's retention policies

**Best Practices:**
- Don't post sensitive data (passwords, API keys) in webhook messages
- Use private channels for production alerts
- Review webhook access regularly
- Follow your organization's security policies

---

## 📊 Advanced: MessageCard Format

If you want to understand the format Pingly uses:

```json
{
  "@type": "MessageCard",
  "@context": "https://schema.org/extensions",
  "summary": "Monitor Alert",
  "themeColor": "D6001C",
  "title": "🚨 Monitor Alert",
  "sections": [{
    "activityTitle": "Your monitor has gone down",
    "activitySubtitle": "Please check your service",
    "facts": [
      {"name": "Monitor:", "value": "My Website"},
      {"name": "Status:", "value": "DOWN ❌"},
      {"name": "URL:", "value": "https://example.com"},
      {"name": "Error:", "value": "Connection timeout"},
      {"name": "Time:", "value": "1/26/2024, 3:45:00 PM"}
    ]
  }]
}
```

---

**Happy monitoring! 🎉**

If you need help, check out the official Teams webhooks documentation:
https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook
