import { ObjectId } from 'mongodb';

export class MonitorCheck {
  static collectionName = 'monitor_checks';

  /**
   * Create a new monitor check record
   */
  static async create(db, checkData) {
    const check = {
      monitorId: new ObjectId(checkData.monitorId),
      status: checkData.status, // 'up' or 'down'
      responseTime: checkData.responseTime, // in milliseconds, null if down
      statusCode: checkData.statusCode, // HTTP status code, null if error
      location: checkData.location || 'europe-west',
      errorMessage: checkData.errorMessage || null,
      timestamp: new Date(),
    };

    const result = await db.collection(this.collectionName).insertOne(check);
    return { ...check, _id: result.insertedId };
  }

  /**
   * Get checks for a specific monitor
   */
  static async findByMonitorId(db, monitorId, options = {}) {
    const {
      limit = 100,
      startDate = null,
      endDate = null,
    } = options;

    const query = { monitorId: new ObjectId(monitorId) };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    return db.collection(this.collectionName)
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get checks for last 24 hours
   */
  static async getLast24Hours(db, monitorId) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return db.collection(this.collectionName)
      .find({
        monitorId: new ObjectId(monitorId),
        timestamp: { $gte: twentyFourHoursAgo }
      })
      .sort({ timestamp: 1 })
      .toArray();
  }

  /**
   * Get uptime percentage for a monitor
   */
  static async getUptimePercentage(db, monitorId, hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const checks = await db.collection(this.collectionName)
      .find({
        monitorId: new ObjectId(monitorId),
        timestamp: { $gte: startTime }
      })
      .toArray();

    if (checks.length === 0) return 0;

    const upChecks = checks.filter(check => check.status === 'up').length;
    return ((upChecks / checks.length) * 100).toFixed(2);
  }

  /**
   * Get incident count for a time period
   */
  static async getIncidentCount(db, monitorId, hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Count transitions from 'up' to 'down' (incidents)
    const checks = await db.collection(this.collectionName)
      .find({
        monitorId: new ObjectId(monitorId),
        timestamp: { $gte: startTime }
      })
      .sort({ timestamp: 1 })
      .toArray();

    let incidents = 0;
    let previousStatus = 'up';

    for (const check of checks) {
      if (previousStatus === 'up' && check.status === 'down') {
        incidents++;
      }
      previousStatus = check.status;
    }

    return incidents;
  }

  /**
   * Get average response time
   */
  static async getAverageResponseTime(db, monitorId, hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await db.collection(this.collectionName).aggregate([
      {
        $match: {
          monitorId: new ObjectId(monitorId),
          timestamp: { $gte: startTime },
          status: 'up',
          responseTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]).toArray();

    return result[0]?.avgResponseTime || 0;
  }

  /**
   * Delete old checks (cleanup)
   */
  static async deleteOlderThan(db, days = 30) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return db.collection(this.collectionName).deleteMany({
      timestamp: { $lt: cutoffDate }
    });
  }

  /**
   * Get latest check for a monitor
   */
  static async getLatestCheck(db, monitorId) {
    return db.collection(this.collectionName)
      .findOne(
        { monitorId: new ObjectId(monitorId) },
        { sort: { timestamp: -1 } }
      );
  }

  /**
   * Get days without incidents
   */
  static async getDaysWithoutIncidents(db, monitorId) {
    const latestIncident = await db.collection(this.collectionName)
      .findOne(
        {
          monitorId: new ObjectId(monitorId),
          status: 'down'
        },
        { sort: { timestamp: -1 } }
      );

    if (!latestIncident) {
      // No incidents ever recorded, check when monitor was created
      const monitor = await db.collection('monitors').findOne({
        _id: new ObjectId(monitorId)
      });

      if (!monitor) return 0;

      const daysSinceCreation = Math.floor(
        (Date.now() - monitor.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceCreation;
    }

    const daysSinceIncident = Math.floor(
      (Date.now() - latestIncident.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceIncident;
  }
}
