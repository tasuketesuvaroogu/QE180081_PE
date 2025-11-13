import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AuthResponse,
  UserProfile,
  getCurrentUser,
  loginUser,
  registerUser,
  setAuthToken,
} from '../utils/api';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, confirmPassword: string) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'authToken';

async function resolveProfile(auth: AuthResponse): Promise<UserProfile> {
  try {
    const profile = await getCurrentUser();
    return profile;
  } catch (error) {
    // Fallback if /auth/me is unavailable
    return {
      userId: auth.userId,
      email: auth.email,
      role: auth.role,
      createdAt: new Date().toISOString(),
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const applyAuth = useCallback((auth: AuthResponse) => {
    setAuthToken(auth.token);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, auth.token);
    }
    setToken(auth.token);
  }, []);

  const clearAuth = useCallback(() => {
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const profile = await getCurrentUser();
      setUser(profile);
      return profile;
    } catch (error) {
      clearAuth();
      return null;
    }
  }, [token, clearAuth]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setInitializing(false);
      return;
    }

    const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedToken) {
      setInitializing(false);
      return;
    }

    setAuthToken(storedToken);
    setToken(storedToken);

    getCurrentUser()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setInitializing(false));
  }, [clearAuth]);

  const handleAuthFlow = useCallback(
    async (promise: Promise<AuthResponse>): Promise<UserProfile> => {
      try {
        const auth = await promise;
        applyAuth(auth);
        const profile = await resolveProfile(auth);
        setUser(profile);
        return profile;
      } catch (error: any) {
        const message = error?.message ?? 'Authentication failed';
        toast.error(message);
        throw error;
      }
    },
    [applyAuth]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      return handleAuthFlow(loginUser(email, password));
    },
    [handleAuthFlow]
  );

  const register = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      return handleAuthFlow(registerUser(email, password, confirmPassword));
    },
    [handleAuthFlow]
  );

  const logout = useCallback(() => {
    clearAuth();
    toast.success('Logged out successfully');
  }, [clearAuth]);

  const value = useMemo(
    () => ({ user, token, initializing, login, register, logout, refreshUser }),
    [user, token, initializing, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
