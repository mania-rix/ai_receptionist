import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';

/**
 * API route to initialize and manage sample data
 * GET: Returns sample data for the current user
 * POST: Initializes sample data for the current user
 */

export async function GET(req: Request) {
  console.log('[API:sample-data] GET request');
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:sample-data] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let data;
    
    if (category) {
      // Fetch specific category
      console.log(`[API:sample-data] Fetching ${category} data`);
      
      switch (category) {
        case 'kb_articles':
          data = await fetchKnowledgeBaseArticles(supabase, user.id);
          break;
        case 'video_summaries':
          data = await fetchVideoSummaries(supabase, user.id);
          break;
        case 'conversation_templates':
          data = await fetchConversationTemplates(supabase, user.id);
          break;
        case 'compliance_scripts':
          data = await fetchComplianceScripts(supabase, user.id);
          break;
        case 'agent_profiles':
          data = await fetchAgentProfiles(supabase, user.id);
          break;
        case 'customer_interactions':
          data = await fetchCustomerInteractions(supabase, user.id);
          break;
        default:
          return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
    } else {
      // Fetch all categories
      console.log('[API:sample-data] Fetching all sample data');
      
      data = {
        kb_articles: await fetchKnowledgeBaseArticles(supabase, user.id),
        video_summaries: await fetchVideoSummaries(supabase, user.id),
        conversation_templates: await fetchConversationTemplates(supabase, user.id),
        compliance_scripts: await fetchComplianceScripts(supabase, user.id),
        agent_profiles: await fetchAgentProfiles(supabase, user.id),
        customer_interactions: await fetchCustomerInteractions(supabase, user.id)
      };
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API:sample-data] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sample data' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  console.log('[API:sample-data] POST request to initialize sample data');
  try {
    const { category } = await req.json();
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:sample-data] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let result;
    
    if (category) {
      // Initialize specific category
      console.log(`[API:sample-data] Initializing ${category} data`);
      
      switch (category) {
        case 'kb_articles':
          result = await initializeKnowledgeBaseArticles(supabase, user.id);
          break;
        case 'video_summaries':
          result = await initializeVideoSummaries(supabase, user.id);
          break;
        case 'conversation_templates':
          result = await initializeConversationTemplates(supabase, user.id);
          break;
        case 'compliance_scripts':
          result = await initializeComplianceScripts(supabase, user.id);
          break;
        case 'agent_profiles':
          result = await initializeAgentProfiles(supabase, user.id);
          break;
        case 'customer_interactions':
          result = await initializeCustomerInteractions(supabase, user.id);
          break;
        default:
          return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
    } else {
      // Initialize all categories
      console.log('[API:sample-data] Initializing all sample data');
      
      result = {
        kb_articles: await initializeKnowledgeBaseArticles(supabase, user.id),
        video_summaries: await initializeVideoSummaries(supabase, user.id),
        conversation_templates: await initializeConversationTemplates(supabase, user.id),
        compliance_scripts: await initializeComplianceScripts(supabase, user.id),
        agent_profiles: await initializeAgentProfiles(supabase, user.id),
        customer_interactions: await initializeCustomerInteractions(supabase, user.id)
      };
    }
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[API:sample-data] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize sample data' },
      { status: 500 }
    );
  }
}

// Helper functions to fetch and initialize sample data
async function fetchKnowledgeBaseArticles(supabase: any, userId: string) {
  // First try to fetch from knowledge_bases table
  const { data, error } = await supabase
    .from('knowledge_bases')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data || data.length === 0) {
    // Return mock data if no real data exists
    return getMockKnowledgeBaseArticles();
  }
  
  return data;
}

async function fetchVideoSummaries(supabase: any, userId: string) {
  // First try to fetch from video_summaries table
  const { data, error } = await supabase
    .from('video_summaries')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data || data.length === 0) {
    // Return mock data if no real data exists
    return getMockVideoSummaries();
  }
  
  return data;
}

