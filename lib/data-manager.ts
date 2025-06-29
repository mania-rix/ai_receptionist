/**
 * Data management utilities for secure storage and retrieval
 */
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase-browser';
import { getCurrentUser } from '@/lib/auth-utils';

// Constants
const STORAGE_PREFIX = 'blvckwall_';
const COMPRESSION_THRESHOLD = 10000; // Bytes

// Data categories
export const DATA_CATEGORIES = {
  KB_ARTICLES: 'kb_articles',
  VIDEO_SUMMARIES: 'video_summaries',
  CONVERSATION_TEMPLATES: 'conversation_templates',
  COMPLIANCE_SCRIPTS: 'compliance_scripts',
  AGENT_PROFILES: 'agent_profiles',
  CUSTOMER_INTERACTIONS: 'customer_interactions'
};

// Data validation schemas
const VALIDATION_SCHEMAS = {
  [DATA_CATEGORIES.KB_ARTICLES]: {
    required: ['title', 'content', 'category'],
    maxLength: { title: 100, content: 10000 }
  },
  [DATA_CATEGORIES.VIDEO_SUMMARIES]: {
    required: ['title', 'timestamps', 'summary'],
    maxLength: { title: 100, summary: 5000 }
  },
  [DATA_CATEGORIES.CONVERSATION_TEMPLATES]: {
    required: ['name', 'nodes'],
    maxLength: { name: 100 }
  },
  [DATA_CATEGORIES.COMPLIANCE_SCRIPTS]: {
    required: ['name', 'content', 'category'],
    maxLength: { name: 100, content: 5000 }
  },
  [DATA_CATEGORIES.AGENT_PROFILES]: {
    required: ['name', 'voice', 'greeting'],
    maxLength: { name: 100, greeting: 500 }
  },
  [DATA_CATEGORIES.CUSTOMER_INTERACTIONS]: {
    required: ['customer_id', 'type', 'content'],
    maxLength: { content: 10000 }
  }
};

/**
 * Compress data if it exceeds threshold
 */
function compressData(data: any): string {
  const jsonString = JSON.stringify(data);
  
  if (jsonString.length < COMPRESSION_THRESHOLD) {
    return jsonString;
  }
  
  // Simple compression by removing whitespace
  // In a production app, you'd use a proper compression library
  return JSON.stringify(data);
}

/**
 * Decompress data
 */
function decompressData(data: string): any {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('[DataManager] Decompression error:', error);
    return null;
  }
}

/**
 * Validate data against schema
 */
