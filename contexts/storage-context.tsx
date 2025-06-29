'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our storage context
interface StorageContextType {
  // User data
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  
  // Data collections
  agents: Agent[];
  calls: Call[];
  phoneNumbers: PhoneNumber[];
  knowledgeBases: KnowledgeBase[];
  complianceScripts: ComplianceScript[];
  conversationFlows: ConversationFlow[];
  events: Event[];
  hrRequests: HRRequest[];
  digitalCards: DigitalCard[];
  videoSummaries: VideoSummary[];
  
  // CRUD operations
  addItem: <T extends BaseItem>(collection: string, item: Omit<T, 'id' | 'created_at'>) => Promise<T>;
  updateItem: <T extends BaseItem>(collection: string, id: string, updates: Partial<T>) => Promise<T>;
  deleteItem: (collection: string, id: string) => Promise<boolean>;
  
  // Authentication
  login: (email: string, password: string) => Promise<UserData>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  
  // Demo mode
  isDemoMode: boolean;
  
  // Loading state
  isLoading: boolean;
}

// Base interface for all items
interface BaseItem {
  }
  id: string;
  created_at: string;
  [key: string]: any;
}

// User data interface
interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

// Define interfaces for each data type
interface Agent extends BaseItem {
  name: string;
  voice: string;
  greeting: string;
  temperature: number;
  interruption_sensitivity: number;
  voice_engine?: string;
  knowledge_base_id?: string;
  custom_instructions?: string;
}

interface Call extends BaseItem {
  callee: string;
  direction: 'inbound' | 'outbound';
  status: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  agent_id?: string;
  transcript?: string;
  recording_url?: string;
  cost?: number;
  from_number?: string;
}

interface PhoneNumber extends BaseItem {
  phone_number: string;
  provider: 'retell' | 'elevenlabs';
  type: 'provisioned' | 'sip';
  label: string;
  assigned_agent_id?: string;
  is_active: boolean;
  sip_config?: any;
}

interface KnowledgeBase extends BaseItem {
  name: string;
  description?: string;
  content?: any;
  languages?: string[];
}

interface ComplianceScript extends BaseItem {
  name: string;
  description?: string;
  required_phrases: string[];
  is_active?: boolean;
}

interface ConversationFlow extends BaseItem {
  name: string;
  description?: string;
  flow_data: any;
  is_active?: boolean;
  version?: number;
}

interface Event extends BaseItem {
  title: string;
  description?: string;
  event_date: string;
  max_attendees?: number;
  auto_promote?: boolean;
}

interface HRRequest extends BaseItem {
  employee_phone: string;
  employee_name?: string;
  request_type: string;
  reason?: string;
  status?: string;
  call_recording_url?: string;
}

interface DigitalCard extends BaseItem {
  name: string;
  title?: string;
  company?: string;
  email: string;
  phone?: string;
  image_url?: string;
  ipfs_hash: string;
  qr_code_url: string;
  verification_url: string;
}

interface VideoSummary extends BaseItem {
  title: string;
  description?: string;
  duration?: string;
  status: 'generating' | 'completed' | 'failed';
  thumbnail_url?: string;
  video_url?: string;
  call_id?: string;
}

