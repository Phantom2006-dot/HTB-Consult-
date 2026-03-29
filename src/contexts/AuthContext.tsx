import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, setToken, clearToken } from "@/lib/api";

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  created_at?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => void;
  setUser: (user: AppUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export { setToken };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("htb_token");
    if (!token) { setLoading(false); return; }
    api.get<AppUser>("/api/auth/me")
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