async function fetchConversationTemplates(supabase: any, userId: string) {
  // First try to fetch from conversation_flows table
  const { data, error } = await supabase
    .from('conversation_flows')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data || data.length === 0) {
    // Return mock data if no real data exists
    return getMockConversationTemplates();
  }
  
  return data;
}

async function fetchComplianceScripts(supabase: any, userId: string) {
  // First try to fetch from compliance_scripts table
  const { data, error } = await supabase
    .from('compliance_scripts')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data || data.length === 0) {
    // Return mock data if no real data exists
    return getMockComplianceScripts();
  }
  
  return data;
}

async function fetchAgentProfiles(supabase: any, userId: string) {
  // First try to fetch from agents table
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data || data.length === 0) {
    // Return mock data if no real data exists
    return getMockAgentProfiles();
  }
  
  return data;
}

async function fetchCustomerInteractions(supabase: any, userId: string) {
  // First try to fetch from calls table
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data || data.length === 0) {
    // Return mock data if no real data exists
    return getMockCustomerInteractions();
  }
  
  return data;
}

// Initialize functions - these would insert sample data into the database
async function initializeKnowledgeBaseArticles(supabase: any, userId: string) {
  const mockData = getMockKnowledgeBaseArticles();
  
  // Insert mock data into knowledge_bases table
  const { data, error } = await supabase
    .from('knowledge_bases')
    .insert(mockData.map(item => ({
      ...item,
      user_id: userId
    })))
    .select();
  
  if (error) {
    console.error('[API:sample-data] Error initializing knowledge base articles:', error);
    return mockData;
  }
  
  return data;
}

async function initializeVideoSummaries(supabase: any, userId: string) {
  // For demo purposes, we'll just return mock data
  // In a real implementation, this would insert data into the database
  return getMockVideoSummaries();
}

async function initializeConversationTemplates(supabase: any, userId: string) {
  const mockData = getMockConversationTemplates();
  
  // Insert mock data into conversation_flows table
  const { data, error } = await supabase
    .from('conversation_flows')
    .insert(mockData.map(item => ({
      name: item.name,
      description: item.description,
      flow_data: { nodes: item.nodes },
      user_id: userId
    })))
    .select();
  
  if (error) {
    console.error('[API:sample-data] Error initializing conversation templates:', error);
    return mockData;
  }
  
  return data;
}

async function initializeComplianceScripts(supabase: any, userId: string) {
  const mockData = getMockComplianceScripts();
  
  // Insert mock data into compliance_scripts table
  const { data, error } = await supabase
    .from('compliance_scripts')
    .insert(mockData.map(item => ({
      name: item.name,
      required_phrases: item.required_phrases,
      description: item.content,
      user_id: userId
    })))
    .select();
  
  if (error) {
    console.error('[API:sample-data] Error initializing compliance scripts:', error);
    return mockData;
  }
  
  return data;
}

async function initializeAgentProfiles(supabase: any, userId: string) {
  const mockData = getMockAgentProfiles();
  
  // Insert mock data into agents table
  const { data, error } = await supabase
    .from('agents')
    .insert(mockData.map(item => ({
      name: item.name,
      voice: item.voice,
      greeting: item.greeting,
      temperature: 0.7,
      interruption_sensitivity: 0.5,
      user_id: userId
    })))
    .select();
  
  if (error) {
    console.error('[API:sample-data] Error initializing agent profiles:', error);
    return mockData;
  }
  
  return data;
}

async function initializeCustomerInteractions(supabase: any, userId: string) {
  // For demo purposes, we'll just return mock data
  // In a real implementation, this would insert data into the database
  return getMockCustomerInteractions();
}

