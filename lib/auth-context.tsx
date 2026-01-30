import { createContext, use, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
    user : Models.User<Models.Preferences> | null;
    isLoadingUser?: boolean;
    signUp: (email: string, password: string) => Promise<string | void>;
    signIn: (email: string, password: string) => Promise<string |  void>;
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
           await signIn(email, password);
       } catch (error) {
        if (error instanceof Error) {
            return error.message;
        }
           return "Sign-up failed";
       }
    };

    const signIn = async (email: string, password: string) => {
        try {
           await account.createEmailPasswordSession( email, password);
           await getUser();
       } catch (error) {
        if (error instanceof Error) {
            return error.message;
        }
           return "An error occurred during sign-in";
       }
    };
    
    return (<AuthContext.Provider value={{ isLoadingUser, user, signUp, signIn }}>
      {children}
    </AuthContext.Provider>);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
// auth 