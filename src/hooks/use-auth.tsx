
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_ADMINS = ['rohanbania009@gmail.com', 'jupiterbania472@gmail.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If a user is detected, verify if they are an allowed admin
      if (user && !ALLOWED_ADMINS.includes(user.email || '')) {
         signOut(auth); // Sign out unauthorized user
         setUser(null);
      } else {
        setUser(user);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail && ALLOWED_ADMINS.includes(userEmail)) {
        toast({ title: "Signed in successfully" });
      } else {
        await signOut(auth);
        toast({ 
            title: "Access Denied", 
            description: "You are not authorized to access this application.",
            variant: "destructive" 
        });
      }

    } catch (error: any) {
      console.error("Google sign-in error", error);
      toast({ title: "Sign-in Failed", description: error.message, variant: "destructive" });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out" });
    } catch (error: any) {
        console.error("Sign-out error", error);
        toast({ title: "Sign-out Failed", description: error.message, variant: "destructive" });
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