// Mock data generators
function getMockKnowledgeBaseArticles() {
  return [
    {
      id: '1',
      title: 'Getting Started with BlvckWall AI',
      content: 'Welcome to BlvckWall AI! This guide will help you get started with our platform...',
      category: 'onboarding',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Setting Up Your First AI Agent',
      content: 'AI agents are the core of the BlvckWall platform. To create your first agent...',
      category: 'agents',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Understanding Call Analytics',
      content: 'Call analytics provide insights into your AI-powered conversations...',
      category: 'analytics',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'HIPAA Compliance Guide',
      content: 'Ensuring HIPAA compliance is critical for healthcare organizations...',
      category: 'compliance',
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      title: 'Voice Customization Options',
      content: 'BlvckWall AI offers several voice customization options...',
      category: 'voices',
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      title: 'Integrating with Your CRM',
      content: 'BlvckWall AI can integrate with popular CRM systems...',
      category: 'integrations',
      created_at: new Date().toISOString()
    },
    {
      id: '7',
      title: 'Conversation Flow Design Best Practices',
      content: 'Designing effective conversation flows is key to successful AI interactions...',
      category: 'conversation-design',
      created_at: new Date().toISOString()
    },
    {
      id: '8',
      title: 'Troubleshooting Common Issues',
      content: 'This article addresses common issues you might encounter...',
      category: 'support',
      created_at: new Date().toISOString()
    },
    {
      id: '9',
      title: 'Security Best Practices',
      content: 'Securing your BlvckWall AI implementation is critical...',
      category: 'security',
      created_at: new Date().toISOString()
    },
    {
      id: '10',
      title: 'API Documentation',
      content: 'The BlvckWall AI API allows you to programmatically interact with our platform...',
      category: 'developers',
      created_at: new Date().toISOString()
    }
  ];
}

