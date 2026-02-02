import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID, Query } from 'react-native-appwrite';
import { sendAchievementNotification, checkForMilestone } from './notifications';

// Types
export type Resolution = {
  $id: string;
  title: string;
  category: string;
  color: string;
  plannedMinutesPerDay: number;
  userId: string;
  isActive: boolean;
  startDate: string;
  icon?: string;
};

export type DailyLog = {
  $id: string;
  resolutionId: string;
  userId: string;
  date: string;
  actualMinutes: number;
  note?: string;
  loggedAt: string;
};

// Resolution Functions

/**
 * Get all active resolutions for a user
 */
export async function getActiveResolutions(userId: string): Promise<Resolution[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      [
        Query.equal('userId', userId),
        Query.equal('isActive', true),
        Query.orderDesc('startDate')
      ]
    );

    return response.documents.map(doc => ({
      $id: doc.$id,
      title: doc.title,
      category: doc.category,
      color: doc.color,
      plannedMinutesPerDay: doc.plannedMinutesPerDay,
      userId: doc.userId,
      isActive: doc.isActive,
      startDate: doc.startDate,
      icon: doc.icon,
    }));
  } catch (error) {
    console.error('Error fetching active resolutions:', error);
    return [];
  }
}

/**
 * Create a new resolution
 */
export async function createResolution(
  userId: string,
  data: {
    title: string;
    category: string;
    color: string;
    plannedMinutesPerDay: number;
    icon?: string;
  }
): Promise<Resolution> {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      ID.unique(),
      {
        userId,
        title: data.title,
        category: data.category,
        color: data.color,
        plannedMinutesPerDay: data.plannedMinutesPerDay,
        isActive: true,
        startDate: new Date().toISOString(),
        icon: data.icon || '📚',
      }
    );

    return {
      $id: doc.$id,
      title: doc.title,
      category: doc.category,
      color: doc.color,
      plannedMinutesPerDay: doc.plannedMinutesPerDay,
      userId: doc.userId,
      isActive: doc.isActive,
      startDate: doc.startDate,
      icon: doc.icon,
    };
  } catch (error) {
    console.error('Error creating resolution:', error);
    throw error;
  }
}

/**
 * Update a resolution
 */
export async function updateResolution(
  resolutionId: string,
  data: Partial<{
    title: string;
    category: string;
    color: string;
    plannedMinutesPerDay: number;
    isActive: boolean;
  }>
): Promise<void> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      resolutionId,
      data
    );
  } catch (error) {
    console.error('Error updating resolution:', error);
    throw error;
  }
}

/**
 * Delete a resolution
 */
export async function deleteResolution(resolutionId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );
  } catch (error) {
    console.error('Error deleting resolution:', error);
    throw error;
  }
}

// Daily Log Functions

/**
 * Get today's logs for a user
 */
export async function getTodayLogs(userId: string): Promise<DailyLog[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal('userId', userId),
        Query.equal('date', today)
      ]
    );

    return response.documents.map(doc => ({
      $id: doc.$id,
      resolutionId: doc.resolutionId,
      userId: doc.userId,
      date: doc.date,
      actualMinutes: doc.actualMinutes,
      note: doc.note,
      loggedAt: doc.loggedAt,
    }));
  } catch (error) {
    console.error('Error fetching today logs:', error);
    return [];
  }
}

/**
 * Get logs for a specific resolution
 */
export async function getResolutionLogs(
  userId: string,
  resolutionId: string,
  limit: number = 30
): Promise<DailyLog[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal('userId', userId),
        Query.equal('resolutionId', resolutionId),
        Query.orderDesc('date'),
        Query.limit(limit)
      ]
    );

    return response.documents.map(doc => ({
      $id: doc.$id,
      resolutionId: doc.resolutionId,
      userId: doc.userId,
      date: doc.date,
      actualMinutes: doc.actualMinutes,
      note: doc.note,
      loggedAt: doc.loggedAt,
    }));
  } catch (error) {
    console.error('Error fetching resolution logs:', error);
    return [];
  }
}

/**
 * Log time for a resolution
 */