function validateData(category: string, data: any): { valid: boolean; errors: string[] } {
  const schema = VALIDATION_SCHEMAS[category];
  if (!schema) return { valid: true, errors: [] };
  
  const errors: string[] = [];
  
  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`Field '${field}' is required`);
      }
    }
  }
  
  // Check max lengths
  if (schema.maxLength) {
    for (const [field, maxLength] of Object.entries(schema.maxLength)) {
      if (data[field] && typeof data[field] === 'string' && data[field].length > maxLength) {
        errors.push(`Field '${field}' exceeds maximum length of ${maxLength}`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get storage key for a category
 */
function getStorageKey(category: string, userId?: string): string {
  const user = userId || 'demo-user-id';
  return `${STORAGE_PREFIX}${user}_${category}`;
}

/**
 * Initialize sample data for a new user
 */
export async function initializeSampleData(userId: string): Promise<void> {
  console.log('[DataManager] Initializing sample data for user:', userId);
  
  try {
    // Check if data already exists
    const existingData = localStorage.getItem(getStorageKey(DATA_CATEGORIES.KB_ARTICLES, userId));
    if (existingData) {
      console.log('[DataManager] Sample data already exists for user');
      return;
    }
    
    // Initialize knowledge base articles
    const kbArticles = await fetchKnowledgeBaseArticles();
    saveData(DATA_CATEGORIES.KB_ARTICLES, kbArticles, userId);
    
    // Initialize video summaries
    const videoSummaries = await fetchVideoSummaries();
    saveData(DATA_CATEGORIES.VIDEO_SUMMARIES, videoSummaries, userId);
    
    // Initialize conversation templates
    const conversationTemplates = await fetchConversationTemplates();
    saveData(DATA_CATEGORIES.CONVERSATION_TEMPLATES, conversationTemplates, userId);
    
    // Initialize compliance scripts
    const complianceScripts = await fetchComplianceScripts();
    saveData(DATA_CATEGORIES.COMPLIANCE_SCRIPTS, complianceScripts, userId);
    
    // Initialize agent profiles
    const agentProfiles = await fetchAgentProfiles();
    saveData(DATA_CATEGORIES.AGENT_PROFILES, agentProfiles, userId);
    
    // Initialize customer interactions
    const customerInteractions = await fetchCustomerInteractions();
    saveData(DATA_CATEGORIES.CUSTOMER_INTERACTIONS, customerInteractions, userId);
    
    console.log('[DataManager] Sample data initialization complete');
  } catch (error) {
    console.error('[DataManager] Error initializing sample data:', error);
    throw error;
  }
}

/**
 * Save data to storage
 */
export function saveData(category: string, data: any, userId?: string): void {
  try {
    const key = getStorageKey(category, userId);
    const compressedData = compressData(data);
    localStorage.setItem(key, compressedData);
    console.log(`[DataManager] Saved data for category: ${category}`);
  } catch (error) {
    console.error(`[DataManager] Error saving data for category ${category}:`, error);
    throw error;
  }
}

/**
 * Load data from storage
 */
export function loadData(category: string, userId?: string): any {
  try {
    const key = getStorageKey(category, userId);
    const compressedData = localStorage.getItem(key);
    
    if (!compressedData) {
      console.log(`[DataManager] No data found for category: ${category}`);
      return null;
    }
    
    const data = decompressData(compressedData);
    console.log(`[DataManager] Loaded data for category: ${category}`);
    return data;
  } catch (error) {
    console.error(`[DataManager] Error loading data for category ${category}:`, error);
    return null;
  }
}

/**
 * Create a new item
 */
export async function createItem(category: string, item: any, userId?: string): Promise<any> {
  console.log(`[DataManager] Creating item in category: ${category}`);
  
  try {
    // Validate data
    const validation = validateData(category, item);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Add metadata
    const newItem = {
      ...item,
      id: item.id || uuidv4(),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1
    };
    
    // Get existing data
    const existingData = loadData(category, userId) || [];
    
    // Add new item
    const updatedData = [newItem, ...existingData];
    
    // Save updated data
    saveData(category, updatedData, userId);
    
    console.log(`[DataManager] Item created in category ${category}:`, newItem.id);
    return newItem;
  } catch (error) {
    console.error(`[DataManager] Error creating item in category ${category}:`, error);
    throw error;
  }
}

/**
 * Read an item by ID
 */
export function readItem(category: string, id: string, userId?: string): any {
  console.log(`[DataManager] Reading item from category: ${category}, id: ${id}`);
  
  try {
    const data = loadData(category, userId) || [];
    const item = data.find((item: any) => item.id === id);
    
    if (!item) {
      console.log(`[DataManager] Item not found in category ${category}: ${id}`);
      return null;
    }
    
    console.log(`[DataManager] Item read from category ${category}: ${id}`);
    return item;
  } catch (error) {
    console.error(`[DataManager] Error reading item from category ${category}:`, error);
    return null;
  }
}

/**
 * Update an item
 */
export async function updateItem(category: string, id: string, updates: any, userId?: string): Promise<any> {
  console.log(`[DataManager] Updating item in category: ${category}, id: ${id}`);
  
  try {
    // Get existing data
    const data = loadData(category, userId) || [];
    const itemIndex = data.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error(`Item not found in category ${category}: ${id}`);
    }
    
    // Create updated item
    const oldItem = data[itemIndex];
    const updatedItem = {
      ...oldItem,
      ...updates,
      updated_at: new Date().toISOString(),
      version: (oldItem.version || 1) + 1
    };
    
    // Validate updated item
    const validation = validateData(category, updatedItem);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Update data array
    data[itemIndex] = updatedItem;
    
    // Save updated data
    saveData(category, data, userId);
    
    console.log(`[DataManager] Item updated in category ${category}: ${id}`);
    return updatedItem;
  } catch (error) {
    console.error(`[DataManager] Error updating item in category ${category}:`, error);
    throw error;
  }
}

/**
 * Delete an item
 */
export async function deleteItem(category: string, id: string, userId?: string): Promise<boolean> {
  console.log(`[DataManager] Deleting item from category: ${category}, id: ${id}`);
  
  try {
    // Get existing data
    const data = loadData(category, userId) || [];
    const itemIndex = data.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error(`Item not found in category ${category}: ${id}`);
    }
    
    // Remove item
    data.splice(itemIndex, 1);
    
    // Save updated data
    saveData(category, data, userId);
    
    console.log(`[DataManager] Item deleted from category ${category}: ${id}`);
    return true;
  } catch (error) {
    console.error(`[DataManager] Error deleting item from category ${category}:`, error);
    throw error;
  }
}

/**
 * List all items in a category
 */
export function listItems(category: string, userId?: string): any[] {
  console.log(`[DataManager] Listing items in category: ${category}`);
  
  try {
    const data = loadData(category, userId) || [];
    console.log(`[DataManager] Found ${data.length} items in category ${category}`);
    return data;
  } catch (error) {
    console.error(`[DataManager] Error listing items in category ${category}:`, error);
    return [];
  }
}

/**
 * Clear all data for a user
 */
export function clearUserData(userId?: string): void {
  console.log(`[DataManager] Clearing all data for user`);
  
  try {
    Object.values(DATA_CATEGORIES).forEach(category => {
      const key = getStorageKey(category, userId);
      localStorage.removeItem(key);
    });
    
    console.log('[DataManager] All user data cleared');
  } catch (error) {
    console.error('[DataManager] Error clearing user data:', error);
    throw error;
  }
}

// API fetch functions for sample data
async function fetchKnowledgeBaseArticles() {
  try {
    // In a real implementation, this would fetch from an API
    return [
      {
        id: uuidv4(),
        title: 'Getting Started with BlvckWall AI',
        content: 'Welcome to BlvckWall AI! This guide will help you get started with our platform...',
        category: 'onboarding',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Setting Up Your First AI Agent',
        content: 'AI agents are the core of the BlvckWall platform. To create your first agent...',
        category: 'agents',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Understanding Call Analytics',
        content: 'Call analytics provide insights into your AI-powered conversations...',
        category: 'analytics',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'HIPAA Compliance Guide',
        content: 'Ensuring HIPAA compliance is critical for healthcare organizations...',
        category: 'compliance',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Voice Customization Options',
        content: 'BlvckWall AI offers several voice customization options...',
        category: 'voices',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Integrating with Your CRM',
        content: 'BlvckWall AI can integrate with popular CRM systems...',
        category: 'integrations',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Conversation Flow Design Best Practices',
        content: 'Designing effective conversation flows is key to successful AI interactions...',
        category: 'conversation-design',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Troubleshooting Common Issues',
        content: 'This article addresses common issues you might encounter...',
        category: 'support',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Security Best Practices',
        content: 'Securing your BlvckWall AI implementation is critical...',
        category: 'security',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'API Documentation',
        content: 'The BlvckWall AI API allows you to programmatically interact with our platform...',
        category: 'developers',
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('[DataManager] Error fetching knowledge base articles:', error);
    return [];
  }
}

async function fetchVideoSummaries() {
  try {
    // In a real implementation, this would fetch from an API
    return [
      {
        id: uuidv4(),
        title: 'Patient Consultation Summary',
        timestamps: [
          { time: '00:15', label: 'Introduction' },
          { time: '01:23', label: 'Symptoms Discussion' },
          { time: '03:45', label: 'Treatment Options' }
        ],
        summary: 'Dr. Smith discusses treatment options for chronic back pain...',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Follow-up Appointment',
        timestamps: [
          { time: '00:10', label: 'Progress Review' },
          { time: '01:05', label: 'Medication Adjustment' },
          { time: '02:30', label: 'Next Steps' }
        ],
        summary: 'Review of patient progress after initial treatment...',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Pre-Surgery Consultation',
        timestamps: [
          { time: '00:20', label: 'Procedure Overview' },
          { time: '02:15', label: 'Risks and Benefits' },
          { time: '04:30', label: 'Recovery Expectations' }
        ],
        summary: 'Detailed explanation of upcoming surgical procedure...',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Medication Review',
        timestamps: [
          { time: '00:30', label: 'Current Medications' },
          { time: '01:45', label: 'Side Effects Discussion' },
          { time: '03:20', label: 'Prescription Updates' }
        ],
        summary: 'Comprehensive review of patient's medication regimen...',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Therapy Session Summary',
        timestamps: [
          { time: '00:15', label: 'Session Goals' },
          { time: '02:00', label: 'Key Insights' },
          { time: '04:15', label: 'Homework Assignments' }
        ],
        summary: 'Summary of cognitive behavioral therapy session...',
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('[DataManager] Error fetching video summaries:', error);
    return [];
  }
}

async function fetchConversationTemplates() {
  try {
    // In a real implementation, this would fetch from an API
    return [
      {
        id: uuidv4(),
        name: 'Appointment Scheduling',
        description: 'Template for scheduling patient appointments',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'Hello, I\'d like to help you schedule an appointment. What day works best for you?', position: { x: 100, y: 200 } },
          { id: 'check_availability', type: 'condition', content: 'Check calendar availability', position: { x: 100, y: 300 } }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Insurance Verification',
        description: 'Template for verifying patient insurance',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'I\'ll help you verify your insurance coverage. Can you provide your insurance provider name?', position: { x: 100, y: 200 } }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Medication Refill',
        description: 'Template for handling medication refill requests',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'I understand you need a medication refill. Which medication do you need refilled?', position: { x: 100, y: 200 } }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'New Patient Intake',
        description: 'Template for new patient registration',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'Welcome! I\'ll help you register as a new patient. Let\'s start with your full name.', position: { x: 100, y: 200 } }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Billing Inquiry',
        description: 'Template for handling billing questions',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'I can help with your billing inquiry. What specific question do you have about your bill?', position: { x: 100, y: 200 } }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Lab Results',
        description: 'Template for discussing lab results',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'I\'m calling about your recent lab results. For security, can you verify your date of birth?', position: { x: 100, y: 200 } }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Appointment Reminder',
        description: 'Template for appointment reminders',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'This is a reminder about your upcoming appointment on [date] at [time]. Would you like to confirm this appointment?', position: { x: 100, y: 200 } }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Post-Procedure Follow-up',
        description: 'Template for post-procedure check-ins',
        nodes: [
          { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
          { id: 'greeting', type: 'message', content: 'I\'m calling to follow up after your recent procedure. How are you feeling today?', position: { x: 100, y: 200 } }
        ],
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('[DataManager] Error fetching conversation templates:', error);
    return [];
  }
}

async function fetchComplianceScripts() {
  try {
    // In a real implementation, this would fetch from an API
    return [
      {
        id: uuidv4(),
        name: 'HIPAA Compliance Introduction',
        content: 'This call may be recorded for quality assurance. Your information is protected under HIPAA regulations. Do you consent to this recording?',
        category: 'healthcare',
        required_phrases: [
          'This call may be recorded',
          'protected under HIPAA',
          'Do you consent'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Financial Services Disclosure',
        content: 'This call is being monitored and recorded. Investment products are not FDIC insured and past performance does not guarantee future results.',
        category: 'financial',
        required_phrases: [
          'monitored and recorded',
          'not FDIC insured',
          'past performance does not guarantee'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Telehealth Consent',
        content: 'This telehealth session is encrypted and confidential. Medical advice provided is not a substitute for in-person examination. Do you understand and consent to these terms?',
        category: 'telehealth',
        required_phrases: [
          'encrypted and confidential',
          'not a substitute for in-person',
          'understand and consent'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Insurance Verification Script',
        content: 'For verification purposes, I need to confirm your identity. This information is protected by our privacy policy. May I have your full name and date of birth?',
        category: 'insurance',
        required_phrases: [
          'verification purposes',
          'protected by our privacy policy',
          'full name and date of birth'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Prescription Refill Verification',
        content: 'For your safety and to comply with regulations, I need to verify your identity before processing this prescription refill. Can you confirm your full name, date of birth, and the medication you're requesting?',
        category: 'pharmacy',
        required_phrases: [
          'for your safety',
          'comply with regulations',
          'verify your identity'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Medical Advice Disclaimer',
        content: 'Please note that this information is for general guidance only and does not constitute medical advice. Always consult with your healthcare provider for diagnosis and treatment recommendations.',
        category: 'medical',
        required_phrases: [
          'general guidance only',
          'does not constitute medical advice',
          'consult with your healthcare provider'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Clinical Trial Disclosure',
        content: 'This clinical trial involves experimental treatments that have not been approved by the FDA. Participation is voluntary, and you may withdraw at any time. Do you understand these terms?',
        category: 'research',
        required_phrases: [
          'experimental treatments',
          'not been approved',
          'participation is voluntary'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Mental Health Crisis Protocol',
        content: 'If you're experiencing thoughts of harming yourself or others, please be aware that I'm required by law to take steps to ensure your safety, which may include contacting emergency services. Do you understand?',
        category: 'mental-health',
        required_phrases: [
          'required by law',
          'ensure your safety',
          'contacting emergency services'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Billing Authorization',
        content: 'I'm going to ask for your payment information. By providing this information, you authorize us to charge your account for the services discussed. Do you consent to this authorization?',
        category: 'billing',
        required_phrases: [
          'payment information',
          'authorize us to charge',
          'consent to this authorization'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Telemedicine Limitations',
        content: 'Telemedicine has limitations compared to in-person visits. If your symptoms worsen or change, please seek in-person medical care immediately. Do you understand these limitations?',
        category: 'telehealth',
        required_phrases: [
          'limitations compared to in-person',
          'symptoms worsen',
          'seek in-person medical care'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Data Privacy Disclosure',
        content: 'Your data is protected under our privacy policy and applicable laws. We do not sell your information to third parties. You can request access to or deletion of your data at any time.',
        category: 'privacy',
        required_phrases: [
          'protected under our privacy policy',
          'do not sell your information',
          'request access to or deletion'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Appointment Cancellation Policy',
        content: 'Please note our 24-hour cancellation policy. Appointments cancelled with less than 24 hours notice may incur a fee. Do you understand and accept this policy?',
        category: 'scheduling',
        required_phrases: [
          '24-hour cancellation policy',
          'may incur a fee',
          'understand and accept'
        ],
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('[DataManager] Error fetching compliance scripts:', error);
    return [];
  }
}

async function fetchAgentProfiles() {
  try {
    // In a real implementation, this would fetch from an API
    return [
      {
        id: uuidv4(),
        name: 'Dr. Sarah Johnson',
        voice: 'serena',
        greeting: 'Hello, I\'m Dr. Sarah Johnson. How can I assist you today?',
        specialty: 'General Medicine',
        contact: { email: 'sarah.johnson@blvckwall.ai', phone: '+1 (555) 123-4567' },
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Dr. Michael Chen',
        voice: 'morgan',
        greeting: 'Hi there, this is Dr. Michael Chen. What brings you in today?',
        specialty: 'Cardiology',
        contact: { email: 'michael.chen@blvckwall.ai', phone: '+1 (555) 234-5678' },
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Dr. Emily Rodriguez',
        voice: 'ava',
        greeting: 'Hello, I\'m Dr. Rodriguez. How may I help you today?',
        specialty: 'Pediatrics',
        contact: { email: 'emily.rodriguez@blvckwall.ai', phone: '+1 (555) 345-6789' },
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Dr. James Wilson',
        voice: 'ryan',
        greeting: 'Good day, this is Dr. Wilson speaking. How can I be of assistance?',
        specialty: 'Neurology',
        contact: { email: 'james.wilson@blvckwall.ai', phone: '+1 (555) 456-7890' },
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Dr. Aisha Patel',
        voice: 'sophia',
        greeting: 'Hello, Dr. Patel here. What can I do for you today?',
        specialty: 'Dermatology',
        contact: { email: 'aisha.patel@blvckwall.ai', phone: '+1 (555) 567-8901' },
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Dr. Robert Kim',
        voice: 'james',
        greeting: 'Hello, this is Dr. Kim. How may I assist you today?',
        specialty: 'Orthopedics',
        contact: { email: 'robert.kim@blvckwall.ai', phone: '+1 (555) 678-9012' },
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Dr. Lisa Thompson',
        voice: 'serena',
        greeting: 'Hi, Dr. Thompson speaking. What brings you to our practice today?',
        specialty: 'Psychiatry',
        contact: { email: 'lisa.thompson@blvckwall.ai', phone: '+1 (555) 789-0123' },
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Dr. David Nguyen',
        voice: 'morgan',
        greeting: 'Hello, I\'m Dr. Nguyen. How can I help you today?',
        specialty: 'Gastroenterology',
        contact: { email: 'david.nguyen@blvckwall.ai', phone: '+1 (555) 890-1234' },
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('[DataManager] Error fetching agent profiles:', error);
    return [];
  }
}

async function fetchCustomerInteractions() {
  try {
    // In a real implementation, this would fetch from an API
    const interactions = [];
    const interactionTypes = ['call', 'email', 'chat', 'in-person'];
    const statuses = ['completed', 'scheduled', 'cancelled', 'no-show'];
    
    for (let i = 1; i <= 25; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      interactions.push({
        id: uuidv4(),
        customer_id: `CUST${1000 + i}`,
        customer_name: `Patient ${i}`,
        type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        date: date.toISOString(),
        content: `Interaction notes for patient ${i}. This was a ${interactionTypes[Math.floor(Math.random() * interactionTypes.length)]} interaction.`,
        agent_id: `agent_${Math.floor(Math.random() * 8) + 1}`,
        created_at: new Date().toISOString()
      });
    }
    
    return interactions;
  } catch (error) {
    console.error('[DataManager] Error fetching customer interactions:', error);
    return [];
  }
}

// API endpoints for CRUD operations
export async function fetchFromAPI(endpoint: string): Promise<any> {
  console.log(`[DataManager] Fetching from API: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[DataManager] API data received:`, data);
    return data;
  } catch (error) {
    console.error(`[DataManager] Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

export async function postToAPI(endpoint: string, data: any): Promise<any> {
  console.log(`[DataManager] Posting to API: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to post to ${endpoint}`);
    }
    
    const result = await response.json();
    console.log(`[DataManager] API post successful:`, result);
    return result;
  } catch (error) {
    console.error(`[DataManager] Error posting to ${endpoint}:`, error);
    throw error;
  }
}

export async function updateAPI(endpoint: string, data: any): Promise<any> {
  console.log(`[DataManager] Updating API: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update ${endpoint}`);
    }
    
    const result = await response.json();
    console.log(`[DataManager] API update successful:`, result);
    return result;
  } catch (error) {
    console.error(`[DataManager] Error updating ${endpoint}:`, error);
    throw error;
  }
}

export async function deleteFromAPI(endpoint: string): Promise<boolean> {
  console.log(`[DataManager] Deleting from API: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete from ${endpoint}`);
    }
    
    console.log(`[DataManager] API delete successful`);
    return true;
  } catch (error) {
    console.error(`[DataManager] Error deleting from ${endpoint}:`, error);
    throw error;
  }
}