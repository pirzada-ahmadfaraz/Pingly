# How Pingly Monitoring Works - Complete Flow

## 📊 The Complete Journey (Step-by-Step)

### Step 1: User Creates a Monitor
```
User clicks "New Monitor" → Fills form → Submits
```

**What happens:**
1. Frontend sends POST request to `/api/monitors`
2. Backend creates monitor document in MongoDB `monitors` collection:
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  name: "My Website",
  type: "http",
  url: "https://example.com",
  frequency: "5min",
  status: "active",
  lastStatus: null,        // Will be "up" or "down" after first check
  lastCheckedAt: null,      // Will be updated after first check
  createdAt: new Date()
}
```

### Step 2: Cron Job Runs (Every 5 Minutes)

**External Service (cron-job.org):**
```
Every 5 minutes → Pings: https://pingly-one.vercel.app/api/cron/check-monitors
```

**Backend receives request:**
```javascript
// server.js line 570
app.get('/api/cron/check-monitors', async (req, res) => {
  await checkAllMonitors(db);  // This does the magic!
});
```

### Step 3: Get All Active Monitors

**In `monitoringService.js`:**
```javascript
// Line 138
export async function checkAllMonitors(db) {
  // 1. Get all monitors that need checking
  const monitorsToCheck = await Monitor.getMonitorsToCheck(db);

  // Example: Returns monitors where:
  // - status !== 'paused'
  // - lastCheckedAt is null OR
  // - (current_time - lastCheckedAt) >= frequency
}
```

**Example Output:**
```javascript
[
  {
    _id: ObjectId("abc123"),
    name: "My Website",
    url: "https://example.com",
    frequency: "5min",
    lastCheckedAt: "2024-01-01T12:00:00Z"  // 5 minutes ago
  },
  {
    _id: ObjectId("def456"),
    name: "My API",
    url: "https://api.example.com",
    frequency: "5min",
    lastCheckedAt: "2024-01-01T12:00:00Z"
  }
]
```

### Step 4: Check Each Monitor (The Core Logic)

**For each monitor, call `checkMonitor()`:**

```javascript
// Line 91
export async function checkMonitor(db, monitor) {
  let checkResult;

  // 1. Make HTTP request or Ping
  if (monitor.type === 'http') {
    checkResult = await checkHttpMonitor(monitor);
  } else if (monitor.type === 'ping') {
    checkResult = await checkPingMonitor(monitor);
  }

  // 2. Save the result
  // 3. Update monitor status
  // 4. Send notifications if down
}
```

#### 4a. Making the HTTP Request

```javascript
// Line 8
async function checkHttpMonitor(monitor) {
  const startTime = Date.now();  // Start timer

  try {
    // Make request to the user's website
    const response = await axios.get(monitor.url, {
      timeout: 30000,  // 30 second timeout
      validateStatus: null,
      headers: {
        'User-Agent': 'Pingly-Monitor/1.0'
      }
    });

    const responseTime = Date.now() - startTime;  // Calculate time

    // Check if status code is good (200-399)
    const isUp = response.status >= 200 && response.status < 400;

    return {
      status: isUp ? 'up' : 'down',
      responseTime: responseTime,      // e.g., 234ms
      statusCode: response.status,     // e.g., 200
      errorMessage: isUp ? null : `HTTP ${response.status}`
    };
  } catch (error) {
    // If request fails (timeout, DNS error, etc.)
    const responseTime = Date.now() - startTime;

    return {
      status: 'down',
      responseTime: null,
      statusCode: null,
      errorMessage: error.code || error.message  // e.g., "ECONNREFUSED"
    };
  }
}
```

**Example Result:**
```javascript
{
  status: 'up',
  responseTime: 234,        // 234 milliseconds
  statusCode: 200,
  errorMessage: null
}
```

### Step 5: Save Check Result to Database

```javascript
// Line 114
await MonitorCheck.create(db, {
  monitorId: monitor._id,
  status: 'up',
  responseTime: 234,
  statusCode: 200,
  location: 'europe-west',
  errorMessage: null,
  timestamp: new Date()  // Right now
});
```

**Stored in `monitor_checks` collection:**
```javascript
{
  _id: ObjectId("xyz789"),
  monitorId: ObjectId("abc123"),
  status: "up",
  responseTime: 234,
  statusCode: 200,
  location: "europe-west",
  errorMessage: null,
  timestamp: "2024-01-01T12:05:00Z"
}
```

**This creates a data point for the graph!**

### Step 6: Update Monitor Status

```javascript
// Line 124
await Monitor.updateStatus(db, monitor._id, {
  status: checkResult.status
});
```

**Updates the monitor document:**
```javascript
{
  _id: ObjectId("abc123"),
  name: "My Website",
  url: "https://example.com",
  lastStatus: "up",                    // ← Updated!
  lastCheckedAt: "2024-01-01T12:05:00Z",  // ← Updated!
  updatedAt: "2024-01-01T12:05:00Z"
}
```

### Step 7: Send Notifications (If Monitor Went Down)

```javascript
// Line 125
// Check if status changed from up to down
const statusChanged = monitor.lastStatus === 'up' && checkResult.status === 'down';

