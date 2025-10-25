# Free Cron Service Setup Guide

We're using **external cron services** instead of Vercel Cron to avoid free tier limitations. These services will ping your endpoint every 5 minutes for FREE, forever!

## ✅ Recommended: Cron-Job.org (100% Free)

### Why Cron-Job.org?
- ✅ Completely FREE forever
- ✅ Unlimited cron jobs
- ✅ Runs every 1 minute minimum
- ✅ Email notifications on failures
- ✅ Execution history
- ✅ Very reliable (99.9% uptime)

### Setup Steps (5 minutes)

#### Step 1: Sign Up

1. Go to: https://console.cron-job.org/signup
2. Enter your email and create a password
3. Verify your email
4. Login at: https://console.cron-job.org/login

#### Step 2: Create Your First Cron Job

1. Click **"Create cronjob"** button

2. Fill in the form:
   - **Title:** `Pingly Monitor Checks`
   - **Address (URL):** `https://pingly-one.vercel.app/api/cron/check-monitors`
   - **Schedule:**
     - Select: "Every 5 minutes" from dropdown
     - Or customize: `*/5 * * * *`
   - **Request method:** GET
   - **Advanced settings (optional):**
     - Timeout: 30 seconds
     - Notification: Email on failure

3. Click **"Create cronjob"**

#### Step 3: Test It

1. Click the **"Run now"** button next to your cron job
2. Wait a few seconds
3. Check **"Execution history"** - should show success (200 OK)
4. Go to your Pingly app and verify monitors are being checked

#### Step 4: Enable Notifications (Optional)

1. Click on your cron job
2. Go to **"Notifications"** tab
3. Enable "Email on failure"
4. Now you'll get an email if the cron job fails

### ✅ Done! Your monitoring is now running every 5 minutes!

---

## Alternative Free Options

### Option 2: UptimeRobot (Also 100% Free)

**Why UptimeRobot?**
- ✅ Free plan: 50 monitors
- ✅ 5-minute check interval
- ✅ Email/SMS alerts
- ✅ Status page included

**Setup:**

1. Sign up: https://uptimerobot.com/signUp
2. Add New Monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: `Pingly Cron`
   - URL: `https://pingly-one.vercel.app/api/cron/check-monitors`
   - Monitoring Interval: 5 minutes
3. Save

**Bonus:** UptimeRobot also monitors if your entire Pingly app goes down!

### Option 3: EasyCron (Free Tier)

**Why EasyCron?**
- ✅ Free plan available
- ✅ 20 cron jobs
- ✅ Every 1 minute possible
- ✅ Web interface

**Setup:**

1. Sign up: https://www.easycron.com/user/register
2. Create New Cron Job:
   - URL: `https://pingly-one.vercel.app/api/cron/check-monitors`
   - Cron Expression: `*/5 * * * *`
   - Name: `Pingly Monitors`
3. Enable

### Option 4: Cronhub (Free Tier)

**Setup:**

1. Sign up: https://cronhub.io/
2. Create Monitor
3. Get your ping URL
4. Add to cron-job.org to ping Cronhub (meta-monitoring!)

---

## 🔒 Security: Add Secret Key (Optional but Recommended)

To prevent unauthorized people from triggering your cron endpoint:

### Step 1: Generate Secret

Run in terminal:
```bash
openssl rand -base64 32
```

Example output: `abc123xyz789secretkey`

### Step 2: Add to Vercel

1. Go to: https://vercel.com/ahmad-farazs-projects-4082d06e/pinglyy/settings/environment-variables
2. Add:
   - Key: `CRON_SECRET`
   - Value: `abc123xyz789secretkey` (use your generated value)
   - Environment: All
3. Save and redeploy

### Step 3: Update Cron Service URL

Change your cron job URL to include the secret:

**Before:**
```
https://pingly-one.vercel.app/api/cron/check-monitors
```

**After:**
```
https://pingly-one.vercel.app/api/cron/check-monitors?secret=abc123xyz789secretkey
```

Now only requests with the correct secret will work!

---

## 📊 Monitoring Your Cron Jobs

### Check if it's working:

1. **Cron-job.org Dashboard:**
   - View execution history
   - See success/failure rate
   - Check response times

2. **Your Pingly App:**
   - Monitors should show updated "Last checked" times
   - Graphs should update with new data points

3. **Vercel Logs:**
   - Go to: https://vercel.com/ahmad-farazs-projects-4082d06e/pinglyy
   - Click "Logs" tab
   - Look for: `🕐 Cron job triggered at...`

---

## 🔧 Troubleshooting

### Cron job shows "Failed"

**Check the error message:**
- 404: Backend not deployed or URL wrong
- 500: Backend error - check Vercel logs
- Timeout: Your endpoint is taking too long

**Solutions:**
1. Verify URL is correct: `https://pingly-one.vercel.app/api/cron/check-monitors`
2. Test manually: Visit the URL in your browser
3. Check Vercel deployment status
4. Increase timeout in cron service settings

### Not checking monitors

**Possible causes:**
1. MongoDB not connected
2. No monitors created yet
3. Monitors are paused
4. Cron job not running

**Debug:**
```bash
# Test the endpoint manually
curl https://pingly-one.vercel.app/api/cron/check-monitors

# Should return:
# {"success":true,"message":"Cron job executed successfully","timestamp":"..."}
```

### Monitors showing old data

1. Check cron-job.org execution history
2. Verify cron job is enabled
3. Check if last execution was successful
4. Look at Vercel function logs

---

## 📈 Comparison Table

| Service | Free Tier | Min Interval | Reliability | Extras |
|---------|-----------|--------------|-------------|--------|
| **Cron-Job.org** | Unlimited | 1 minute | ⭐⭐⭐⭐⭐ | Execution history, email alerts |
| **UptimeRobot** | 50 monitors | 5 minutes | ⭐⭐⭐⭐⭐ | Status page, multi-channel alerts |
| **EasyCron** | 20 jobs | 1 minute | ⭐⭐⭐⭐ | API access |
| **Vercel Cron** | Limited | 1 minute | ⭐⭐⭐⭐⭐ | Native integration |

**Recommendation:** Use **Cron-Job.org** - it's the most generous free tier and works perfectly!

---

## 🚀 Quick Start (TL;DR)

1. **Deploy your backend** (if not already done)
   ```bash
   cd backend
   git add .
   git commit -m "Setup external cron"
   git push
   ```

2. **Sign up at Cron-Job.org:** https://console.cron-job.org/signup

3. **Create cron job:**
   - URL: `https://pingly-one.vercel.app/api/cron/check-monitors`
   - Schedule: Every 5 minutes (`*/5 * * * *`)

4. **Test it:** Click "Run now" button

5. **Done!** Your monitors will be checked every 5 minutes automatically

---

## 💡 Pro Tips

1. **Use UptimeRobot as backup:** Monitor both your app AND cron-job.org to ensure maximum uptime

2. **Set up email alerts:** Get notified if cron job fails

3. **Check execution history:** Review in cron-job.org dashboard regularly

4. **Monitor the monitor:** Use UptimeRobot to monitor your cron endpoint health

5. **Keep it simple:** 5-minute intervals are perfect - don't go shorter unless needed

---

**Questions?** Test your cron endpoint:
```bash
curl https://pingly-one.vercel.app/api/cron/check-monitors
```

Should return:
```json
{"success":true,"message":"Cron job executed successfully","timestamp":"2024-01-01T12:00:00.000Z"}
```

Happy monitoring! 🎉
