import { Router } from 'express';
import { Monitor } from '../models/Monitor.js';
import { MonitorCheck } from '../models/MonitorCheck.js';
import { checkMonitor } from '../services/monitoringService.js';

export function createMonitorRoutes(db) {
  const router = Router();

  /**
   * GET /api/monitors
   * Get all monitors for the authenticated user
   */
  router.get('/', async (req, res) => {
    try {
      const userId = req.user.userId; // From auth middleware
      const monitors = await Monitor.findByUserId(db, userId);

      // Add latest check info to each monitor
      const monitorsWithStats = await Promise.all(
        monitors.map(async (monitor) => {
          const latestCheck = await MonitorCheck.getLatestCheck(db, monitor._id);
          const uptimePercentage = await MonitorCheck.getUptimePercentage(db, monitor._id, 24);

          return {
            ...monitor,
            latestCheck,
            uptime24h: parseFloat(uptimePercentage),
          };
        })
      );

      res.json({
        success: true,
        monitors: monitorsWithStats,
      });
    } catch (error) {
      console.error('Get monitors error:', error);
      res.status(500).json({ error: 'Failed to fetch monitors' });
    }
  });

  /**
   * GET /api/monitors/:id
   * Get a single monitor with detailed stats
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const monitor = await Monitor.findById(db, id);

      if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
      }

      // Verify ownership
      if (monitor.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get stats
      const [
        latestCheck,
        uptimePercentage,
        incidentCount,
        avgResponseTime,
        daysWithoutIncidents
      ] = await Promise.all([
        MonitorCheck.getLatestCheck(db, monitor._id),
        MonitorCheck.getUptimePercentage(db, monitor._id, 24),
        MonitorCheck.getIncidentCount(db, monitor._id, 24),
        MonitorCheck.getAverageResponseTime(db, monitor._id, 24),
        MonitorCheck.getDaysWithoutIncidents(db, monitor._id)
      ]);

      res.json({
        success: true,
        monitor: {
          ...monitor,
          stats: {
            latestCheck,
            uptime24h: parseFloat(uptimePercentage),
            incidents24h: incidentCount,
            avgResponseTime: Math.round(avgResponseTime),
            daysWithoutIncidents,
          },
        },
      });
    } catch (error) {
      console.error('Get monitor error:', error);
      res.status(500).json({ error: 'Failed to fetch monitor' });
    }
  });

  /**
   * GET /api/monitors/:id/checks
   * Get check history for a monitor
   */
  router.get('/:id/checks', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { hours = 24, limit = 100 } = req.query;

      const monitor = await Monitor.findById(db, id);

      if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
      }

      if (monitor.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const checks = await MonitorCheck.findByMonitorId(db, id, {
        limit: parseInt(limit),
        startDate,
      });

      res.json({
        success: true,
        checks,
      });
    } catch (error) {
      console.error('Get checks error:', error);
      res.status(500).json({ error: 'Failed to fetch checks' });
    }
  });

  /**
   * POST /api/monitors
   * Create a new monitor
   */
  router.post('/', async (req, res) => {
    try {
      const userId = req.user.userId;
      const {
        name,
        type,
        url,
        ipAddress,
        frequency,
        locations,
        notifyOnFailure,
      } = req.body;

      // Validation
      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      if (type === 'http' && !url) {
        return res.status(400).json({ error: 'URL is required for HTTP monitors' });
      }

      if (type === 'ping' && !ipAddress) {
        return res.status(400).json({ error: 'IP address is required for Ping monitors' });
      }

      // Create monitor
      const monitor = await Monitor.create(db, {
        userId,
        name,
        type,
        url,
        ipAddress,
        frequency,
        locations,
        notifyOnFailure,
      });

      // Perform initial check
      checkMonitor(db, monitor).catch(error => {
        console.error('Initial check failed:', error);
      });

      res.status(201).json({
        success: true,
        monitor,
      });
    } catch (error) {
      console.error('Create monitor error:', error);
      res.status(500).json({ error: 'Failed to create monitor' });
    }
  });

  /**
   * PUT /api/monitors/:id
   * Update a monitor
   */
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const monitor = await Monitor.findById(db, id);

      if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
      }

      if (monitor.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.userId;
      delete updateData.createdAt;

      const updatedMonitor = await Monitor.update(db, id, updateData);

      res.json({
        success: true,
        monitor: updatedMonitor,
      });
    } catch (error) {
      console.error('Update monitor error:', error);
      res.status(500).json({ error: 'Failed to update monitor' });
    }
  });

  /**
   * POST /api/monitors/:id/pause
   * Pause or resume a monitor
   */
  router.post('/:id/pause', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { paused } = req.body;

      const monitor = await Monitor.findById(db, id);

      if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
      }

      if (monitor.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await Monitor.togglePause(db, id, paused);

      res.json({
        success: true,
        message: paused ? 'Monitor paused' : 'Monitor resumed',
      });
    } catch (error) {
      console.error('Pause monitor error:', error);
      res.status(500).json({ error: 'Failed to pause/resume monitor' });
    }
  });

  /**
   * DELETE /api/monitors/:id
   * Delete a monitor
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const monitor = await Monitor.findById(db, id);

      if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
      }

      if (monitor.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await Monitor.delete(db, id);

      // Optionally: Delete all associated checks
      // await db.collection('monitor_checks').deleteMany({ monitorId: new ObjectId(id) });

      res.json({
        success: true,
        message: 'Monitor deleted successfully',
      });
    } catch (error) {
      console.error('Delete monitor error:', error);
      res.status(500).json({ error: 'Failed to delete monitor' });
    }
  });

  return router;
}
