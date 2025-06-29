import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API:knowledge-bases] GET by ID request (demo mode):', params.id);
  
  // Demo mode - return mock data
  const knowledgeBase = {
    id: params.id,
    name: params.id === 'kb_1' ? 'Medical Procedures FAQ' : 'Insurance Coverage',
    description: params.id === 'kb_1' ? 
      'Common questions about medical procedures and aftercare' : 
      'Information about insurance coverage and billing',
    content: { 
      faqs: params.id === 'kb_1' ? [
        { question: 'What is the recovery time?', answer: 'Recovery time varies by procedure, typically 2-4 weeks.', language: 'en' },
        { question: 'Will I need follow-up appointments?', answer: 'Yes, most procedures require at least one follow-up.', language: 'en' }
      ] : [
        { question: 'What insurance do you accept?', answer: 'We accept most major insurance providers including Blue Cross, Aetna, and UnitedHealthcare.', language: 'en' },
        { question: 'How do I verify my coverage?', answer: 'Contact your insurance provider or our billing department for verification.', language: 'en' }
      ]
    },
    languages: params.id === 'kb_1' ? ['en', 'es'] : ['en'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return NextResponse.json({ knowledgeBase });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API:knowledge-bases] PATCH request (demo mode):', params.id);
  
  const body = await req.json();
  
  // Demo mode - return mock response
  const knowledgeBase = {
    id: params.id,
    name: body.name,
    description: body.description,
    content: body.content,
    languages: body.languages,
    created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
    updated_at: new Date().toISOString()
  };
  
  return NextResponse.json({ knowledgeBase });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API:knowledge-bases] DELETE request (demo mode):', params.id);
  
  // Demo mode - return success
  return NextResponse.json({ success: true });
}