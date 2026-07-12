import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "med-tracker-auth";

function loadAuth(): { token: string | null; user: User | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.user) {
        return { token: parsed.token, user: parsed.user };
      }
    }
  } catch {
    // ignore
  }
  return { token: null, user: null };
}

function saveAuth(token: string, user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ token, user }, setState] = useState<{ token: string | null; user: User | null }>({ token: null, user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadAuth();
    setState(stored);
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    saveAuth(newToken, newUser);
    setState({ token: newToken, user: newUser });
  };

  const logout = () => {
    clearAuth();
    setState({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getStoredToken(): string | null {
  return loadAuth().token;
}
