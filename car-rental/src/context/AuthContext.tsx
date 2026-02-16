import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";

type User = { id: string; name: string; email: string; role: "user" | "admin" };

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      api
        .get("/auth/me")
        .then((res) => {
          const me = res.data?.data?.user ?? res.data?.user ?? null;
          setUser(me);
        })
        .catch(() => {});
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data?.data?.token ?? data?.token;
    const loggedInUser = data?.data?.user ?? data?.user;
    if (token) localStorage.setItem("token", token);
    setUser(loggedInUser ?? null);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    const token = data?.data?.token ?? data?.token;
    const registeredUser = data?.data?.user ?? data?.user;
    if (token) localStorage.setItem("token", token);
    setUser(registeredUser ?? null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
