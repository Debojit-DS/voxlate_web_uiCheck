"use client";

import { apiRequest } from "@/lib/apiClient";
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => Promise<boolean>;
  updatePhoto: (photoUrl: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const version = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const requestVersion = version.current;

    async function restoreSession() {
      try {
        const res = await apiRequest("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!cancelled && requestVersion === version.current && data.status === "success" && data.data?.id && data.data.email) {
            setUser({
              id: data.data.id,
              name: data.data.name,
              email: data.data.email,
              ...(data.data.photoUrl ? { photoUrl: data.data.photoUrl } : {}),
            });
          }
        }
      } catch {
        // ignore network errors
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData: User) => {
    ++version.current;
    setUser(userData);
  };

  const signup = (userData: User) => {
    ++version.current;
    setUser(userData);
  };

  const logout = async () => {
    try {
      const response = await apiRequest("/api/auth/logout", { method: "POST" });
      if (!response.ok) return false;
      ++version.current;
      setUser(null);
      return true;
    } catch { return false; }
  };

  const updatePhoto = (photoUrl: string) => {
    setUser((prev) => (prev ? { ...prev, photoUrl } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updatePhoto }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
