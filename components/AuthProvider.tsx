import { authService, type AuthUser } from "@/services/authService";
import { Hub } from "aws-amplify/utils";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendSignUpCode: (email: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();

    // Listen for auth events
    const hubListener = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkAuthStatus();
          break;
        case "signedOut":
          setUser(null);
          break;
        case "tokenRefresh":
          console.log("Token refreshed");
          break;
        case "tokenRefresh_failure":
          console.error("Token refresh failed");
          break;
      }
    });

    return () => hubListener();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log("No authenticated user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signUp({ email, password, name });
      // Don't set user here - they need to confirm email first
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.confirmSignUp(email, code);
      // Auto sign in after confirmation
      // Note: You might want to ask for password again or use a different flow
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSignUpCode = async (email: string) => {
    try {
      setError(null);
      await authService.resendSignUpCode(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signIn({ email, password });
      await checkAuthStatus();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleConfirmResetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    try {
      setError(null);
      await authService.confirmResetPassword(email, code, newPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    resendSignUpCode: handleResendSignUpCode,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    confirmResetPassword: handleConfirmResetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
