import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import type { Resolution, DailyLog } from './database';

// Try to import expo-notifications, but don't crash if it's not available (Expo Go)
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.log('expo-notifications not available - notifications disabled');
}

// Configure how notifications behave when app is in foreground
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Request notification permissions
export async function registerForPushNotifications() {
  if (!Notifications) {
    console.log('Notifications not available');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7A9B76',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
}

// Check if notifications are enabled in settings
async function areNotificationsEnabled() {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    if (!settings) return true; // Default to enabled
    const parsed = JSON.parse(settings);
    return parsed.enabled;
  } catch {
    return true;
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Schedule daily morning reminder (8 AM)
export async function scheduleDailyMorningReminder() {
  if (!Notifications) return;
  
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  const settings = await AsyncStorage.getItem('notificationSettings');
  const goalReminders = settings ? JSON.parse(settings).goalReminders : true;
  if (!goalReminders) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good morning! 🌅",
      body: "Time to work on your resolutions. Let's make today count!",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'daily',
      hour: 8,
      minute: 0,
      repeats: true,
    } as any,
  });
}

// Schedule evening streak protection (10 PM)
export async function scheduleEveningReminder(userId: string) {
  if (!Notifications) return;
  
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  const settings = await AsyncStorage.getItem('notificationSettings');
  const goalReminders = settings ? JSON.parse(settings).goalReminders : true;
  if (!goalReminders) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't forget! 🔥",
      body: "Log your progress before the day ends. Keep your streak alive!",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { type: 'evening_reminder' },
    },
    trigger: {
      type: 'daily',
      hour: 22,
      minute: 0,
      repeats: true,
    } as any,
  });
}

// Schedule daily summary (10 PM)
export async function scheduleDailySummary() {
  if (!Notifications) return;
  
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  const settings = await AsyncStorage.getItem('notificationSettings');
  const dailySummary = settings ? JSON.parse(settings).dailySummary : true;
  if (!dailySummary) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Summary 📊",
      body: "Check your progress for today!",
      sound: true,
      data: { type: 'daily_summary' },
    },
    trigger: {
      type: 'daily',
      hour: 22,
      minute: 30,
      repeats: true,
    } as any,
  });
}

// Schedule weekly report (Sunday 8 PM)
export async function scheduleWeeklyReport() {
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Weekly Report 📈",
      body: "See how your week went! Tap to view your progress.",
      sound: true,
      data: { type: 'weekly_report' },
    },
    trigger: {
      type: 'weekly',
      weekday: 1, // Sunday
      hour: 20,
      minute: 0,
      repeats: true,
    } as any,
  });
}

// Send achievement notification immediately
export async function sendAchievementNotification(title: string, days: number) {
  if (!Notifications) return;
  
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  const settings = await AsyncStorage.getItem('notificationSettings');
  const achievements = settings ? JSON.parse(settings).achievements : true;
  if (!achievements) return;

  const milestoneEmoji = days >= 365 ? '🏆' : days >= 90 ? '💎' : days >= 30 ? '🌟' : '🎉';
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${milestoneEmoji} Achievement Unlocked!`,
      body: `${days} days streak on "${title}"! Keep going!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { type: 'achievement', days },
    },
    trigger: null, // Send immediately
  });
}

// Send completion notification
export async function sendCompletionNotification(title: string) {
  if (!Notifications) return;
  
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  const settings = await AsyncStorage.getItem('notificationSettings');
  const achievements = settings ? JSON.parse(settings).achievements : true;
  if (!achievements) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎊 Resolution Completed!",
      body: `Congratulations on completing "${title}"!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { type: 'completion' },
    },
    trigger: null,
  });
}

// Initialize all recurring notifications
export async function initializeNotifications(userId: string) {
  if (!Notifications) {
    console.log('Notifications not available in Expo Go. Use a development build for push notifications.');
    return false;
  }
  
  const hasPermission = await registerForPushNotifications();
  if (!hasPermission) return false;

  // Cancel existing notifications first
  await cancelAllNotifications();

  // Schedule all recurring notifications
  await scheduleDailyMorningReminder();
  await scheduleEveningReminder(userId);
  await scheduleDailySummary();
  await scheduleWeeklyReport();

  return true;
}

// Check for milestone achievements
export function checkForMilestone(streak: number): number | null {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  if (milestones.includes(streak)) {
    return streak;
  }
  return null;
}

// Update notifications when settings change
export async function updateNotificationSettings(userId: string) {
  await initializeNotifications(userId);
}
