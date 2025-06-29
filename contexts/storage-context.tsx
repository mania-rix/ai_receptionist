'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { validateEmail, validatePassword } from '@/lib/auth-utils';

// Define types for our storage items
interface StorageItem {
  id: string;
  created_at: string;
  [key: string]: any;
}

// User data interface
interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

// Define the storage context type
interface StorageContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  validateCredentials: (email: string, password: string) => { valid: boolean; errors: string[] };
  
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  
  // Data collections
  agents: StorageItem[];
  calls: StorageItem[];
  complianceScripts: StorageItem[];
  conversationFlows: StorageItem[];
  knowledgeBases: StorageItem[];
  videoSummaries: StorageItem[];
  
  // CRUD operations
  addItem: (collection: string, item: any) => Promise<StorageItem>;
  updateItem: (collection: string, id: string, updates: any) => Promise<StorageItem>;
  deleteItem: (collection: string, id: string) => Promise<void>;
}

// Create the storage context
const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Storage provider component
export function StorageProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialDataLoaded = useRef(false);
  
  // Collections
  const [agents, setAgents] = useState<StorageItem[]>([]);
  const [calls, setCalls] = useState<StorageItem[]>([]);
  const [complianceScripts, setComplianceScripts] = useState<StorageItem[]>([]);
  const [conversationFlows, setConversationFlows] = useState<StorageItem[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<StorageItem[]>([]);
  const [videoSummaries, setVideoSummaries] = useState<StorageItem[]>([]);

  // Initialize client-side storage
  useEffect(() => {
    setIsClient(true);
    console.log('[StorageContext] Initializing provider with local storage');
    
    // Check if user is already logged in from sessionStorage
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('[StorageContext] User found in session storage:', user.email);
      } catch (error) {
        console.error('Error parsing user from session storage:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
    
    // Load initial data
    if (!initialDataLoaded.current) {
      initialDataLoaded.current = true;
      const userId = sessionStorage.getItem('currentUser') ? 
        JSON.parse(sessionStorage.getItem('currentUser') || '{}').id : 
        'demo-user-id';
      loadInitialData(userId);
    }
    
    setIsLoading(false);
  }, []);

  // Load initial data from localStorage
  const loadInitialData = (userId: string) => {
    try {
      console.log('[StorageContext] Loading initial data for user:', userId, { isAuthenticated, isLoading });
      
      // Load data from sessionStorage
      loadCollection('agents', setAgents, userId);
      loadCollection('calls', setCalls, userId);
      loadCollection('complianceScripts', setComplianceScripts, userId);
      loadCollection('conversationFlows', setConversationFlows, userId);
      loadCollection('knowledgeBases', setKnowledgeBases, userId);
      loadCollection('videoSummaries', setVideoSummaries, userId);
    } catch (error) {
      console.error('[StorageContext] Error loading initial data:', error);
      // Load demo data as fallback
      loadCollection('agents', setAgents, 'demo-user-id');
      loadCollection('calls', setCalls, 'demo-user-id');
      loadCollection('complianceScripts', setComplianceScripts, 'demo-user-id');
      loadCollection('conversationFlows', setConversationFlows, 'demo-user-id');
      loadCollection('knowledgeBases', setKnowledgeBases, 'demo-user-id');
      loadCollection('videoSummaries', setVideoSummaries, 'demo-user-id');
    }
  };

  // Helper to fetch a collection from API
  const fetchCollection = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<StorageItem[]>>) => {
    try {
      const apiEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      console.log(`[StorageContext] Fetching from API: ${apiEndpoint}`);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const collectionName = endpoint.split('/').pop() || 'items';
      const items = data[collectionName] || [];
      
      console.log(`[StorageContext] API data received:`, items.length);
      setter(items);
    } catch (error) {
      console.error(`[StorageContext] Error fetching from ${endpoint}:`, error);
      // Load demo data as fallback
      const collection = endpoint.split('/').pop() || '';
      loadCollection(collection, setter, 'demo-user-id');
    }
  };

  // Helper to load a collection
  const loadCollection = (collection: string, setter: React.Dispatch<React.SetStateAction<StorageItem[]>>, userId: string) => {
    try {
      const key = `blvckwall_${userId}_${collection}`;
      const storedData = sessionStorage.getItem(key);
      
      if (storedData) {
        setter(JSON.parse(storedData));
      } else {
        // Load demo data
        const demoData = getDemoData(collection);
        sessionStorage.setItem(key, JSON.stringify(demoData));
        setter(demoData);
      }
    } catch (error) {
      console.error(`Error loading ${collection}:`, error);
      setter([]);
    }
  };

  // Get demo data for a collection
  const getDemoData = (collection: string): StorageItem[] => {
    switch (collection) {
      case 'agents':
        return [
          {
            id: 'agent_1',
            name: 'Dr. Sarah Johnson',
            voice: 'serena',
            greeting: 'Hello, I\'m Dr. Sarah Johnson. How can I assist you today?',
            temperature: 0.7,
            interruption_sensitivity: 0.5,
            created_at: new Date().toISOString(),
            retell_agent_id: 'agent_d45ccf76ef7145a584ccf7d4e9',
            retell_llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
          },
          {
            id: 'agent_2',
            name: 'Customer Support',
            voice: 'morgan',
            greeting: 'Thank you for calling customer support. How may I help you today?',
            temperature: 0.5,
            interruption_sensitivity: 0.3,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            retell_agent_id: 'agent_e56ddf87fg8256b695ddg8e5fa',
            retell_llm_id: 'llm_19618e757fea1bd8aeb02fg16e78',
          }
        ];
      case 'complianceScripts':
        return [
          {
            id: 'script_1',
            name: 'HIPAA Compliance',
            description: 'Healthcare privacy compliance requirements',
            required_phrases: [
              'This call may be recorded for quality assurance',
              'Your information is protected under HIPAA',
              'Do you consent to this recording?'
            ],
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 'script_2',
            name: 'Financial Disclosure',
            description: 'Required financial service disclosures',
            required_phrases: [
              'This call is being monitored',
              'Investment products are not FDIC insured',
              'Past performance does not guarantee future results'
            ],
            is_active: true,
            created_at: new Date().toISOString()
          }
        ];
      case 'conversationFlows':
        return [
          {
            id: 'flow_1',
            name: 'Patient Intake',
            description: 'Initial patient information gathering flow',
            flow_data: { nodes: [{ id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } }] },
            is_active: true,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'flow_2',
            name: 'Appointment Scheduling',
            description: 'Flow for scheduling patient appointments',
            flow_data: { nodes: [{ id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } }] },
            is_active: true,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      case 'knowledgeBases':
        return [
          {
            id: 'kb_1',
            name: 'Medical Procedures FAQ',
            description: 'Common questions about medical procedures and aftercare',
            content: { 
              faqs: [
                { question: 'What is the recovery time?', answer: 'Recovery time varies by procedure, typically 2-4 weeks.', language: 'en' },
                { question: 'Will I need follow-up appointments?', answer: 'Yes, most procedures require at least one follow-up.', language: 'en' }
              ] 
            },
            languages: ['en', 'es'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'kb_2',
            name: 'Insurance Coverage',
            description: 'Information about insurance coverage and billing',
            content: { 
              faqs: [
                { question: 'What insurance do you accept?', answer: 'We accept most major insurance providers including Blue Cross, Aetna, and UnitedHealthcare.', language: 'en' },
                { question: 'How do I verify my coverage?', answer: 'Contact your insurance provider or our billing department for verification.', language: 'en' }
              ] 
            },
            languages: ['en'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      case 'videoSummaries':
        return [
          {
            id: 'video_1',
            title: 'Patient Consultation Summary',
            description: 'Dr. Smith consultation with John Doe regarding treatment options',
            duration: '2:34',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            thumbnail_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
            video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            call_id: 'call_123',
          },
          {
            id: 'video_2',
            title: 'Follow-up Appointment Summary',
            description: 'Follow-up discussion about treatment progress',
            duration: '1:45',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            thumbnail_url: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=300',
            video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            call_id: 'call_124',
          }
        ];
      default:
        return [];
    }
  };

  // Basic localStorage operations
  const getItem = (key: string): string | null => {
    if (!isClient) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from sessionStorage:', error);
      return null;
    }
  };

  const setItem = (key: string, value: string): void => {
    if (!isClient) return;
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in sessionStorage:', error);
    }
  };

  const removeItem = (key: string): void => {
    if (!isClient) return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from sessionStorage:', error);
    }
  };

  const clear = (): void => {
    if (!isClient) return;
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  };

  // Authentication methods
  const validateCredentials = useCallback((email: string, password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Invalid email format');
    }
    
    if (!password) {
      errors.push('Password is required');
    } else if (!validatePassword(password)) {
      errors.push('Password must be at least 8 characters with 1 uppercase letter and 1 number');
    }
    
    return { valid: errors.length === 0, errors };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[StorageContext] Login attempt:', email);
      setIsLoading(true);
      
      // Validate credentials
      const validation = validateCredentials(email, password);
      if (!validation.valid) {
        setAuthError(validation.errors[0]);
        setIsLoading(false);
        return { success: false, error: validation.errors[0] };
      }
      
      // Demo login - accept any valid email/password
      const user: User = {
        id: uuidv4(),
        email: email,
        user_metadata: {
          name: email.split('@')[0]
        }
      };
      
      // Store user in session storage
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      
      // Set session expiry (24 hours)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      sessionStorage.setItem('session_expiry', expiryTime.toString());
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Load initial data for the user
      loadInitialData(user.id);
      
      console.log('[StorageContext] Login successful:', user.email);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      setAuthError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[StorageContext] Signup attempt:', email);
      setIsLoading(true);
      
      // Validate credentials
      const validation = validateCredentials(email, password);
      if (!validation.valid) {
        setAuthError(validation.errors[0]);
        setIsLoading(false);
        return { success: false, error: validation.errors[0] };
      }
      
      if (!firstName || !lastName) {
        const error = 'First name and last name are required';
        setAuthError(error);
        setIsLoading(false);
        return { success: false, error };
      }
      
      // Create new user
      const user: User = {
        id: uuidv4(),
        email: email,
        user_metadata: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`
        }
      };
      
      // Store user in session storage
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      
      // Set session expiry (24 hours)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      sessionStorage.setItem('session_expiry', expiryTime.toString());
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Load initial data for the user
      loadInitialData(user.id);
      
      console.log('[StorageContext] Signup successful:', user.email);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      setAuthError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('[StorageContext] Logging out user');
      
      // Clear user from session storage
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('session_expiry');
      
      // Clear all data
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('blvckwall_')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Update state
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAgents([]);
      setCalls([]);
      setComplianceScripts([]);
      setConversationFlows([]);
      setKnowledgeBases([]);
      setVideoSummaries([]);
      
      console.log('[StorageContext] Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  // CRUD operations for collections
  const addItem = useCallback(async (collection: string, item: any): Promise<StorageItem> => {
    try {
      console.log(`[StorageContext] Adding item to ${collection}`);
      
      // Get user ID
      const userId = currentUser?.id || 'demo-user-id';
      const key = `blvckwall_${userId}_${collection}`;
      
      // Get existing data
      const storedData = sessionStorage.getItem(key);
      const existingData = storedData ? JSON.parse(storedData) : [];
      
      // Add new item
      const newItem = {
        ...item,
        id: item.id || `${collection.slice(0, -1)}_${Date.now()}`,
        created_at: item.created_at || new Date().toISOString(),
        user_id: userId
      };
      
      // Save updated data
      const updatedData = [newItem, ...existingData];
      sessionStorage.setItem(key, JSON.stringify(updatedData));
      
      // Update state
      updateCollectionState(collection, updatedData);
      
      // Simulate API call
      try {
        const endpoint = `/api/${collection.toLowerCase()}`;
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } catch (apiError) {
        console.warn(`[StorageContext] API simulation error (non-blocking):`, apiError);
      }
      
      return newItem;
    } catch (error) {
      console.error(`Error adding item to ${collection}:`, error);
      throw error;
    }
  }, [currentUser]);

  const updateItem = useCallback(async (collection: string, id: string, updates: any): Promise<StorageItem> => {
    try {
      console.log(`[StorageContext] Updating item in ${collection}:`, id);
      
      // Get user ID
      const userId = currentUser?.id || 'demo-user-id';
      const key = `blvckwall_${userId}_${collection}`;
      
      // Get existing data
      const storedData = sessionStorage.getItem(key);
      if (!storedData) throw new Error(`Collection ${collection} not found`);
      
      const existingData = JSON.parse(storedData);
      
      // Find and update item
      const updatedData = existingData.map((item: any) => {
        if (item.id === id) {
          return { ...item, ...updates, updated_at: new Date().toISOString() };
        }
        return item;
      });
      
      // Save updated data
      sessionStorage.setItem(key, JSON.stringify(updatedData));
      
      // Update state
      updateCollectionState(collection, updatedData);
      
      // Return updated item
      const updatedItem = updatedData.find((item: any) => item.id === id);
      if (!updatedItem) throw new Error(`Item with id ${id} not found in ${collection}`);
      
      // Simulate API call
      try {
        const endpoint = `/api/${collection.toLowerCase()}/${id}`;
        await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch (apiError) {
        console.warn(`[StorageContext] API simulation error (non-blocking):`, apiError);
      }
      
      return updatedItem;
    } catch (error) {
      console.error(`Error updating item in ${collection}:`, error);
      throw error;
    }
  }, [currentUser]);

  const deleteItem = useCallback(async (collection: string, id: string): Promise<void> => {
    try {
      console.log(`[StorageContext] Deleting item from ${collection}:`, id);
      
      // Get user ID
      const userId = currentUser?.id || 'demo-user-id';
      const key = `blvckwall_${userId}_${collection}`;
      
      // Get existing data
      const storedData = sessionStorage.getItem(key);
      if (!storedData) throw new Error(`Collection ${collection} not found`);
      
      const existingData = JSON.parse(storedData);
      
      // Filter out item
      const updatedData = existingData.filter((item: any) => item.id !== id);
      
      // Save updated data
      sessionStorage.setItem(key, JSON.stringify(updatedData));
      
      // Update state
      updateCollectionState(collection, updatedData);
      
      // Simulate API call
      try {
        const endpoint = `/api/${collection.toLowerCase()}/${id}`;
        await fetch(endpoint, {
          method: 'DELETE'
        });
      } catch (apiError) {
        console.warn(`[StorageContext] API simulation error (non-blocking):`, apiError);
      }
    } catch (error) {
      console.error(`Error deleting item from ${collection}:`, error);
      throw error;
    }
  }, [currentUser]);

  // Helper to update the correct state based on collection name
  const updateCollectionState = (collection: string, dataOrUpdater: StorageItem[] | ((prev: StorageItem[]) => StorageItem[])) => {
    const updateState = (setter: React.Dispatch<React.SetStateAction<StorageItem[]>>) => {
      if (typeof dataOrUpdater === 'function') {
        setter(dataOrUpdater);
      } else {
        setter(dataOrUpdater);
      }
    };
    
    switch (collection) {
      case 'agents':
        updateState(setAgents);
        break;
      case 'calls':
        updateState(setCalls);
        break;
      case 'complianceScripts':
        updateState(setComplianceScripts);
        break;
      case 'conversationFlows':
        updateState(setConversationFlows);
        break;
      case 'knowledgeBases':
        updateState(setKnowledgeBases);
        break;
      case 'videoSummaries':
        updateState(setVideoSummaries);
        break;
      default:
        console.warn(`Unknown collection: ${collection}`);
    }
  };

  const value: StorageContextType = {
    // Authentication
    isAuthenticated,
    isLoading,
    authError,
    currentUser,
    login,
    signup,
    logout,
    
    // Storage operations
    getItem,
    setItem,
    validateCredentials,
    removeItem,
    clear,
    
    // Data collections
    agents,
    calls,
    complianceScripts,
    conversationFlows,
    knowledgeBases,
    videoSummaries,
    
    // CRUD operations
    addItem,
    updateItem,
    deleteItem,
  };

  console.log('[StorageContext] Provider state:', { 
    isAuthenticated, 
    isLoading, 
    authError: authError ? 'Error present' : 'No error',
    userEmail: currentUser?.email || 'none',
    hasUser: !!currentUser,
    initialDataLoaded: initialDataLoaded.current
  });

  // Add a demo banner note
  useEffect(() => {
    if (isClient && !isLoading) {
      console.log('[StorageContext] Setting demo banner in sessionStorage');
      sessionStorage.setItem('demo-banner', JSON.stringify({
        show: true,
        message: "🚀 Demo Mode - All data is stored in session storage and will be lost on refresh or sign out",
        type: "warning",
        dismissible: true
      }));
    }
  }, [isClient, isLoading]);

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