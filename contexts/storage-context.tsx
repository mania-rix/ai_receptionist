'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the storage context type
interface StorageContextType {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

// Create the storage context
const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Storage provider component
export function StorageProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getItem = (key: string): string | null => {
    if (!isClient) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  };

  const setItem = (key: string, value: string): void => {
    if (!isClient) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  };

  const removeItem = (key: string): void => {
    if (!isClient) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  };

  const clear = (): void => {
    if (!isClient) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const value: StorageContextType = {
    getItem,
    setItem,
    removeItem,
    clear,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

// Hook to use the storage context
export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}