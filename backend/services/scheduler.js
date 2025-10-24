import cron from 'node-cron';
import { checkAllMonitors } from './monitoringService.js';

/**
 * Initialize monitoring cron jobs
 */
export function initializeScheduler(db) {
  console.log('🕐 Initializing monitoring scheduler...');

  // Run every 1 minute to check all monitors
  // The Monitor.getMonitorsToCheck() function will filter based on frequency
  const task = cron.schedule('* * * * *', async () => {
    await checkAllMonitors(db);
  });

  // Optional: Run immediately on startup
  setTimeout(() => {
    console.log('Running initial monitor checks...');
    checkAllMonitors(db);
  }, 5000); // Wait 5 seconds after server start

  console.log('✓ Monitoring scheduler initialized (runs every 1 minute)');

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
