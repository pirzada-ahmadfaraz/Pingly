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
  let checkResult;

  if (monitor.type === 'http') {
    checkResult = await checkHttpMonitor(monitor);
  } else if (monitor.type === 'ping') {
    checkResult = await checkPingMonitor(monitor);
  } else {
    console.error(`❌ Unknown monitor type: ${monitor.type}`);
    return;
  }

  // Check if a check was just saved (prevent duplicates within 30 seconds)
  const recentCheck = await db.collection('monitor_checks').findOne(
    {
      monitorId: monitor._id,
      timestamp: { $gte: new Date(Date.now() - 30000) }
    },
    { sort: { timestamp: -1 } }
  );

  // Only save if no recent check exists
  if (!recentCheck) {
    await MonitorCheck.create(db, {
      monitorId: monitor._id,
      status: checkResult.status,
      responseTime: checkResult.responseTime,
      statusCode: checkResult.statusCode,
      location: monitor.locations[0] || 'default',
      errorMessage: checkResult.errorMessage,
    });

    // Update monitor status
    await Monitor.updateStatus(db, monitor._id, {
      status: checkResult.status,
    });

    const emoji = checkResult.status === 'up' ? '✅' : '❌';
    console.log(`   ${emoji} ${monitor.name} - ${checkResult.responseTime || 'N/A'}ms`);
  }

  return checkResult;
}

/**
 * Check all monitors that are due for checking
 */
export async function checkAllMonitors(db) {
  try {
    const monitorsToCheck = await Monitor.getMonitorsToCheck(db);

    if (monitorsToCheck.length === 0) {
      console.log('⏰ No monitors need checking right now');
      return; // Silently skip if no monitors need checking
    }

    const now = new Date().toLocaleTimeString();
    console.log(`\n⏰ ${now} - Checking ${monitorsToCheck.length} monitor(s):`);

    // Check all monitors in parallel
    const checkPromises = monitorsToCheck.map(monitor =>
      checkMonitor(db, monitor).catch(error => {
        console.error(`❌ Error checking ${monitor.name}:`, error.message);
      })
    );

    await Promise.all(checkPromises);
    console.log(`✅ Checks complete\n`);

  } catch (error) {
    console.error('❌ Error in checkAllMonitors:', error.message);
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
