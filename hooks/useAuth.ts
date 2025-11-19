import { useEffect, useState } from "react";
import { sessionStorageService } from "../services/storageService";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- Add loading state

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await sessionStorageService.getSession();
        setIsLoggedIn(!!session);
      } catch (e) {
        // Handle potential errors
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false); // <-- Stop loading once check is complete
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

  return { isLoggedIn, isLoading, login, logout }; // <-- Expose isLoading
}

export type { AuthUser } from "@/services/authService";
