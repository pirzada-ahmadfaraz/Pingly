import axios from 'axios';
import { Monitor } from '../models/Monitor.js';
import { MonitorCheck } from '../models/MonitorCheck.js';

/**
 * Check a single HTTP monitor
 */
async function checkHttpMonitor(monitor) {
  const startTime = Date.now();

  try {
    const response = await axios.get(monitor.url, {
      timeout: 30000, // 30 second timeout
      validateStatus: null, // Don't throw on any status code
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Pingly-Monitor/1.0'
      }
    });

    const responseTime = Date.now() - startTime;

    // Consider 2xx and 3xx status codes as "up"
    const isUp = response.status >= 200 && response.status < 400;

    return {
      status: isUp ? 'up' : 'down',
      responseTime: responseTime,
      statusCode: response.status,
      errorMessage: isUp ? null : `HTTP ${response.status}`,
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'down',
      responseTime: null,
      statusCode: null,
      errorMessage: error.code || error.message || 'Unknown error',
    };
  }
}

/**
 * Check a single Ping monitor (using HTTP HEAD request)
 */
async function checkPingMonitor(monitor) {
  const startTime = Date.now();

  try {
    // For ping monitors, we'll use a simple HTTP request to check connectivity
    // In production, you might want to use actual ICMP ping
    const url = monitor.ipAddress.startsWith('http')
      ? monitor.ipAddress
      : `http://${monitor.ipAddress}`;

    const response = await axios.head(url, {
      timeout: 10000, // 10 second timeout for ping
      validateStatus: null,
      headers: {
        'User-Agent': 'Pingly-Monitor/1.0'
      }
    });

    const responseTime = Date.now() - startTime;
    const isUp = response.status >= 200 && response.status < 500; // More lenient for ping

    return {
      status: isUp ? 'up' : 'down',
      responseTime: responseTime,
      statusCode: response.status,
      errorMessage: isUp ? null : `Unreachable`,
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'down',
      responseTime: null,
      statusCode: null,
      errorMessage: error.code || error.message || 'Host unreachable',
    };
  }
}

/**
 * Check a single monitor and save the result
 */
export async function checkMonitor(db, monitor) {
  const startTime = Date.now();
  console.log(`\n🔎 Checking: ${monitor.name} (${monitor.type})`);
  console.log(`   URL: ${monitor.url || monitor.ipAddress}`);

  let checkResult;

  if (monitor.type === 'http') {
    checkResult = await checkHttpMonitor(monitor);
  } else if (monitor.type === 'ping') {
    checkResult = await checkPingMonitor(monitor);
  } else {
    console.error(`❌ Unknown monitor type: ${monitor.type}`);
    return;
  }

  // Save check result to database
  await MonitorCheck.create(db, {
    monitorId: monitor._id,
    status: checkResult.status,
    responseTime: checkResult.responseTime,
    statusCode: checkResult.statusCode,
    location: monitor.locations[0] || 'default', // Use first location
    errorMessage: checkResult.errorMessage,
  });

  // Update monitor status
  await Monitor.updateStatus(db, monitor._id, {
    status: checkResult.status,
  });

  const totalTime = Date.now() - startTime;
  const statusEmoji = checkResult.status === 'up' ? '✅' : '❌';
  console.log(`${statusEmoji} ${monitor.name}: ${checkResult.status.toUpperCase()}`);
  console.log(`   Response Time: ${checkResult.responseTime || 'N/A'}ms`);
  console.log(`   Status Code: ${checkResult.statusCode || 'N/A'}`);
  if (checkResult.errorMessage) {
    console.log(`   Error: ${checkResult.errorMessage}`);
  }
  console.log(`   Check Duration: ${totalTime}ms`);

  return checkResult;
}

/**
 * Check all monitors that are due for checking
 */
export async function checkAllMonitors(db) {
  try {
    const now = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Monitor Check Cycle Started`);
    console.log(`⏰ Time: ${now.toLocaleTimeString()}`);
    console.log(`${'='.repeat(60)}`);

    const monitorsToCheck = await Monitor.getMonitorsToCheck(db);

    if (monitorsToCheck.length === 0) {
      console.log('⏭️  No monitors need checking at this time.');
      console.log(`${'='.repeat(60)}\n`);
      return;
    }

    console.log(`📊 Found ${monitorsToCheck.length} monitor(s) due for checking:`);
    monitorsToCheck.forEach(m => {
      if (!m.lastCheckedAt) {
        console.log(`   • ${m.name} (${m.frequency}) - First check`);
      } else {
        const frequencyMs = {
          '1min': 60 * 1000,
          '5min': 5 * 60 * 1000,
          '10min': 10 * 60 * 1000
        }[m.frequency] || 5 * 60 * 1000;

        const lastCheckTime = new Date(m.lastCheckedAt);
        const nextCheckTime = new Date(lastCheckTime.getTime() + frequencyMs);
        const timeOverdue = Math.floor((now - nextCheckTime) / 1000);

        console.log(`   • ${m.name} (${m.frequency})`);
        console.log(`     Last: ${lastCheckTime.toLocaleTimeString()}`);
        console.log(`     Due: ${nextCheckTime.toLocaleTimeString()} ${timeOverdue > 0 ? `(${timeOverdue}s overdue)` : ''}`);
      }
    });

    // Check all monitors in parallel
    const checkPromises = monitorsToCheck.map(monitor =>
      checkMonitor(db, monitor).catch(error => {
        console.error(`❌ Error checking monitor ${monitor.name}:`, error);
      })
    );

    await Promise.all(checkPromises);

    console.log(`\n✅ Monitor Check Cycle Complete`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('❌ Error in checkAllMonitors:', error);
  }
}

/**
 * Send notification email (placeholder for future implementation)
 */
export async function sendNotification(monitor, checkResult) {
  // TODO: Implement email notification using Supabase or other service
  console.log(`📧 Notification: Monitor "${monitor.name}" is ${checkResult.status}`);

  // You can integrate with:
  // - Supabase for emails
  // - SendGrid
  // - AWS SES
  // - Nodemailer
}
