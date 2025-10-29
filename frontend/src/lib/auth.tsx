import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import * as api from "./api";

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<any>;
  logout: () => void;
  completeAuth: (token: string, user: any) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );

  useEffect(() => {
    if (token) {
      api
        .me()
        .then((res) => setUser(res.user))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("auth_token");
        });
    }
  }, [token]);

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    // Check if OTP is required for login
    if (res.requiresOtp) {
      // Return the response so the component can handle OTP verification
      throw new Error("OTP_REQUIRED");
    }
    // If no OTP required (fallback), proceed with normal login
    const t = res.token;
    localStorage.setItem("auth_token", t);
    setToken(t);
    setUser(res.user);
  }

  async function register(payload: any) {
    const res = await api.register(payload);
    // If backend returned a token (maybe auto-verified), store it. Otherwise return the response
    if (res && res.token) {
      const t = res.token;
      localStorage.setItem("auth_token", t);
      setToken(t);
      setUser(res.user);
      return res;
    }
    return res;
  }

  // Complete authentication after verification: store token and user
  function completeAuth(token: string, user: any) {
    localStorage.setItem("auth_token", token);
    setToken(token);
    setUser(user);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, completeAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
