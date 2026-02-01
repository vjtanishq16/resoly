import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models, OAuthProvider } from "react-native-appwrite";
import { account } from "./appwrite";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

type AuthContextType = {
    user: Models.User<Models.Preferences> | null;
    isLoadingUser: boolean;
    isEmailVerified: boolean;
    signUp: (email: string, password: string, name: string) => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<string | null>;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signOut: () => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUserName: (name: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    
    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            setIsEmailVerified(currentUser.emailVerification);
        } catch (error) {
            setUser(null);
            setIsEmailVerified(false);
        } finally {
            setIsLoadingUser(false);
        }
    }

    const refreshUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            setIsEmailVerified(currentUser.emailVerification);
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            // Create account with name
            await account.create('unique()', email, password, name);
            const signInError = await signIn(email, password);
            
            // Send verification email after successful signup
            if (!signInError) {
                try {
                    await sendVerificationEmail();
                } catch (verifyError) {
                    console.log('Error sending verification email:', verifyError);
                }
            }
            
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
            
            // Send verification email if not verified
            const currentUser = await account.get();
            if (!currentUser.emailVerification) {
                try {
                    await sendVerificationEmail();
                } catch (verifyError) {
                    console.log('Verification email already sent or error:', verifyError);
                }
            }
            
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occurred during sign-in";
        }
    };

    const sendVerificationEmail = async () => {
        try {
            const verificationUrl = `${process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8081'}/verify-success`;
            await account.createVerification(verificationUrl);
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    };

    const resendVerificationEmail = async () => {
        try {
            const verificationUrl = `${process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8081'}/verify-success`;
            await account.createVerification(verificationUrl);
        } catch (error) {
            console.error('Error resending verification email:', error);
            throw error;
        }
    };

    const updateUserName = async (name: string) => {
        try {
            await account.updateName(name);
            
            // Refresh user data
            const updatedUser = await account.get();
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating user name:', error);
            throw error;
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
            await getUser();
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
            setIsEmailVerified(false);
        } catch (error) {
            console.error("Sign-out failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoadingUser,
            isEmailVerified,
            signUp, 
            signIn, 
            signInWithGoogle,
            signInWithGitHub,
            signOut,
            sendVerificationEmail,
            resendVerificationEmail,
            refreshUser,
            updateUserName,
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