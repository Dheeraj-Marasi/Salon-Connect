import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthUser>;
  refetch: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Request failed", data.code);
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchMe = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data);
  }, []);

  const register = useCallback(async (formData: RegisterData) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const updateProfile = useCallback(async (formData: UpdateProfileData) => {
    const data = await apiFetch("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(formData),
    });
    setUser(data);
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