// Create the context
const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Demo data generator
const generateDemoData = (userId: string) => {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    agents: [
      {
        id: 'agent_1',
        name: 'Dr. Sarah Johnson',
        voice: 'serena',
        voice_engine: 'retell',
        greeting: 'Hello, this is Dr. Sarah Johnson. How can I help you today?',
        temperature: 0.7,
        interruption_sensitivity: 0.5,
        created_at: lastWeek,
        user_id: userId
      },
      {
        id: 'agent_2',
        name: 'Customer Support',
        voice: 'morgan',
        voice_engine: 'retell',
        greeting: 'Thank you for calling customer support. How may I assist you today?',
        temperature: 0.5,
        interruption_sensitivity: 0.3,
        created_at: yesterday,
        user_id: userId
      }
    ],
    calls: [
      {
        id: 'call_1',
        callee: '+1 (555) 123-4567',
        direction: 'outbound',
        status: 'completed',
        started_at: yesterday,
        ended_at: yesterday,
        duration_seconds: 180,
        agent_id: 'agent_1',
        transcript: "Agent: Hello, this is Dr. Sarah Johnson. How can I help you today?\n\nCaller: Hi, I'd like to schedule an appointment for next week.\n\nAgent: I'd be happy to help you with that. What day works best for you?\n\nCaller: Tuesday morning would be great if you have availability.\n\nAgent: Let me check... Yes, I have an opening at 10:00 AM on Tuesday. Would that work for you?\n\nCaller: That's perfect.\n\nAgent: Great! I've scheduled you for Tuesday at 10:00 AM. May I have your name please?\n\nCaller: John Smith.\n\nAgent: Thank you, John. We look forward to seeing you on Tuesday at 10:00 AM.",
        recording_url: 'https://example.com/recording.mp3',
        cost: 0.75,
        created_at: yesterday,
        user_id: userId
      },
      {
        id: 'call_2',
        callee: '+1 (555) 987-6543',
        direction: 'inbound',
        status: 'completed',
        started_at: now,
        ended_at: now,
        duration_seconds: 240,
        agent_id: 'agent_2',
        transcript: "Agent: Thank you for calling customer support. How may I assist you today?\n\nCaller: I have a question about my recent order.\n\nAgent: I'd be happy to help with that. Could you please provide your order number?\n\nCaller: Yes, it's ABC12345.\n\nAgent: Thank you. I see your order was shipped yesterday and should arrive by Friday. Is there anything specific you'd like to know about it?\n\nCaller: That's exactly what I wanted to know. Thank you.\n\nAgent: You're welcome! Is there anything else I can help you with today?\n\nCaller: No, that's all. Thank you.\n\nAgent: Thank you for calling. Have a great day!",
        recording_url: 'https://example.com/recording2.mp3',
        cost: 0.90,
        created_at: now,
        user_id: userId
      }
    ],
    phoneNumbers: [
      {
        id: 'phone_1',
        phone_number: '+1 (555) 123-4567',
        provider: 'retell',
        type: 'provisioned',
        label: 'Main Office',
        is_active: true,
        created_at: lastWeek,
        user_id: userId
      },
      {
        id: 'phone_2',
        phone_number: '+1 (555) 987-6543',
        provider: 'elevenlabs',
        type: 'provisioned',
        label: 'Support Line',
        is_active: true,
        created_at: yesterday,
        user_id: userId
      }
    ],
    knowledgeBases: [
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
        created_at: lastWeek,
        updated_at: yesterday,
        user_id: userId
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
        created_at: yesterday,
        updated_at: now,
        user_id: userId
      }
    ],
    complianceScripts: [
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
        created_at: lastWeek,
        user_id: userId
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
        created_at: yesterday,
        user_id: userId
      }
    ],
    conversationFlows: [
      {
        id: 'flow_1',
        name: 'Patient Intake',
        description: 'Initial patient information gathering flow',
        flow_data: { 
          nodes: [
            { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 }, connections: [] }
          ]
        },
        is_active: true,
        version: 1,
        created_at: lastWeek,
        updated_at: yesterday,
        user_id: userId
      },
      {
        id: 'flow_2',
        name: 'Appointment Scheduling',
        description: 'Flow for scheduling patient appointments',
        flow_data: { 
          nodes: [
            { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 }, connections: [] }
          ]
        },
        is_active: true,
        version: 1,
        created_at: yesterday,
        updated_at: now,
        user_id: userId
      }
    ],
    events: [
      {
        id: 'event_1',
        title: 'Invisalign Information Day',
        description: 'Learn about Invisalign treatment options and speak with specialists',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_attendees: 50,
        auto_promote: true,
        created_at: yesterday,
        user_id: userId
      },
      {
        id: 'event_2',
        title: 'Dental Health Seminar',
        description: 'Free seminar on maintaining optimal dental health',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        max_attendees: 30,
        auto_promote: false,
        created_at: now,
        user_id: userId
      }
    ],
    hrRequests: [
      {
        id: 'hr_1',
        employee_phone: '+1 (555) 234-5678',
        employee_name: 'John Doe',
        request_type: 'sick_leave',
        reason: 'Flu symptoms, doctor recommended 3 days rest',
        status: 'approved',
        created_at: yesterday,
        user_id: userId
      },
      {
        id: 'hr_2',
        employee_phone: '+1 (555) 876-5432',
        employee_name: 'Jane Smith',
        request_type: 'vacation',
        reason: 'Family vacation',
        status: 'pending',
        created_at: now,
        user_id: userId
      }
    ],
    digitalCards: [
      {
        id: 'card_1',
        name: 'Dr. Sarah Johnson',
        title: 'Chief Medical Officer',
        company: 'BlvckWall Medical AI',
        email: 'sarah.johnson@blvckwall.ai',
        phone: '+1 (555) 123-4567',
        image_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
        ipfs_hash: 'QmDemo123456789SarahJohnson',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ipfs.io/ipfs/QmDemo123456789SarahJohnson',
        verification_url: 'https://picaos.com/verify/QmDemo123456789SarahJohnson',
        created_at: lastWeek,
        user_id: userId
      },
      {
        id: 'card_2',
        name: 'Michael Chen',
        title: 'AI Solutions Architect',
        company: 'BlvckWall AI',
        email: 'michael.chen@blvckwall.ai',
        phone: '+1 (555) 987-6543',
        image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
        ipfs_hash: 'QmDemo987654321MichaelChen',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ipfs.io/ipfs/QmDemo987654321MichaelChen',
        verification_url: 'https://picaos.com/verify/QmDemo987654321MichaelChen',
        created_at: yesterday,
        user_id: userId
      }
    ],
    videoSummaries: [
      {
        id: 'video_1',
        title: 'Patient Consultation Summary',
        description: 'Dr. Smith consultation with John Doe regarding treatment options',
        duration: '2:34',
        status: 'completed',
        thumbnail_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
        video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        call_id: 'call_1',
        created_at: yesterday,
        user_id: userId
      },
      {
        id: 'video_2',
        title: 'Follow-up Appointment Summary',
        description: 'Follow-up discussion about treatment progress',
        duration: '1:45',
        status: 'completed',
        thumbnail_url: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=300',
        video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        call_id: 'call_2',
        created_at: now,
        user_id: userId
      }
    ]
  };
};