function getMockVideoSummaries() {
  return [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
      id: '4',
      title: 'Medication Review',
      timestamps: [
        { time: '00:30', label: 'Current Medications' },
        { time: '01:45', label: 'Side Effects Discussion' },
        { time: '03:20', label: 'Prescription Updates' }
      ],
      summary: 'Comprehensive review of patient\'s medication regimen...',
      created_at: new Date().toISOString()
    },
    {
      id: '5',
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
}

function getMockConversationTemplates() {
  return [
    {
      id: '1',
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
      id: '2',
      name: 'Insurance Verification',
      description: 'Template for verifying patient insurance',
      nodes: [
        { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
        { id: 'greeting', type: 'message', content: 'I\'ll help you verify your insurance coverage. Can you provide your insurance provider name?', position: { x: 100, y: 200 } }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Medication Refill',
      description: 'Template for handling medication refill requests',
      nodes: [
        { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
        { id: 'greeting', type: 'message', content: 'I understand you need a medication refill. Which medication do you need refilled?', position: { x: 100, y: 200 } }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'New Patient Intake',
      description: 'Template for new patient registration',
      nodes: [
        { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
        { id: 'greeting', type: 'message', content: 'Welcome! I\'ll help you register as a new patient. Let\'s start with your full name.', position: { x: 100, y: 200 } }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Billing Inquiry',
      description: 'Template for handling billing questions',
      nodes: [
        { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
        { id: 'greeting', type: 'message', content: 'I can help with your billing inquiry. What specific question do you have about your bill?', position: { x: 100, y: 200 } }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Lab Results',
      description: 'Template for discussing lab results',
      nodes: [
        { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
        { id: 'greeting', type: 'message', content: 'I\'m calling about your recent lab results. For security, can you verify your date of birth?', position: { x: 100, y: 200 } }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Appointment Reminder',
      description: 'Template for appointment reminders',
      nodes: [
        { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
        { id: 'greeting', type: 'message', content: 'This is a reminder about your upcoming appointment on [date] at [time]. Would you like to confirm this appointment?', position: { x: 100, y: 200 } }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Post-Procedure Follow-up',
      description: 'Template for post-procedure check-ins',
      nodes: [
        { id: 'start', type: 'start', content: 'Conversation Start', position: { x: 100, y: 100 } },
        { id: 'greeting', type: 'message', content: 'I\'m calling to follow up after your recent procedure. How are you feeling today?', position: { x: 100, y: 200 } }
      ],
      created_at: new Date().toISOString()
    }
  ];
}

function getMockComplianceScripts() {
  return [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
      id: '4',
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
      id: '5',
      name: 'Prescription Refill Verification',
      content: 'For your safety and to comply with regulations, I need to verify your identity before processing this prescription refill. Can you confirm your full name, date of birth, and the medication you\'re requesting?',
      category: 'pharmacy',
      required_phrases: [
        'for your safety',
        'comply with regulations',
        'verify your identity'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '6',
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
      id: '7',
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
      id: '8',
      name: 'Mental Health Crisis Protocol',
      content: 'If you\'re experiencing thoughts of harming yourself or others, please be aware that I'm required by law to take steps to ensure your safety, which may include contacting emergency services. Do you understand?',
      category: 'mental-health',
      required_phrases: [
        'required by law',
        'ensure your safety',
        'contacting emergency services'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '9',
      name: 'Billing Authorization',
      content: 'I\'m going to ask for your payment information. By providing this information, you authorize us to charge your account for the services discussed. Do you consent to this authorization?',
      category: 'billing',
      required_phrases: [
        'payment information',
        'authorize us to charge',
        'consent to this authorization'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '10',
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
      id: '11',
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
      id: '12',
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
}

function getMockAgentProfiles() {
  return [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      voice: 'serena',
      greeting: 'Hello, I\'m Dr. Sarah Johnson. How can I assist you today?',
      specialty: 'General Medicine',
      contact: { email: 'sarah.johnson@blvckwall.ai', phone: '+1 (555) 123-4567' },
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      voice: 'morgan',
      greeting: 'Hi there, this is Dr. Michael Chen. What brings you in today?',
      specialty: 'Cardiology',
      contact: { email: 'michael.chen@blvckwall.ai', phone: '+1 (555) 234-5678' },
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      voice: 'ava',
      greeting: 'Hello, I\'m Dr. Rodriguez. How may I help you today?',
      specialty: 'Pediatrics',
      contact: { email: 'emily.rodriguez@blvckwall.ai', phone: '+1 (555) 345-6789' },
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      voice: 'ryan',
      greeting: 'Good day, this is Dr. Wilson speaking. How can I be of assistance?',
      specialty: 'Neurology',
      contact: { email: 'james.wilson@blvckwall.ai', phone: '+1 (555) 456-7890' },
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Dr. Aisha Patel',
      voice: 'sophia',
      greeting: 'Hello, Dr. Patel here. What can I do for you today?',
      specialty: 'Dermatology',
      contact: { email: 'aisha.patel@blvckwall.ai', phone: '+1 (555) 567-8901' },
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Dr. Robert Kim',
      voice: 'james',
      greeting: 'Hello, this is Dr. Kim. How may I assist you today?',
      specialty: 'Orthopedics',
      contact: { email: 'robert.kim@blvckwall.ai', phone: '+1 (555) 678-9012' },
      created_at: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Dr. Lisa Thompson',
      voice: 'serena',
      greeting: 'Hi, Dr. Thompson speaking. What brings you to our practice today?',
      specialty: 'Psychiatry',
      contact: { email: 'lisa.thompson@blvckwall.ai', phone: '+1 (555) 789-0123' },
      created_at: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Dr. David Nguyen',
      voice: 'morgan',
      greeting: 'Hello, I\'m Dr. Nguyen. How can I help you today?',
      specialty: 'Gastroenterology',
      contact: { email: 'david.nguyen@blvckwall.ai', phone: '+1 (555) 890-1234' },
      created_at: new Date().toISOString()
    }
  ];
}

function getMockCustomerInteractions() {
  const interactions = [];
  const interactionTypes = ['call', 'email', 'chat', 'in-person'];
  const statuses = ['completed', 'scheduled', 'cancelled', 'no-show'];
  
  for (let i = 1; i <= 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    interactions.push({
      id: `${i}`,
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
}