import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[API:knowledge-bases] GET request (demo mode)');
  
  // Demo mode - return mock data
  const knowledgeBases = [
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
  
  return NextResponse.json({ knowledgeBases });
}

export async function POST(req: Request) {
  console.log('[API:knowledge-bases] POST request (demo mode)');
  
  const body = await req.json();
  
  // Demo mode - return mock response
  const knowledgeBase = {
    id: `kb_${Date.now()}`,
    user_id: 'demo-user-id',
    name: body.name,
    description: body.description,
    content: body.content || {},
    languages: body.languages || ['en'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return NextResponse.json({ knowledgeBase });
}