if (statusChanged && monitor.notifyOnFailure) {
  await sendNotification(db, monitor, checkResult);
}
```

**If down, sends Telegram message:**
```
🚨 Monitor Alert

Monitor: My Website
Status: DOWN ❌
URL: https://example.com
Error: ECONNREFUSED
Time: 2024-01-01 12:05:00

Your monitor has gone down. Please check your service.
```

### Step 8: Frontend Gets Updated Data

**Frontend polls every 30 seconds:**

```javascript
// Dashboard.jsx line 59
useEffect(() => {
  const fetchMonitors = async () => {
    // GET /api/monitors
    const response = await fetch(`${BACKEND_URL}/api/monitors`);
    const data = await response.json();
    setMonitors(data.monitors);  // Update UI
  };

  fetchMonitors();
  const interval = setInterval(fetchMonitors, 30000);  // Every 30s
}, []);
```

**On Monitor Detail Page:**

```javascript
// MonitorDetail.jsx
useEffect(() => {
  // GET /api/monitors/:id
  // Gets: lastStatus, lastCheckedAt, etc.

  // GET /api/monitors/:id/checks
  // Gets: All check history for the graph
  const checks = await fetch(`${BACKEND_URL}/api/monitors/${id}/checks`);
  // Returns last 24 hours of checks
}, []);
```

### Step 9: Display on Graph

**Frontend processes check data:**

```javascript
// MonitorDetail.jsx line 89
const chartData = checks
  .slice()
  .reverse()
  .map(check => ({
    time: formatTime(check.timestamp),     // "12:05 PM"
    responseTime: check.responseTime,      // 234
    status: check.status                   // "up"
  }));

// Recharts displays this as a line graph!
```

**Graph shows:**
- X-axis: Time (12:00 PM, 12:05 PM, 12:10 PM, ...)
- Y-axis: Response time (234ms, 245ms, 198ms, ...)
- Points: Green if up, Red if down

---

## 🔄 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CREATES MONITOR                         │
│  "Monitor https://example.com every 5 minutes"                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │   MongoDB: monitors      │
          │  {                       │
          │    url: "example.com",   │
          │    frequency: "5min",    │
          │    lastCheckedAt: null   │
          │  }                       │
          └──────────┬───────────────┘
                     │
                     │ (Wait 5 minutes...)
                     │
                     ▼
      ┌──────────────────────────────────┐
      │   CRON-JOB.ORG (Every 5 min)    │
      │   Pings: /api/cron/check-monitors│
      └──────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────────┐
  │   Backend: checkAllMonitors()            │
  │   "Get all monitors that need checking"  │
  └──────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│   For each monitor:                        │
│   1. Make HTTP request to example.com      │
│   2. Measure response time (234ms)         │
│   3. Check status code (200 = up)          │
└────────────┬───────────────────────────────┘
             │
             ▼
  ┌─────────────────────────────────┐
  │   Save to monitor_checks:       │
  │   {                             │
  │     responseTime: 234,          │
  │     status: "up",               │
  │     timestamp: "12:05:00"       │
  │   }                             │
  └────────────┬────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │   Update monitor:        │
    │   lastStatus: "up"       │
    │   lastCheckedAt: now     │
    └────────────┬─────────────┘
                 │
                 ├─────► If DOWN → Send Telegram notification
                 │
                 ▼
      ┌─────────────────────────┐
      │   Frontend polls        │
      │   (every 30 seconds)    │
      │   GET /api/monitors/:id │
      │   GET /api/monitors/:id/checks │
      └────────────┬────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   Update UI:        │
         │   - Show status     │
         │   - Update graph    │
         │   - Show countdown  │
         └─────────────────────┘
```

