import { getCurrentUser, signOut } from 'aws-amplify/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
  attributes?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Fetching current user...');
      const currentUser = await getCurrentUser();
      console.log('AuthContext: Current user found:', currentUser);
      setUser({
        username: currentUser.username,
        attributes: currentUser,
      });
      console.log('AuthContext: User state updated:', currentUser.username);
    } catch (error) {
      console.log('AuthContext: No authenticated user found:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        signOut: handleSignOut, 
        refreshUser 
      }}
    >
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