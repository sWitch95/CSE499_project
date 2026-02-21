import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  'teacher@labdesk.io': {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    email: 'teacher@labdesk.io',
    role: 'teacher',
  },
  'student@labdesk.io': {
    id: '2',
    name: 'Alex Johnson',
    email: 'student@labdesk.io',
    role: 'student',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Demo: Accept any credentials
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === 'teacher' ? 'Dr. Sarah Mitchell' : 'Alex Johnson',
      email,
      role,
    };
    
    setUser(mockUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
