import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models, OAuthProvider } from "react-native-appwrite";
import { account } from "./appwrite";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

type AuthContextType = {
    user: Models.User<Models.Preferences> | null;
    isLoadingUser: boolean;
    signUp: (email: string, password: string) => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<string | null>;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
    
    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoadingUser(false);
        }
    }

    const signUp = async (email: string, password: string) => {
        try {
            await account.create(ID.unique(), email, password);
            const signInError = await signIn(email, password);
            return signInError;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "Sign-up failed";
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            // Delete any existing session first
            try {
                await account.deleteSession("current");
            } catch {
                // No existing session
            }
            
            await account.createEmailPasswordSession(email, password);
            await getUser();
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occurred during sign-in";
        }
    };

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = 'resoly://';
            
            // Build OAuth URL
            const url = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/account/sessions/oauth2/google?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&success=${encodeURIComponent(redirectUrl)}&failure=${encodeURIComponent(redirectUrl)}`;
            
            // Open browser
            await WebBrowser.openBrowserAsync(url);
            
            // User will manually come back to the app after signing in
            // The session will be available when they return
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    const signInWithGitHub = async () => {
        try {
            const redirectUrl = Linking.createURL('/');
            
            // Use Appwrite SDK's createOAuth2Token method
            const response = await account.createOAuth2Token(
                OAuthProvider.Github,
                redirectUrl,
                redirectUrl
            );
            
            // Open the OAuth URL
            if (response) {
                await WebBrowser.openAuthSessionAsync(response.toString(), redirectUrl);
                await getUser();
            }
        } catch (error) {
            console.error("GitHub sign-in error:", error);
        }
    };
    
    const signOut = async () => {
        try {
            await account.deleteSession("current");
            setUser(null);
        } catch (error) {
            console.error("Sign-out failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoadingUser, 
            signUp, 
            signIn, 
            signInWithGoogle,
            signInWithGitHub,
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}