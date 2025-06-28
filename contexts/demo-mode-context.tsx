'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  phoneNumbers: PhoneNumber[];
  addPhoneNumber: (phoneNumber: PhoneNumber) => void;
  removePhoneNumber: (id: string) => void;
  updatePhoneNumber: (id: string, updates: Partial<PhoneNumber>) => void;
  getPhoneNumber: (id: string) => PhoneNumber | undefined;
}

export interface PhoneNumber {
  id: string;
  phone_number: string;
  provider: 'retell' | 'elevenlabs';
  type: 'provisioned' | 'sip';
  label: string;
  assigned_agent_id?: string;
  is_active: boolean;
  created_at: string;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);

  useEffect(() => {
    console.log('[DemoModeContext] Initializing demo mode context');
    
    // Load phone numbers from localStorage
    const savedPhoneNumbers = localStorage.getItem('demo-phone-numbers');
    if (savedPhoneNumbers) {
      try {
        setPhoneNumbers(JSON.parse(savedPhoneNumbers));
      } catch (error) {
        console.error('[DemoModeContext] Error parsing saved phone numbers:', error);
        loadDefaultPhoneNumbers();
      }
    } else {
      loadDefaultPhoneNumbers();
    }
  }, []);

  // Save phone numbers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('demo-phone-numbers', JSON.stringify(phoneNumbers));
  }, [phoneNumbers]);

  const loadDefaultPhoneNumbers = () => {
    const defaultPhoneNumbers: PhoneNumber[] = [
      {
        id: 'phone_1',
        phone_number: '+1 (555) 123-4567',
        provider: 'elevenlabs',
        type: 'provisioned',
        label: 'Main Office',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'phone_2',
        phone_number: '+1 (555) 987-6543',
        provider: 'retell',
        type: 'provisioned',
        label: 'Support Line',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
    
    setPhoneNumbers(defaultPhoneNumbers);
  };

  const addPhoneNumber = (phoneNumber: PhoneNumber) => {
    console.log('[DemoModeContext] Adding phone number:', phoneNumber);
    setPhoneNumbers(prev => [...prev, {
      ...phoneNumber,
      id: phoneNumber.id || `phone_${Date.now()}`,
      created_at: phoneNumber.created_at || new Date().toISOString()
    }]);
  };

  const removePhoneNumber = (id: string) => {
    console.log('[DemoModeContext] Removing phone number:', id);
    setPhoneNumbers(prev => prev.filter(p => p.id !== id));
  };

  const updatePhoneNumber = (id: string, updates: Partial<PhoneNumber>) => {
    console.log('[DemoModeContext] Updating phone number:', id, updates);
    setPhoneNumbers(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const getPhoneNumber = (id: string) => {
    return phoneNumbers.find(p => p.id === id);
  };

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      phoneNumbers,
      addPhoneNumber,
      removePhoneNumber,
      updatePhoneNumber,
      getPhoneNumber
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}