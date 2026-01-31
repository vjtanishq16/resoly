import { Account, Client, Databases } from "react-native-appwrite";

export const client = new Client();

client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) 
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!);

export const account = new Account(client);
export const databases = new Databases(client);

// Database IDs
export const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
export const COLLECTIONS = {
  RESOLUTIONS: process.env.EXPO_PUBLIC_APPWRITE_RESOLUTIONS_COLLECTION_ID!,
  DAILY_LOGS: process.env.EXPO_PUBLIC_APPWRITE_LOGS_COLLECTION_ID!,
};