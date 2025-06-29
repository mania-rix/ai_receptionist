'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// [Previous code remains the same until the useStorage hook]

// Hook to use the storage context
export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}