// Provider component
export function StorageProvider({ children }: { children: ReactNode }) {
  // State for user data
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode] = useState(true);
  
  // State for collections
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [complianceScripts, setComplianceScripts] = useState<ComplianceScript[]>([]);
  const [conversationFlows, setConversationFlows] = useState<ConversationFlow[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [hrRequests, setHRRequests] = useState<HRRequest[]>([]);
  const [digitalCards, setDigitalCards] = useState<DigitalCard[]>([]);
  const [videoSummaries, setVideoSummaries] = useState<VideoSummary[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('[StorageContext] Initializing storage context');
    
    // Check for existing session
    const storedUser = localStorage.getItem('blvckwall_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        loadUserData(userData.id);
      } catch (error) {
        console.error('[StorageContext] Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('blvckwall_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('agents', agents, user.id);
    }
  }, [agents, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('calls', calls, user.id);
    }
  }, [calls, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('phoneNumbers', phoneNumbers, user.id);
    }
  }, [phoneNumbers, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('knowledgeBases', knowledgeBases, user.id);
    }
  }, [knowledgeBases, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('complianceScripts', complianceScripts, user.id);
    }
  }, [complianceScripts, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('conversationFlows', conversationFlows, user.id);
    }
  }, [conversationFlows, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('events', events, user.id);
    }
  }, [events, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('hrRequests', hrRequests, user.id);
    }
  }, [hrRequests, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('digitalCards', digitalCards, user.id);
    }
  }, [digitalCards, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveCollectionToStorage('videoSummaries', videoSummaries, user.id);
    }
  }, [videoSummaries, user?.id]);

  // Helper to save a collection to localStorage
  const saveCollectionToStorage = <T extends BaseItem>(
    collectionName: string, 
    data: T[],
    userId: string
  ) => {
    try {
      localStorage.setItem(`blvckwall_${userId}_${collectionName}`, JSON.stringify(data));
    } catch (error) {
      console.error(`[StorageContext] Error saving ${collectionName} to localStorage:`, error);
    }
  };

  // Helper to load a collection from localStorage
  const loadCollectionFromStorage = <T extends BaseItem>(
    collectionName: string,
    userId: string
  ): T[] => {
    try {
      const storedData = localStorage.getItem(`blvckwall_${userId}_${collectionName}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error(`[StorageContext] Error loading ${collectionName} from localStorage:`, error);
    }
    return [];
  };

  // Load all user data
  const loadUserData = (userId: string) => {
    console.log(`[StorageContext] Loading data for user: ${userId}`);
    setIsLoading(true);
    
    try {
      // Check if user has any data
      const hasData = Object.keys(localStorage).some(key => key.startsWith(`blvckwall_${userId}`));
      
      if (!hasData) {
        console.log('[StorageContext] No existing data found, generating demo data');
        // Generate demo data for new users
        const demoData = generateDemoData(userId);
        
        // Set all collections
        setAgents(demoData.agents);
        setCalls(demoData.calls);
        setPhoneNumbers(demoData.phoneNumbers);
        setKnowledgeBases(demoData.knowledgeBases);
        setComplianceScripts(demoData.complianceScripts);
        setConversationFlows(demoData.conversationFlows);
        setEvents(demoData.events);
        setHRRequests(demoData.hrRequests);
        setDigitalCards(demoData.digitalCards);
        setVideoSummaries(demoData.videoSummaries);
        
        // Save all collections to localStorage
        Object.entries(demoData).forEach(([collection, data]) => {
          saveCollectionToStorage(collection, data, userId);
        });
      } else {
        console.log('[StorageContext] Loading existing data from localStorage');
        // Load existing data
        setAgents(loadCollectionFromStorage<Agent>('agents', userId));
        setCalls(loadCollectionFromStorage<Call>('calls', userId));
        setPhoneNumbers(loadCollectionFromStorage<PhoneNumber>('phoneNumbers', userId));
        setKnowledgeBases(loadCollectionFromStorage<KnowledgeBase>('knowledgeBases', userId));
        setComplianceScripts(loadCollectionFromStorage<ComplianceScript>('complianceScripts', userId));
        setConversationFlows(loadCollectionFromStorage<ConversationFlow>('conversationFlows', userId));
        setEvents(loadCollectionFromStorage<Event>('events', userId));
        setHRRequests(loadCollectionFromStorage<HRRequest>('hrRequests', userId));
        setDigitalCards(loadCollectionFromStorage<DigitalCard>('digitalCards', userId));
        setVideoSummaries(loadCollectionFromStorage<VideoSummary>('videoSummaries', userId));
      }
    } catch (error) {
      console.error('[StorageContext] Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generic CRUD operations
  const addItem = async <T extends BaseItem>(
    collection: string,
    item: Omit<T, 'id' | 'created_at'>
  ): Promise<T> => {
    if (!user) throw new Error('Not authenticated');
    
    console.log(`[StorageContext] Adding item to ${collection}:`, item);
    
    const newItem = {
      ...item,
      id: `${collection.slice(0, -1)}_${Date.now()}`,
      created_at: new Date().toISOString(),
      user_id: user.id
    } as T;
    
    // Update the appropriate collection
    switch (collection) {
      case 'agents':
        setAgents(prev => [newItem as Agent, ...prev]);
        break;
      case 'calls':
        setCalls(prev => [newItem as Call, ...prev]);
        break;
      case 'phoneNumbers':
        setPhoneNumbers(prev => [newItem as PhoneNumber, ...prev]);
        break;
      case 'knowledgeBases':
        setKnowledgeBases(prev => [newItem as KnowledgeBase, ...prev]);
        break;
      case 'complianceScripts':
        setComplianceScripts(prev => [newItem as ComplianceScript, ...prev]);
        break;
      case 'conversationFlows':
        setConversationFlows(prev => [newItem as ConversationFlow, ...prev]);
        break;
      case 'events':
        setEvents(prev => [newItem as Event, ...prev]);
        break;
      case 'hrRequests':
        setHRRequests(prev => [newItem as HRRequest, ...prev]);
        break;
      case 'digitalCards':
        setDigitalCards(prev => [newItem as DigitalCard, ...prev]);
        break;
      case 'videoSummaries':
        setVideoSummaries(prev => [newItem as VideoSummary, ...prev]);
        break;
      default:
        throw new Error(`Unknown collection: ${collection}`);
    }
    
    return newItem;
  };

  const updateItem = async <T extends BaseItem>(
    collection: string,
    id: string,
    updates: Partial<T>
  ): Promise<T> => {
    if (!user) throw new Error('Not authenticated');
    
    console.log(`[StorageContext] Updating item in ${collection}:`, id, updates);
    
    let updatedItem: T | null = null;
    
    // Update the appropriate collection
    switch (collection) {
      case 'agents':
        setAgents(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'calls':
        setCalls(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'phoneNumbers':
        setPhoneNumbers(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'knowledgeBases':
        setKnowledgeBases(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'complianceScripts':
        setComplianceScripts(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'conversationFlows':
        setConversationFlows(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'events':
        setEvents(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'hrRequests':
        setHRRequests(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'digitalCards':
        setDigitalCards(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      case 'videoSummaries':
        setVideoSummaries(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, ...updates, user_id: user.id } : item
          );
          const found = updated.find(item => item.id === id);
          if (found) updatedItem = found as unknown as T;
          return updated;
        });
        break;
      default:
        throw new Error(`Unknown collection: ${collection}`);
    }
    
    if (!updatedItem) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    
    return updatedItem;
  };

  const deleteItem = async (collection: string, id: string): Promise<boolean> => {
    if (!user) throw new Error('Not authenticated');
    
    console.log(`[StorageContext] Deleting item from ${collection}:`, id);
    
    // Delete from the appropriate collection
    switch (collection) {
      case 'agents':
        setAgents(prev => prev.filter(item => item.id !== id));
        break;
      case 'calls':
        setCalls(prev => prev.filter(item => item.id !== id));
        break;
      case 'phoneNumbers':
        setPhoneNumbers(prev => prev.filter(item => item.id !== id));
        break;
      case 'knowledgeBases':
        setKnowledgeBases(prev => prev.filter(item => item.id !== id));
        break;
      case 'complianceScripts':
        setComplianceScripts(prev => prev.filter(item => item.id !== id));
        break;
      case 'conversationFlows':
        setConversationFlows(prev => prev.filter(item => item.id !== id));
        break;
      case 'events':
        setEvents(prev => prev.filter(item => item.id !== id));
        break;
      case 'hrRequests':
        setHRRequests(prev => prev.filter(item => item.id !== id));
        break;
      case 'digitalCards':
        setDigitalCards(prev => prev.filter(item => item.id !== id));
        break;
      case 'videoSummaries':
        setVideoSummaries(prev => prev.filter(item => item.id !== id));
        break;
      default:
        throw new Error(`Unknown collection: ${collection}`);
    }
    
    return true;
  };

  // Authentication methods
  const login = async (email: string, password: string): Promise<UserData> => {
    console.log(`[StorageContext] Login attempt for: ${email}`);
    setIsLoading(true);
    
    try {
      // In demo mode, we'll accept any credentials
      const userId = `user_${Date.now()}`;
      const userData: UserData = {
        id: userId,
        email,
        name: email.split('@')[0]
      };
      
      // Save user to localStorage
      localStorage.setItem('blvckwall_user', JSON.stringify(userData));
      
      // Set user in state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Load or generate user data
      loadUserData(userId);
      
      return userData;
    } catch (error) {
      console.error('[StorageContext] Login error:', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[StorageContext] Logging out');
    
    // Clear user from localStorage
    localStorage.removeItem('blvckwall_user');
    
    // Clear user from state
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear all collections
    setAgents([]);
    setCalls([]);
    setPhoneNumbers([]);
    setKnowledgeBases([]);
    setComplianceScripts([]);
    setConversationFlows([]);
    setEvents([]);
    setHRRequests([]);
    setDigitalCards([]);
    setVideoSummaries([]);
  };

  return (
    <StorageContext.Provider
      value={{
        // User data
        user,
        setUser,
        
        // Data collections
        agents,
        calls,
        phoneNumbers,
        knowledgeBases,
        complianceScripts,
        conversationFlows,
        events,
        hrRequests,
        digitalCards,
        videoSummaries,
        
        // CRUD operations
        addItem,
        updateItem,
        deleteItem,
        
        // Authentication
        login,
        logout,
        isAuthenticated,
        
        // Demo mode
        isDemoMode,
        
        // Loading state
        isLoading
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

// Hook to use the storage context
export function useStorage() {
    }
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}