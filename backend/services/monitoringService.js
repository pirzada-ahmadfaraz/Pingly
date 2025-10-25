import axios from 'axios';
import { Monitor } from '../models/Monitor.js';
import { MonitorCheck } from '../models/MonitorCheck.js';

/**
 * Helper function to send Telegram messages
 */
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

    // Check if status changed from up to down
    const statusChanged = monitor.lastStatus === 'up' && checkResult.status === 'down';

    // Update monitor status
    await Monitor.updateStatus(db, monitor._id, {
      status: checkResult.status,
    });

    // Send Telegram notification if monitor went down
    if (statusChanged && monitor.notifyOnFailure) {
      await sendNotification(db, monitor, checkResult);
    }

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
 * Send notification when monitor goes down
 */
export async function sendNotification(db, monitor, checkResult) {
  console.log(`📧 Sending notification: Monitor "${monitor.name}" is ${checkResult.status}`);

  try {
    // Get user's integrations
    const user = await db.collection('users').findOne({ _id: monitor.userId });

    if (!user) {
      console.error('User not found for monitor:', monitor._id);
      return;
    }

    // Send Telegram notification if connected
    if (user.telegram?.chatId) {
      const message = `
🚨 <b>Monitor Alert</b>

<b>Monitor:</b> ${monitor.name}
<b>Status:</b> DOWN ❌
<b>URL:</b> ${monitor.url || monitor.ipAddress}
<b>Error:</b> ${checkResult.errorMessage || 'Unknown error'}
<b>Time:</b> ${new Date().toLocaleString()}

Your monitor has gone down. Please check your service.
      `.trim();

      await sendTelegramMessage(user.telegram.chatId, message);
      console.log(`✅ Telegram notification sent to @${user.telegram.username}`);
    }

    // TODO: Add email notifications here
    // if (user.additionalEmails && user.additionalEmails.length > 0) {
    //   await sendEmailNotification(user.additionalEmails, monitor, checkResult);
    // }

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
