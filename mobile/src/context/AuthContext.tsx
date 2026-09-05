import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, login as apiLogin, signup as apiSignup } from "../api/auth";
import { getAuthToken, setAuthToken } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (token) {
        try {
          const me = await fetchMe();
          setUser(me);
        } catch {
          await setAuthToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(email, password) {
        const res = await apiLogin(email, password);
        await setAuthToken(res.token);
        setUser(res.user);
      },
      async signup(email, password) {
        const res = await apiSignup(email, password);
        await setAuthToken(res.token);
        setUser(res.user);
      },
      async logout() {
        await setAuthToken(null);
        setUser(null);
      },
      async refreshUser() {
        const me = await fetchMe();
        setUser(me);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