export async function logTime(
  userId: string,
  resolutionId: string,
  actualMinutes: number,
  note?: string
): Promise<DailyLog> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if log already exists for today
    const existingLogs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal('userId', userId),
        Query.equal('resolutionId', resolutionId),
        Query.equal('date', today)
      ]
    );

    let doc;
    if (existingLogs.documents.length > 0) {
      // Update existing log
      doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        existingLogs.documents[0].$id,
        {
          actualMinutes,
          note: note || null,
          loggedAt: new Date().toISOString(),
        }
      );
    } else {
      // Create new log
      doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        ID.unique(),
        {
          userId,
          resolutionId,
          date: today,
          actualMinutes,
          note: note || null,
          loggedAt: new Date().toISOString(),
        }
      );
    }

    // Check for milestone achievements and send notification
    try {
      const streak = await calculateStreak(userId, resolutionId);
      const milestone = checkForMilestone(streak);
      if (milestone) {
        // Get resolution title for notification
        const resolution = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.RESOLUTIONS,
          resolutionId
        );
        await sendAchievementNotification(resolution.title, milestone);
      }
    } catch (notifError) {
      console.log('Error sending achievement notification:', notifError);
    }

    return {
      $id: doc.$id,
      resolutionId: doc.resolutionId,
      userId: doc.userId,
      date: doc.date,
      actualMinutes: doc.actualMinutes,
      note: doc.note,
      loggedAt: doc.loggedAt,
    };
  } catch (error) {
    console.error('Error logging time:', error);
    throw error;
  }
}

/**
 * Calculate streak for a resolution
 * A streak is consecutive days where ANY activity was logged (actualMinutes > 0)
 * This encourages consistency over perfection - showing up is what matters!
 */
export async function calculateStreak(
  userId: string,
  resolutionId: string
): Promise<number> {
  try {
    const resolution = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );

    const startDate = new Date(resolution.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all logs for this resolution, sorted by date descending
    const logs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal('userId', userId),
        Query.equal('resolutionId', resolutionId),
        Query.orderDesc('date'),
        Query.limit(100), // Last 100 days should be enough
      ]
    );

    if (logs.documents.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date(today);

    // Start from today and go backwards
    for (let i = 0; i < 100; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];

      // Find log for this date
      const log = logs.documents.find((l) => l.date === dateStr);

      // Streak continues if ANY activity was logged (even 1 minute counts!)
      if (log && log.actualMinutes > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today.toISOString().split('T')[0]) {
        // If today is incomplete, don't break the streak yet
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        // Streak is broken
        break;
      }

      // Don't go before the resolution start date
      if (checkDate < startDate) break;
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

/**
 * Get logs for a specific date range
 */
export async function getLogsInRange(
  userId: string,
  resolutionId: string,
  startDate: string,
  endDate: string
): Promise<DailyLog[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal('userId', userId),
        Query.equal('resolutionId', resolutionId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderDesc('date'),
      ]
    );

    return response.documents.map((doc) => ({
      $id: doc.$id,
      resolutionId: doc.resolutionId,
      userId: doc.userId,
      date: doc.date,
      actualMinutes: doc.actualMinutes,
      note: doc.note,
      loggedAt: doc.loggedAt,
    }));
  } catch (error) {
    console.error('Error fetching logs in range:', error);
    return [];
  }
}

/**
 * Get all logs for a resolution (for history view)
 */
export async function getAllResolutionLogs(
  userId: string,
  resolutionId: string
): Promise<DailyLog[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal('userId', userId),
        Query.equal('resolutionId', resolutionId),
        Query.orderDesc('date'),
        Query.limit(100),
      ]
    );

    return response.documents.map((doc) => ({
      $id: doc.$id,
      resolutionId: doc.resolutionId,
      userId: doc.userId,
      date: doc.date,
      actualMinutes: doc.actualMinutes,
      note: doc.note,
      loggedAt: doc.loggedAt,
    }));
  } catch (error) {
    console.error('Error fetching all resolution logs:', error);
    return [];
  }
}

/**
 * Get total stats for a user
 */
export async function getUserStats(userId: string): Promise<{
  totalResolutions: number;
  activeResolutions: number;
  totalMinutesLogged: number;
  totalDaysLogged: number;
  longestStreak: number;
}> {
  try {
    const [allResolutions, allLogs] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RESOLUTIONS,
        [Query.equal('userId', userId)]
      ),
      databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        [Query.equal('userId', userId), Query.limit(1000)]
      ),
    ]);

    const activeResolutions = allResolutions.documents.filter(
      (r) => r.isActive
    ).length;

    const totalMinutesLogged = allLogs.documents.reduce(
      (sum, log) => sum + log.actualMinutes,
      0
    );

    // Get unique dates
    const uniqueDates = new Set(allLogs.documents.map((log) => log.date));
    const totalDaysLogged = uniqueDates.size;

    // Calculate longest streak (simplified - you can improve this)
    let longestStreak = 0;
    for (const resolution of allResolutions.documents) {
      const streak = await calculateStreak(userId, resolution.$id);
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    }

    return {
      totalResolutions: allResolutions.documents.length,
      activeResolutions,
      totalMinutesLogged,
      totalDaysLogged,
      longestStreak,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalResolutions: 0,
      activeResolutions: 0,
      totalMinutesLogged: 0,
      totalDaysLogged: 0,
      longestStreak: 0,
    };
  }
}