import React, { createContext, useContext, useEffect, useState } from "react";
import { sessionStorageService } from "../services/storageService";

interface AuthContextType {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a custom hook that components will use to access the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// This is the provider component that will wrap our app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await sessionStorageService.getSession();
        setIsLoggedIn(!!session);
      } catch (e) {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async () => {
    setIsLoading(true);
    await sessionStorageService.saveSession("dummy-token");
    setIsLoggedIn(true);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await sessionStorageService.clearSession();
    setIsLoggedIn(false);
    setIsLoading(false);
  };

  const value = {
    isLoggedIn,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
