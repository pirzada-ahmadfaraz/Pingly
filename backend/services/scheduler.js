import cron from 'node-cron';
import { checkAllMonitors } from './monitoringService.js';

/**
 * Initialize monitoring cron jobs
 */
export function initializeScheduler(db) {
  console.log('🕐 Initializing monitoring scheduler...');

  // Run every 30 seconds to check monitors
  const task = cron.schedule('*/30 * * * * *', async () => {
    await checkAllMonitors(db);
  });

  // Run immediately on startup after 10 seconds
  setTimeout(() => {
    console.log('\n🚀 Running initial monitor checks...');
    checkAllMonitors(db);
  }, 10000);

  console.log('✓ Monitoring scheduler initialized (runs every 30 seconds)');

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
