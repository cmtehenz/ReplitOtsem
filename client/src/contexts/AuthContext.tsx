import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, LoginResponse } from "@/lib/api";

interface TwoFactorChallenge {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  twoFactorChallenge: TwoFactorChallenge | null;
  login: (username: string, password: string) => Promise<{ requiresTwoFactor: boolean }>;
  completeTwoFactorLogin: (code: string) => Promise<void>;
  cancelTwoFactorLogin: () => void;
  register: (data: { username: string; email: string; password: string; name: string; cpf?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorChallenge | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string): Promise<{ requiresTwoFactor: boolean }> => {
    const response = await apiLogin(username, password);
    
    if (response.requiresTwoFactor) {
      setTwoFactorChallenge({ username, password });
      return { requiresTwoFactor: true };
    }
    
    setUser(response as User);
    return { requiresTwoFactor: false };
  };

  const completeTwoFactorLogin = async (code: string) => {
    if (!twoFactorChallenge) {
      throw new Error("No 2FA challenge in progress");
    }
    
    const response = await apiLogin(
      twoFactorChallenge.username, 
      twoFactorChallenge.password, 
      code
    );
    
    if (response.requiresTwoFactor) {
      throw new Error("Invalid verification code");
    }
    
    setUser(response as User);
    setTwoFactorChallenge(null);
  };

  const cancelTwoFactorLogin = () => {
    setTwoFactorChallenge(null);
  };

  const register = async (data: { username: string; email: string; password: string; name: string; cpf?: string }) => {
    const registeredUser = await apiRegister(data);
    setUser(registeredUser);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
    } catch {
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      twoFactorChallenge,
      login, 
      completeTwoFactorLogin,
      cancelTwoFactorLogin,
      register, 
      logout, 
      refreshUser, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
