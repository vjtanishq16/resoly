import { ID, Query } from "react-native-appwrite";
import { databases, DATABASE_ID, COLLECTIONS } from "./appwrite";

// Resolution type
export type Resolution = {
  $id: string;
  title: string;
  category: "Learning" | "Health" | "Creative" | "Fitness" | "Mindful" | "Tech" | "Music";
  color: string;
  plannedMinutesPerDay: number;
  userId: string;
  isActive: boolean;
  startDate: string;
  icon?: string;
};

// Daily log type
export type DailyLog = {
  $id: string;
  resolutionId: string;
  userId: string;
  date: string;
  actualMinutes: number;
  note?: string;
  loggedAt: string;
};

// ============ RESOLUTIONS ============

// Get all active resolutions for user
export const getActiveResolutions = async (userId: string): Promise<Resolution[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      [
        Query.equal("userId", userId),
        Query.equal("isActive", true),
        Query.orderDesc("startDate"),
      ]
    );
    return response.documents as unknown as Resolution[];
  } catch (error) {
    console.error("Error fetching resolutions:", error);
    throw error;
  }
};

// Create a new resolution
export const createResolution = async (
  userId: string,
  data: {
    title: string;
    category: string;
    color: string;
    plannedMinutesPerDay: number;
    icon?: string;
  }
): Promise<Resolution> => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      ID.unique(),
      {
        userId,
        title: data.title,
        category: data.category,
        color: data.color,
        plannedMinutesPerDay: data.plannedMinutesPerDay,
        icon: data.icon || "📚",
        isActive: true,
        startDate: new Date().toISOString(),
      }
    );
    return response as unknown as Resolution;
  } catch (error) {
    console.error("Error creating resolution:", error);
    throw error;
  }
};

// Update resolution
export const updateResolution = async (
  resolutionId: string,
  data: Partial<Omit<Resolution, "$id" | "userId">>
): Promise<Resolution> => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      resolutionId,
      data
    );
    return response as unknown as Resolution;
  } catch (error) {
    console.error("Error updating resolution:", error);
    throw error;
  }
};

// Delete resolution (soft delete - set isActive to false)
export const deleteResolution = async (resolutionId: string): Promise<void> => {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      resolutionId,
      { isActive: false }
    );
  } catch (error) {
    console.error("Error deleting resolution:", error);
    throw error;
  }
};

// Get a single resolution by ID
export const getResolution = async (resolutionId: string): Promise<Resolution> => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );
    return response as unknown as Resolution;
  } catch (error) {
    console.error("Error fetching resolution:", error);
    throw error;
  }
};

// ============ DAILY LOGS ============

// Get today's logs for user
export const getTodayLogs = async (userId: string): Promise<DailyLog[]> => {
  const today = new Date().toISOString().split("T")[0]; // "2026-01-31"
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal("userId", userId),
        Query.equal("date", today),
      ]
    );
    return response.documents as unknown as DailyLog[];
  } catch (error) {
    console.error("Error fetching today's logs:", error);
    throw error;
  }
};

// Get logs for a specific resolution (last 30 days)
export const getResolutionLogs = async (
  resolutionId: string,
  days: number = 30
): Promise<DailyLog[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateStr = startDate.toISOString().split("T")[0];
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal("resolutionId", resolutionId),
        Query.greaterThanEqual("date", dateStr),
        Query.orderDesc("date"),
      ]
    );
    return response.documents as unknown as DailyLog[];
  } catch (error) {
    console.error("Error fetching resolution logs:", error);
    throw error;
  }
};

// Log time for a resolution
export const logTime = async (
  userId: string,
  resolutionId: string,
  minutes: number,
  note?: string
): Promise<DailyLog> => {
  const today = new Date().toISOString().split("T")[0];
  
  try {
    // Check if log already exists for today
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal("userId", userId),
        Query.equal("resolutionId", resolutionId),
        Query.equal("date", today),
      ]
    );
    
    if (existing.documents.length > 0) {
      // Update existing log
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        existing.documents[0].$id,
        {
          actualMinutes: minutes,
          note: note || "",
          loggedAt: new Date().toISOString(),
        }
      );
      return response as unknown as DailyLog;
    } else {
      // Create new log
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        ID.unique(),
        {
          userId,
          resolutionId,
          date: today,
          actualMinutes: minutes,
          note: note || "",
          loggedAt: new Date().toISOString(),
        }
      );
      return response as unknown as DailyLog;
    }
  } catch (error) {
    console.error("Error logging time:", error);
    throw error;
  }
};

// Simplified function for logging resolution time
export const logResolutionTime = async (
  resolutionId: string,
  minutes: number,
  note?: string
): Promise<DailyLog> => {
  const today = new Date().toISOString().split("T")[0];
  
  try {
    // Get the resolution to find userId
    const resolution = await getResolution(resolutionId);
    
    // Check if log already exists for today
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_LOGS,
      [
        Query.equal("resolutionId", resolutionId),
        Query.equal("date", today),
      ]
    );
    
    if (existing.documents.length > 0) {
      // Add to existing log
      const currentMinutes = existing.documents[0].actualMinutes || 0;
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        existing.documents[0].$id,
        {
          actualMinutes: currentMinutes + minutes,
          note: note || existing.documents[0].note || "",
          loggedAt: new Date().toISOString(),
        }
      );
      return response as unknown as DailyLog;
    } else {
      // Create new log
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        ID.unique(),
        {
          userId: resolution.userId,
          resolutionId,
          date: today,
          actualMinutes: minutes,
          note: note || "",
          loggedAt: new Date().toISOString(),
        }
      );
      return response as unknown as DailyLog;
    }
  } catch (error) {
    console.error("Error logging resolution time:", error);
    throw error;
  }
};