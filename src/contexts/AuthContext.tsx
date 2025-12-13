import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Admin, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin for demo purposes
const DEFAULT_ADMIN: Admin = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@turfs.com',
  password: 'admin123', // In production, this would be hashed
  name: 'Admin User',
  role: 'super_admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([DEFAULT_ADMIN]);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
      try {
        setCurrentAdmin(JSON.parse(savedAdmin));
      } catch {
        localStorage.removeItem('currentAdmin');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const admin = admins.find(
      (a) => a.username === username && a.password === password && a.isActive
    );

    if (admin) {
      setCurrentAdmin(admin);
      localStorage.setItem('currentAdmin', JSON.stringify(admin));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('currentAdmin');
  };

  const addAdmin = (admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAdmin: Admin = {
      ...admin,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAdmins((prev) => [...prev, newAdmin]);
  };

  const updateAdmin = (id: string, updates: Partial<Admin>) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === id
          ? { ...admin, ...updates, updatedAt: new Date() }
          : admin
      )
    );

    // Update current admin if it's the logged-in user
    if (currentAdmin?.id === id) {
      const updatedAdmin = {
        ...currentAdmin,
        ...updates,
        updatedAt: new Date(),
      };
      setCurrentAdmin(updatedAdmin);
      localStorage.setItem('currentAdmin', JSON.stringify(updatedAdmin));
    }
  };

  const deleteAdmin = (id: string) => {
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));
  };

  const getAllAdmins = (): Admin[] => {
    return admins;
  };

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        isAuthenticated: !!currentAdmin,
        login,
        logout,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        getAllAdmins,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
