import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  walletBalance: string;
  isAdmin: boolean;
  referralCode: string;
  totalReferralEarnings?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.log("Auth check failed, removing invalid token");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.log("Auth check error:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      const data = await response.json();
      
      // Store token and set user state immediately
      localStorage.setItem("token", data.token);
      setUser(data.user);
      
      // Verify the token is working by checking /api/auth/me
      try {
        const verifyResponse = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          setUser(verifyData.user); // Ensure consistent user data
        }
      } catch (verifyError) {
        console.warn("Token verification failed, but login was successful:", verifyError);
      }
      
      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const register = async (userData: any) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}