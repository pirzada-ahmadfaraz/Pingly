import { ObjectId } from 'mongodb';

export class Monitor {
  static collectionName = 'monitors';

  /**
   * Create a new monitor
   */
  static async create(db, monitorData) {
    const monitor = {
      userId: new ObjectId(monitorData.userId),
      name: monitorData.name,
      type: monitorData.type, // 'http' or 'ping'
      url: monitorData.url, // for HTTP monitors
      ipAddress: monitorData.ipAddress, // for Ping monitors
      frequency: monitorData.frequency || '5min', // '1min', '5min', '10min'
      locations: monitorData.locations || ['europe-west'],
      notifyOnFailure: monitorData.notifyOnFailure !== false,
      status: 'active', // 'active', 'paused', 'down', 'up'
      lastStatus: null, // 'up' or 'down'
      lastCheckedAt: null,
      lastIncidentAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(this.collectionName).insertOne(monitor);
    return { ...monitor, _id: result.insertedId };
  }

  /**
   * Find monitors by user ID
   */
  static async findByUserId(db, userId) {
    return db.collection(this.collectionName)
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Find monitor by ID
   */
  static async findById(db, monitorId) {
    return db.collection(this.collectionName).findOne({
      _id: new ObjectId(monitorId)
    });
  }

  /**
   * Find all active monitors (for cron job)
   */
  static async findActiveMonitors(db) {
    return db.collection(this.collectionName)
      .find({ status: { $ne: 'paused' } })
      .toArray();
  }

  /**
   * Update monitor
   */
  static async update(db, monitorId, updateData) {
    const result = await db.collection(this.collectionName).findOneAndUpdate(
      { _id: new ObjectId(monitorId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  /**
   * Update monitor status after check
   */
  static async updateStatus(db, monitorId, statusData) {
    return db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(monitorId) },
      {
        $set: {
          lastStatus: statusData.status,
          lastCheckedAt: new Date(),
          ...(statusData.status === 'down' && { lastIncidentAt: new Date() }),
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Delete monitor
   */
  static async delete(db, monitorId) {
    return db.collection(this.collectionName).deleteOne({
      _id: new ObjectId(monitorId)
    });
  }

  /**
   * Pause/Resume monitor
   */
  static async togglePause(db, monitorId, isPaused) {
    return db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(monitorId) },
      {
        $set: {
          status: isPaused ? 'paused' : 'active',
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Get monitors that need to be checked based on frequency
   */
  static async getMonitorsToCheck(db) {
    const now = Date.now();
    const monitors = await this.findActiveMonitors(db);

    console.log(`🔍 Found ${monitors.length} active monitors`);

    const monitorsToCheck = monitors.filter(monitor => {
      // Always check if never checked before
      if (!monitor.lastCheckedAt) {
        console.log(`📋 ${monitor.name}: Never checked before - will check`);
        return true;
      }

      const frequencyMs = {
        '1min': 60 * 1000,
        '5min': 5 * 60 * 1000,
        '10min': 10 * 60 * 1000
      }[monitor.frequency] || 5 * 60 * 1000;

      const lastCheckTime = new Date(monitor.lastCheckedAt).getTime();
      const timeSinceLastCheck = now - lastCheckTime;

      // Check if enough time has passed (with 10 second tolerance)
      const shouldCheck = timeSinceLastCheck >= (frequencyMs - 10000);
      
      if (shouldCheck) {
        console.log(`📋 ${monitor.name}: ${Math.round(timeSinceLastCheck/1000)}s since last check (${monitor.frequency}) - will check`);
      } else {
        console.log(`⏳ ${monitor.name}: ${Math.round(timeSinceLastCheck/1000)}s since last check (${monitor.frequency}) - waiting`);
      }
      
      return shouldCheck;
    });

    console.log(`📋 ${monitorsToCheck.length} monitors need checking`);
    return monitorsToCheck;
  }
}
