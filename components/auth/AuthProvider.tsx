"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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
  logout: () => void;
  updatePhoto: (photoUrl: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.data) {
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
    setUser(userData);
  };

  const signup = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Clear the session cookie too; otherwise the next page load restores the session.
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
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