---

## 📝 Key Concepts

### 1. **Two Collections in MongoDB**

**`monitors` collection:**
- Stores monitor configuration
- One document per monitor
- Updated with latest status

**`monitor_checks` collection:**
- Stores every check result
- Many documents per monitor
- Used for graphs and history

### 2. **Frequency Settings**

When you set frequency to "5min":
```javascript
{
  '1min': 60 * 1000,      // 60,000ms
  '5min': 5 * 60 * 1000,  // 300,000ms
  '10min': 10 * 60 * 1000 // 600,000ms
}
```

Monitor will be checked when:
```javascript
(current_time - lastCheckedAt) >= frequency
```

### 3. **Response Time Calculation**

```javascript
const startTime = Date.now();  // e.g., 1704110700000
await axios.get(url);
const endTime = Date.now();    // e.g., 1704110700234
const responseTime = endTime - startTime;  // 234ms
```

### 4. **Status Determination**

```javascript
// HTTP Status Codes
200-299: Success → UP ✅
300-399: Redirect → UP ✅
400-499: Client Error → DOWN ❌
500-599: Server Error → DOWN ❌
Timeout/DNS Error: → DOWN ❌
```

---

## 🎯 Example Timeline

```
12:00:00 - User creates monitor
12:00:01 - Monitor saved to database
12:05:00 - Cron job runs
12:05:01 - Check https://example.com (takes 234ms)
12:05:02 - Save result: 234ms, status: up
12:05:03 - Update monitor: lastCheckedAt
12:05:15 - Frontend polls and sees update
12:05:15 - Graph shows new point at 12:05 with 234ms
12:10:00 - Cron job runs again...
```

After 24 hours, you'll have:
- 288 data points (24 hours ÷ 5 minutes = 288)
- Complete graph showing response time trends
- History of all up/down events

---

## 🔍 What You See in the UI

### Monitor Card (Dashboard)
```
My Website          Type: HTTP      Frequency: 5min     Status: UP (99.5%)
Last checked: 2 minutes ago
```

### Monitor Detail Page
```
┌─────────────────────────────────────────┐
│  Currently Up For: 23h 45m             │
│  Next Check In: 2m 15s                 │
│  Last 24h Uptime: 99.5%                │
└─────────────────────────────────────────┘

     Response Time Graph
     ↑ (ms)
 300 │        ●
 200 │   ●  ●   ●  ●
 100 │ ●              ●
   0 └─────────────────────→ (time)
     12PM    3PM    6PM
```

---

## ❓ Common Questions

**Q: Why polling every 30 seconds on frontend?**
A: To show real-time updates without refreshing the page.

**Q: Why not WebSockets?**
A: Vercel serverless doesn't support persistent WebSocket connections.

**Q: What if cron-job.org goes down?**
A: Use multiple services (UptimeRobot as backup) or setup your own cron.

**Q: How long is data stored?**
A: Currently forever. You can add cleanup for old checks (>30 days).

**Q: Can I check more frequently than 5 minutes?**
A: Yes! Set cron-job.org to 1 minute and change monitor frequency.

---

**Now you understand how monitoring works! Ready to add Discord? 🎮**
