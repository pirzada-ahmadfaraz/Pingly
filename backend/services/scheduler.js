import cron from 'node-cron';
import { checkAllMonitors } from './monitoringService.js';

/**
 * Initialize monitoring cron jobs
 */
export function initializeScheduler(db) {
  console.log('🕐 Initializing monitoring scheduler...');

  // Run every 1 minute to check monitors
  // The Monitor.getMonitorsToCheck() function filters based on each monitor's frequency
  const task = cron.schedule('* * * * *', async () => {
    const now = new Date();
    console.log(`\n⏰ Cron tick at ${now.toLocaleTimeString()}`);
    await checkAllMonitors(db);
  });

  // Run immediately on startup after 10 seconds
  setTimeout(() => {
    console.log('\n🚀 Running initial monitor checks...');
    checkAllMonitors(db);
  }, 10000);

  console.log('✓ Monitoring scheduler initialized (checks every 1 minute)');
  console.log('   Monitors will be checked based on their individual frequency settings');

  return task;
}

/**
 * Stop the scheduler (for graceful shutdown)
 */
export function stopScheduler(task) {
  if (task) {
    task.stop();
    console.log('Monitoring scheduler stopped');
  }
}
