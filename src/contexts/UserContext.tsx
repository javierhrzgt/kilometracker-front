"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/Types";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auth/me", {
        credentials: "include"
      });

      if (!response.ok) {
        // 401 means not authenticated - this is expected on login page
        if (response.status === 401) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Refresh function to manually refetch user
  const refreshUser = async () => {
    await fetchUser();
  };

  // Computed properties
  const isAdmin = user?.role === "admin";
  const isAuthenticated = user !== null;

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAdmin,
        isAuthenticated,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
