import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authServices } from '../services/Auth/authServices';

export type UserRole = 'admin' | 'attendee' | 'booth' | null;

interface User {
  id: string;
  role: UserRole;
  name?: string;
  company?: string;
  boothNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, role: UserRole, userData?: Partial<User>) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // 檢查現有的認證狀態
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const role = localStorage.getItem('user_role') as UserRole;
      const userData = localStorage.getItem('user_data');

      if (token && role) {
        // 驗證 token 是否有效
        const response = await authServices.verifyJwtToken();
        if (response.success) {
          setUser({
            id: '',
            role,
            ...(userData ? JSON.parse(userData) : {}),
          });
        } else {
          // Token 無效，清除本地存儲
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, role: UserRole, userData?: Partial<User>) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_role', role || '');
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    setUser({
      id: userData?.id || '',
      role,
      ...userData,
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
